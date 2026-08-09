(function () {
  "use strict";

  var STORAGE_KEY = "form-3d-studio-settings-v3";
  var defaults = {
    mode: "keychain",
    keyWidth: 52,
    keyHeight: 30,
    keyThickness: 3,
    holeSize: 5,
    reliefHeight: 1.2,
    threshold: 48,
    detail: 28,
    invert: false,
    boxWidth: 76,
    boxDepth: 54,
    boxHeight: 34,
    boxCornerRadius: 7,
    boxWall: 2.4,
    boxBottom: 2.4,
    boxClearance: 0.35,
    boxLid: true,
    boxHinges: true,
    boxLatch: true,
    boxLidThickness: 2.6,
    boxLidAngle: 68,
    boxHingeDiameter: 6,
    cylinderDiameter: 36,
    cylinderHeight: 18,
    cylinderSides: 48,
    color: "#0a84ff"
  };

  var state = loadState();
  var uploadedImage = null;
  var uploadedName = "";
  var model = null;
  var rebuildTimer = 0;
  var toastTimer = 0;
  var installPrompt = null;
  var view = { yaw: -0.62, pitch: -0.9, zoom: 1, wireframe: false };

  var canvas = document.getElementById("viewport");
  var canvasWrap = document.getElementById("canvas-wrap");
  var gl = canvas.getContext("webgl", { antialias: true, alpha: true, depth: true });
  var ctx = gl ? null : canvas.getContext("2d");
  var webglRenderer = null;
  if (gl) canvasWrap.classList.add("webgl-renderer");

  function loadState() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      var merged = Object.assign({}, defaults, saved);
      if (!["keychain", "box", "cylinder"].includes(merged.mode)) merged.mode = "keychain";
      return merged;
    } catch (error) {
      return Object.assign({}, defaults);
    }
  }

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (error) { /* Private mode can reject storage. */ }
  }

  function Solid(name, color) {
    this.name = name;
    this.color = color;
    this.vertices = [];
    this.faces = [];
  }

  Solid.prototype.vertex = function (x, y, z) {
    this.vertices.push([x, y, z]);
    return this.vertices.length - 1;
  };

  Solid.prototype.triangle = function (a, b, c) {
    this.faces.push([a, b, c]);
  };

  Solid.prototype.quad = function (a, b, c, d) {
    this.triangle(a, b, c);
    this.triangle(a, c, d);
  };

  function addBox(solid, cx, cy, z0, width, depth, height) {
    var x0 = cx - width / 2;
    var x1 = cx + width / 2;
    var y0 = cy - depth / 2;
    var y1 = cy + depth / 2;
    var z1 = z0 + height;
    var v = [
      solid.vertex(x0, y0, z0), solid.vertex(x1, y0, z0),
      solid.vertex(x1, y1, z0), solid.vertex(x0, y1, z0),
      solid.vertex(x0, y0, z1), solid.vertex(x1, y0, z1),
      solid.vertex(x1, y1, z1), solid.vertex(x0, y1, z1)
    ];
    solid.triangle(v[0], v[2], v[1]); solid.triangle(v[0], v[3], v[2]);
    solid.triangle(v[4], v[5], v[6]); solid.triangle(v[4], v[6], v[7]);
    solid.quad(v[0], v[1], v[5], v[4]);
    solid.quad(v[1], v[2], v[6], v[5]);
    solid.quad(v[2], v[3], v[7], v[6]);
    solid.quad(v[3], v[0], v[4], v[7]);
  }

  function makeBoxSolid(name, color, cx, cy, z0, width, depth, height) {
    var solid = new Solid(name, color);
    addBox(solid, cx, cy, z0, width, depth, height);
    return solid;
  }

  function hollowRoundedBox(name, color, width, depth, height, wall, floor, radius, cornerSteps) {
    var solid = new Solid(name, color);
    var outer = roundedRectangle(width, depth, radius, cornerSteps);
    var inner = roundedRectangle(
      Math.max(4, width - wall * 2),
      Math.max(4, depth - wall * 2),
      Math.max(0.8, radius - wall),
      cornerSteps
    );
    var outerBottom = outer.map(function (point) { return solid.vertex(point[0], point[1], 0); });
    var outerTop = outer.map(function (point) { return solid.vertex(point[0], point[1], height); });
    var innerFloor = inner.map(function (point) { return solid.vertex(point[0], point[1], floor); });
    var innerTop = inner.map(function (point) { return solid.vertex(point[0], point[1], height); });
    var bottomCentre = solid.vertex(0, 0, 0);
    var floorCentre = solid.vertex(0, 0, floor);

    for (var i = 0; i < outer.length; i += 1) {
      var next = (i + 1) % outer.length;
      solid.triangle(bottomCentre, outerBottom[next], outerBottom[i]);
      solid.triangle(floorCentre, innerFloor[i], innerFloor[next]);
      solid.quad(outerBottom[i], outerBottom[next], outerTop[next], outerTop[i]);
      solid.triangle(outerTop[i], outerTop[next], innerTop[next]);
      solid.triangle(outerTop[i], innerTop[next], innerTop[i]);
      solid.quad(innerFloor[i], innerTop[i], innerTop[next], innerFloor[next]);
    }
    return solid;
  }

  function roundedFrame(name, color, width, depth, wall, z0, z1, radius, cornerSteps) {
    var solid = new Solid(name, color);
    var outer = roundedRectangle(width, depth, radius, cornerSteps);
    var inner = roundedRectangle(
      Math.max(4, width - wall * 2),
      Math.max(4, depth - wall * 2),
      Math.max(0.7, radius - wall),
      cornerSteps
    );
    var outerBottom = outer.map(function (point) { return solid.vertex(point[0], point[1], z0); });
    var outerTop = outer.map(function (point) { return solid.vertex(point[0], point[1], z1); });
    var innerBottom = inner.map(function (point) { return solid.vertex(point[0], point[1], z0); });
    var innerTop = inner.map(function (point) { return solid.vertex(point[0], point[1], z1); });

    for (var i = 0; i < outer.length; i += 1) {
      var next = (i + 1) % outer.length;
      solid.quad(outerBottom[i], outerBottom[next], outerTop[next], outerTop[i]);
      solid.quad(innerBottom[i], innerTop[i], innerTop[next], innerBottom[next]);
      solid.triangle(outerTop[i], outerTop[next], innerTop[next]);
      solid.triangle(outerTop[i], innerTop[next], innerTop[i]);
      solid.triangle(outerBottom[i], innerBottom[next], outerBottom[next]);
      solid.triangle(outerBottom[i], innerBottom[i], innerBottom[next]);
    }
    return solid;
  }

  function cylinderAlongX(name, color, cx, cy, cz, length, radius, segments) {
    var solid = new Solid(name, color);
    var x0 = cx - length / 2;
    var x1 = cx + length / 2;
    var left = [];
    var right = [];
    for (var i = 0; i < segments; i += 1) {
      var angle = Math.PI * 2 * i / segments;
      var y = cy + Math.cos(angle) * radius;
      var z = cz + Math.sin(angle) * radius;
      left.push(solid.vertex(x0, y, z));
      right.push(solid.vertex(x1, y, z));
    }
    var leftCentre = solid.vertex(x0, cy, cz);
    var rightCentre = solid.vertex(x1, cy, cz);
    for (var j = 0; j < segments; j += 1) {
      var next = (j + 1) % segments;
      solid.triangle(leftCentre, left[next], left[j]);
      solid.triangle(rightCentre, right[j], right[next]);
      solid.quad(left[j], left[next], right[next], right[j]);
    }
    return solid;
  }

  function transformSolid(solid, transform) {
    solid.vertices = solid.vertices.map(transform);
    return solid;
  }

  function rotateSolidAboutX(solid, pivotY, pivotZ, angleDegrees) {
    var angle = angleDegrees * Math.PI / 180;
    var cosine = Math.cos(angle);
    var sine = Math.sin(angle);
    return transformSolid(solid, function (vertex) {
      var y = vertex[1] - pivotY;
      var z = vertex[2] - pivotZ;
      return [
        vertex[0],
        pivotY + cosine * y - sine * z,
        pivotZ + sine * y + cosine * z
      ];
    });
  }

  function extrudeConvex(name, color, contour, z0, z1) {
    var solid = new Solid(name, color);
    var bottom = contour.map(function (p) { return solid.vertex(p[0], p[1], z0); });
    var top = contour.map(function (p) { return solid.vertex(p[0], p[1], z1); });
    var centre = contour.reduce(function (sum, p) { return [sum[0] + p[0], sum[1] + p[1]]; }, [0, 0]);
    centre[0] /= contour.length;
    centre[1] /= contour.length;
    var bottomCentre = solid.vertex(centre[0], centre[1], z0);
    var topCentre = solid.vertex(centre[0], centre[1], z1);
    for (var i = 0; i < contour.length; i += 1) {
      var next = (i + 1) % contour.length;
      solid.triangle(bottomCentre, bottom[next], bottom[i]);
      solid.triangle(topCentre, top[i], top[next]);
      solid.quad(bottom[i], bottom[next], top[next], top[i]);
    }
    return solid;
  }

  function extrudeRing(name, color, cx, cy, outerRadius, innerRadius, z0, z1, segments) {
    var solid = new Solid(name, color);
    var bo = [], bi = [], to = [], ti = [];
    for (var i = 0; i < segments; i += 1) {
      var angle = Math.PI * 2 * i / segments;
      var cosine = Math.cos(angle);
      var sine = Math.sin(angle);
      bo.push(solid.vertex(cx + cosine * outerRadius, cy + sine * outerRadius, z0));
      bi.push(solid.vertex(cx + cosine * innerRadius, cy + sine * innerRadius, z0));
      to.push(solid.vertex(cx + cosine * outerRadius, cy + sine * outerRadius, z1));
      ti.push(solid.vertex(cx + cosine * innerRadius, cy + sine * innerRadius, z1));
    }
    for (var j = 0; j < segments; j += 1) {
      var n = (j + 1) % segments;
      solid.triangle(to[j], to[n], ti[n]);
      solid.triangle(to[j], ti[n], ti[j]);
      solid.triangle(bo[j], bi[n], bo[n]);
      solid.triangle(bo[j], bi[j], bi[n]);
      solid.quad(bo[j], bo[n], to[n], to[j]);
      solid.quad(bi[j], ti[j], ti[n], bi[n]);
    }
    return solid;
  }

  function roundedRectangle(width, height, radius, cornerSteps) {
    var r = Math.min(radius, width / 2, height / 2);
    var centres = [
      [width / 2 - r, height / 2 - r, 0],
      [-width / 2 + r, height / 2 - r, Math.PI / 2],
      [-width / 2 + r, -height / 2 + r, Math.PI],
      [width / 2 - r, -height / 2 + r, Math.PI * 1.5]
    ];
    var points = [];
    centres.forEach(function (corner) {
      for (var i = 0; i < cornerSteps; i += 1) {
        var angle = corner[2] + (Math.PI / 2) * i / cornerSteps;
        points.push([corner[0] + Math.cos(angle) * r, corner[1] + Math.sin(angle) * r]);
      }
    });
    return points;
  }

  function circle(radius, segments, cx, cy) {
    var points = [];
    for (var i = 0; i < segments; i += 1) {
      var angle = Math.PI * 2 * i / segments;
      points.push([(cx || 0) + Math.cos(angle) * radius, (cy || 0) + Math.sin(angle) * radius]);
    }
    return points;
  }

  function createMask() {
    var width = Math.round(state.detail);
    var height = Math.max(8, Math.round(width * 0.52));
    var offscreen = document.createElement("canvas");
    offscreen.width = width;
    offscreen.height = height;
    var maskContext = offscreen.getContext("2d", { willReadFrequently: true });
    maskContext.clearRect(0, 0, width, height);

    if (uploadedImage) {
      var sourceAspect = uploadedImage.naturalWidth / uploadedImage.naturalHeight;
      var targetAspect = width / height;
      var drawWidth, drawHeight, x, y;
      if (sourceAspect > targetAspect) {
        drawWidth = width;
        drawHeight = width / sourceAspect;
        x = 0;
        y = (height - drawHeight) / 2;
      } else {
        drawHeight = height;
        drawWidth = height * sourceAspect;
        x = (width - drawWidth) / 2;
        y = 0;
      }
      maskContext.drawImage(uploadedImage, x, y, drawWidth, drawHeight);
    } else {
      maskContext.fillStyle = "#000";
      maskContext.textAlign = "center";
      maskContext.textBaseline = "middle";
      maskContext.font = "900 " + Math.round(height * 0.78) + "px -apple-system, BlinkMacSystemFont, sans-serif";
      maskContext.fillText("3D", width / 2, height / 2 + 1);
    }

    var pixels = maskContext.getImageData(0, 0, width, height).data;
    var rows = [];
    var cutoff = state.threshold / 100 * 255;
    for (var row = 0; row < height; row += 1) {
      var values = [];
      for (var col = 0; col < width; col += 1) {
        var index = (row * width + col) * 4;
        var alpha = pixels[index + 3];
        var luminance = pixels[index] * 0.2126 + pixels[index + 1] * 0.7152 + pixels[index + 2] * 0.0722;
        var dark = luminance < cutoff;
        values.push(alpha > 24 && (state.invert ? !dark : dark));
      }
      rows.push(values);
    }
    return { width: width, height: height, rows: rows };
  }

  function maskRectangles(mask) {
    var completed = [];
    var active = new Map();
    for (var row = 0; row < mask.height; row += 1) {
      var runs = [];
      var start = -1;
      for (var col = 0; col <= mask.width; col += 1) {
        var on = col < mask.width && mask.rows[row][col];
        if (on && start < 0) start = col;
        if (!on && start >= 0) {
          runs.push({ start: start, length: col - start });
          start = -1;
        }
      }
      var nextActive = new Map();
      runs.forEach(function (run) {
        var key = run.start + ":" + run.length;
        var rectangle = active.get(key) || { start: run.start, length: run.length, rowStart: row, rowEnd: row };
        rectangle.rowEnd = row;
        nextActive.set(key, rectangle);
      });
      active.forEach(function (rectangle, key) {
        if (!nextActive.has(key)) completed.push(rectangle);
      });
      active = nextActive;
    }
    active.forEach(function (rectangle) { completed.push(rectangle); });
    return completed;
  }

  function buildKeychain() {
    var solids = [];
    var corner = Math.min(6, state.keyHeight * 0.24);
    solids.push(extrudeConvex("Keychain base", state.color, roundedRectangle(state.keyWidth, state.keyHeight, corner, 7), 0, state.keyThickness));

    var innerRadius = state.holeSize / 2;
    var outerRadius = innerRadius + Math.max(1.8, state.keyThickness * 0.68);
    var ringX = -state.keyWidth / 2 - outerRadius * 0.54;
    solids.push(extrudeRing("Keyring eye", state.color, ringX, 0, outerRadius, innerRadius, 0, state.keyThickness, 40));

    var mask = createMask();
    var rectangles = maskRectangles(mask);
    var cell = Math.min(state.keyWidth * 0.64 / mask.width, state.keyHeight * 0.62 / mask.height);
    var artWidth = mask.width * cell;
    var artHeight = mask.height * cell;
    var offsetX = state.keyWidth * 0.055;
    rectangles.forEach(function (rectangle, index) {
      var width = rectangle.length * cell + 0.025;
      var depth = (rectangle.rowEnd - rectangle.rowStart + 1) * cell + 0.025;
      var x = offsetX - artWidth / 2 + (rectangle.start + rectangle.length / 2) * cell;
      var y = artHeight / 2 - (rectangle.rowStart + (rectangle.rowEnd - rectangle.rowStart + 1) / 2) * cell;
      var relief = new Solid("Artwork " + (index + 1), mixColour(state.color, "#ffffff", 0.16));
      addBox(relief, x, y, state.keyThickness - 0.025, width, depth, state.reliefHeight + 0.025);
      solids.push(relief);
    });
    return { name: "Image keychain", solids: solids };
  }

  function buildBox() {
    var width = state.boxWidth;
    var depth = state.boxDepth;
    var height = state.boxHeight;
    var wall = Math.min(state.boxWall, width / 7, depth / 7);
    var floor = Math.min(state.boxBottom, height / 3);
    var radius = Math.min(state.boxCornerRadius, width / 4, depth / 4);
    var solids = [hollowRoundedBox("Rounded box body", state.color, width, depth, height, wall, floor, radius, 8)];

    if (!state.boxLid) return { name: "Open rounded box", solids: solids };

    var clearance = state.boxClearance;
    var lidThickness = state.boxLidThickness;
    var hingeRadius = state.boxHingeDiameter / 2;
    var pivotY = depth / 2 + (state.boxHinges ? hingeRadius * 0.46 : 0);
    var pivotZ = height + clearance + lidThickness / 2;
    var lidColor = mixColour(state.color, "#ffffff", 0.11);
    var trimColor = mixColour(state.color, "#ffffff", 0.24);
    var hardwareColor = mixColour(state.color, "#202126", 0.48);
    var pinColor = "#9da1aa";
    var lidParts = [];

    lidParts.push(extrudeConvex(
      "Fitted cover",
      lidColor,
      roundedRectangle(width + 0.8, depth + 0.8, radius + 0.35, 8),
      pivotZ - lidThickness / 2,
      pivotZ + lidThickness / 2
    ));

    var lipWidth = Math.max(8, width - wall * 2 - clearance * 2);
    var lipDepth = Math.max(8, depth - wall * 2 - clearance * 2);
    var lipWall = Math.min(1.6, Math.max(1.05, wall * 0.58));
    var lipHeight = Math.min(3.2, Math.max(2, height * 0.1));
    lidParts.push(roundedFrame(
      "Cover locating lip",
      mixColour(state.color, "#000000", 0.08),
      lipWidth,
      lipDepth,
      lipWall,
      pivotZ - lidThickness / 2 - lipHeight,
      pivotZ - lidThickness / 2 + 0.04,
      Math.max(1.3, radius - wall - clearance),
      8
    ));

    if (width > 56 && depth > 42) {
      lidParts.push(extrudeConvex(
        "Cover detail panel",
        trimColor,
        roundedRectangle(width - 10, depth - 10, Math.max(2.5, radius - 2.5), 7),
        pivotZ + lidThickness / 2 - 0.04,
        pivotZ + lidThickness / 2 + 0.52
      ));
    }

    if (state.boxHinges) {
      var hingeSpan = width * 0.64;
      var centreLength = Math.max(12, width * 0.22);
      var knuckleGap = Math.max(0.65, clearance * 2.2);
      var sideLength = Math.max(7, (hingeSpan - centreLength - knuckleGap * 2) / 2);
      var sideOffset = centreLength / 2 + knuckleGap + sideLength / 2;

      solids.push(cylinderAlongX("Left body hinge", hardwareColor, -sideOffset, pivotY, pivotZ, sideLength, hingeRadius, 28));
      solids.push(cylinderAlongX("Right body hinge", hardwareColor, sideOffset, pivotY, pivotZ, sideLength, hingeRadius, 28));
      solids.push(cylinderAlongX("Cover hinge", lidColor, 0, pivotY, pivotZ, centreLength, hingeRadius, 28));
      solids.push(cylinderAlongX("Hinge pin", pinColor, 0, pivotY, pivotZ, hingeSpan + 1.4, hingeRadius * 0.34, 24));

      var bridgeDepth = Math.max(hingeRadius * 0.9, pivotY - depth / 2 + hingeRadius * 0.55);
      lidParts.push(makeBoxSolid(
        "Cover hinge bridge",
        lidColor,
        0,
        depth / 2 + bridgeDepth / 2 - 0.2,
        pivotZ - lidThickness * 0.36,
        centreLength * 0.82,
        bridgeDepth,
        lidThickness * 0.72
      ));
    }

    if (state.boxLatch) {
      var latchWidth = clamp(width * 0.18, 11, 19);
      var catchDepth = Math.max(2.5, wall * 1.15);
      solids.push(makeBoxSolid(
        "Latch catch",
        hardwareColor,
        0,
        -depth / 2 - catchDepth * 0.24,
        height - 7.5,
        latchWidth,
        catchDepth,
        6.3
      ));
      lidParts.push(makeBoxSolid(
        "Cover latch arm",
        lidColor,
        0,
        -depth / 2 - 0.9,
        pivotZ - lidThickness / 2 - 4.8,
        latchWidth * 0.72,
        2.5,
        lidThickness + 4.8
      ));
      lidParts.push(makeBoxSolid(
        "Latch thumb tab",
        trimColor,
        0,
        -depth / 2 - 2.2,
        pivotZ - lidThickness / 2 - 2.1,
        latchWidth * 0.48,
        1.1,
        2.8
      ));
    }

    var openingAngle = -state.boxLidAngle;
    lidParts.forEach(function (part) {
      rotateSolidAboutX(part, pivotY, pivotZ, openingAngle);
      solids.push(part);
    });

    var name = state.boxHinges ? "Hinged storage box" : "Fitted storage box";
    if (state.boxLatch) name = state.boxHinges ? "Hinged latch box" : "Latching storage box";
    return { name: name, solids: solids };
  }

  function buildCylinder() {
    var contour = circle(state.cylinderDiameter / 2, Math.round(state.cylinderSides), 0, 0);
    return { name: "Simple cylinder", solids: [extrudeConvex("Cylinder", state.color, contour, 0, state.cylinderHeight)] };
  }

  function buildModel() {
    if (state.mode === "box") model = buildBox();
    else if (state.mode === "cylinder") model = buildCylinder();
    else model = buildKeychain();
    model.bounds = calculateBounds(model);
    updateStats();
    render();
  }

  function calculateBounds(currentModel) {
    var min = [Infinity, Infinity, Infinity];
    var max = [-Infinity, -Infinity, -Infinity];
    currentModel.solids.forEach(function (solid) {
      solid.vertices.forEach(function (vertex) {
        for (var axis = 0; axis < 3; axis += 1) {
          min[axis] = Math.min(min[axis], vertex[axis]);
          max[axis] = Math.max(max[axis], vertex[axis]);
        }
      });
    });
    return { min: min, max: max, size: [max[0] - min[0], max[1] - min[1], max[2] - min[2]] };
  }

  function scheduleBuild() {
    clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(buildModel, 40);
  }

  function updateStats() {
    var bounds = model.bounds;
    var triangles = model.solids.reduce(function (total, solid) { return total + solid.faces.length; }, 0);
    document.getElementById("model-title").textContent = model.name;
    document.getElementById("size-stat").textContent = bounds.size.map(function (value) { return formatNumber(value, 1); }).join(" × ") + " mm";
    document.getElementById("triangle-stat").textContent = triangles.toLocaleString();
    document.getElementById("body-stat").textContent = model.solids.length.toLocaleString();
  }

  function rotateVertex(vertex, centre) {
    var x = vertex[0] - centre[0];
    var y = vertex[1] - centre[1];
    var z = vertex[2] - centre[2];
    var cy = Math.cos(view.yaw);
    var sy = Math.sin(view.yaw);
    var cp = Math.cos(view.pitch);
    var sp = Math.sin(view.pitch);
    var yawX = cy * x - sy * y;
    var yawY = sy * x + cy * y;
    return [yawX, cp * yawY - sp * z, sp * yawY + cp * z];
  }

  function render() {
    if (!model || !canvasWrap.clientWidth || !canvasWrap.clientHeight) return;
    var pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    var width = canvasWrap.clientWidth;
    var height = canvasWrap.clientHeight;
    var targetWidth = Math.round(width * pixelRatio);
    var targetHeight = Math.round(height * pixelRatio);
    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }
    if (gl) {
      renderWebGL(width, height, pixelRatio);
      return;
    }
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    drawGrid(width, height);

    var bounds = model.bounds;
    var centre = [
      (bounds.min[0] + bounds.max[0]) / 2,
      (bounds.min[1] + bounds.max[1]) / 2,
      (bounds.min[2] + bounds.max[2]) / 2
    ];
    var span = Math.max(bounds.size[0], bounds.size[1], bounds.size[2] * 1.8, 1);
    var scale = Math.min(width * 0.72, height * 0.70) / span * view.zoom;
    var offsetX = width / 2;
    var offsetY = height / 2 + bounds.size[2] * scale * 0.1;
    var triangles = [];
    var light = normalise([-0.38, -0.46, 0.84]);
    var halfLight = normalise([light[0], light[1], light[2] + 1]);

    drawModelShadow(width, height, offsetX, offsetY, bounds, scale);

    model.solids.forEach(function (solid) {
      var rotated = solid.vertices.map(function (vertex) { return rotateVertex(vertex, centre); });
      solid.faces.forEach(function (face) {
        var a = rotated[face[0]], b = rotated[face[1]], c = rotated[face[2]];
        var normal = faceNormal(a, b, c);
        if (normal[2] < -0.002) return;
        var diffuse = Math.max(0, dot(normal, light));
        var specular = Math.pow(Math.max(0, dot(normal, halfLight)), 18) * 0.18;
        var brightness = clamp(0.48 + diffuse * 0.38 + Math.max(0, normal[2]) * 0.08 + specular, 0.34, 1.03);
        triangles.push({
          points: [a, b, c],
          depth: (a[2] + b[2] + c[2]) / 3,
          colour: shadeColour(solid.color, brightness)
        });
      });
    });

    triangles.sort(function (a, b) { return a.depth - b.depth; });
    ctx.lineJoin = "round";
    triangles.forEach(function (triangle) {
      ctx.beginPath();
      triangle.points.forEach(function (point, index) {
        var x = offsetX + point[0] * scale;
        var y = offsetY - point[1] * scale;
        if (index === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fillStyle = triangle.colour;
      ctx.fill();
      ctx.strokeStyle = triangle.colour;
      ctx.lineWidth = 0.8;
      ctx.stroke();
      if (view.wireframe) {
        ctx.strokeStyle = "rgba(20, 20, 24, 0.38)";
        ctx.lineWidth = 0.72;
        ctx.stroke();
      }
    });
  }

  function initialiseWebGLRenderer() {
    if (webglRenderer) return webglRenderer;
    var vertexSource = [
      "attribute vec3 a_position;",
      "attribute vec3 a_colour;",
      "varying lowp vec3 v_colour;",
      "void main(void) {",
      "  gl_Position = vec4(a_position, 1.0);",
      "  v_colour = a_colour;",
      "}"
    ].join("\n");
    var fragmentSource = [
      "precision mediump float;",
      "varying lowp vec3 v_colour;",
      "void main(void) {",
      "  gl_FragColor = vec4(v_colour, 1.0);",
      "}"
    ].join("\n");

    function shader(type, source) {
      var compiled = gl.createShader(type);
      gl.shaderSource(compiled, source);
      gl.compileShader(compiled);
      if (!gl.getShaderParameter(compiled, gl.COMPILE_STATUS)) {
        throw new Error("3D preview shader error: " + gl.getShaderInfoLog(compiled));
      }
      return compiled;
    }

    var program = gl.createProgram();
    gl.attachShader(program, shader(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error("3D preview link error: " + gl.getProgramInfoLog(program));
    }
    webglRenderer = {
      program: program,
      position: gl.getAttribLocation(program, "a_position"),
      colour: gl.getAttribLocation(program, "a_colour"),
      positionBuffer: gl.createBuffer(),
      colourBuffer: gl.createBuffer()
    };
    return webglRenderer;
  }

  function renderWebGL(width, height, pixelRatio) {
    var renderer = initialiseWebGLRenderer();
    var bounds = model.bounds;
    var centre = [
      (bounds.min[0] + bounds.max[0]) / 2,
      (bounds.min[1] + bounds.max[1]) / 2,
      (bounds.min[2] + bounds.max[2]) / 2
    ];
    var span = Math.max(bounds.size[0], bounds.size[1], bounds.size[2] * 1.8, 1);
    var scale = Math.min(width * 0.72, height * 0.70) / span * view.zoom;
    var offsetX = width / 2;
    var offsetY = height / 2 + bounds.size[2] * scale * 0.1;
    var depthScale = span * 1.35;
    var positions = [];
    var colours = [];
    var linePositions = [];
    var lineColours = [];
    var light = normalise([-0.38, -0.46, 0.84]);
    var halfLight = normalise([light[0], light[1], light[2] + 1]);

    function projected(vertex) {
      return [
        (offsetX + vertex[0] * scale) / width * 2 - 1,
        1 - (offsetY - vertex[1] * scale) / height * 2,
        clamp(-vertex[2] / depthScale, -0.94, 0.94)
      ];
    }

    model.solids.forEach(function (solid) {
      var rotated = solid.vertices.map(function (vertex) { return rotateVertex(vertex, centre); });
      solid.faces.forEach(function (face) {
        var a = rotated[face[0]], b = rotated[face[1]], c = rotated[face[2]];
        var normal = faceNormal(a, b, c);
        var diffuse = Math.max(0, dot(normal, light));
        var specular = Math.pow(Math.max(0, dot(normal, halfLight)), 20) * 0.16;
        var brightness = clamp(0.48 + diffuse * 0.38 + Math.max(0, normal[2]) * 0.08 + specular, 0.34, 1.03);
        var rgb = parseColour(shadeColour(solid.color, brightness)).map(function (channel) { return channel / 255; });
        var projectedFace = [projected(a), projected(b), projected(c)];
        projectedFace.forEach(function (point) {
          positions.push(point[0], point[1], point[2]);
          colours.push(rgb[0], rgb[1], rgb[2]);
        });
        if (view.wireframe) {
          [[0, 1], [1, 2], [2, 0]].forEach(function (edge) {
            var start = projectedFace[edge[0]];
            var end = projectedFace[edge[1]];
            linePositions.push(start[0], start[1], start[2] - 0.0015, end[0], end[1], end[2] - 0.0015);
            lineColours.push(0.08, 0.09, 0.11, 0.08, 0.09, 0.11);
          });
        }
      });
    });

    gl.viewport(0, 0, Math.round(width * pixelRatio), Math.round(height * pixelRatio));
    gl.clearColor(0, 0, 0, 0);
    gl.clearDepth(1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.disable(gl.CULL_FACE);
    gl.useProgram(renderer.program);

    gl.bindBuffer(gl.ARRAY_BUFFER, renderer.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(renderer.position);
    gl.vertexAttribPointer(renderer.position, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, renderer.colourBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colours), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(renderer.colour);
    gl.vertexAttribPointer(renderer.colour, 3, gl.FLOAT, false, 0, 0);
    if (view.wireframe) {
      gl.enable(gl.POLYGON_OFFSET_FILL);
      gl.polygonOffset(1, 1);
    }
    gl.drawArrays(gl.TRIANGLES, 0, positions.length / 3);
    gl.disable(gl.POLYGON_OFFSET_FILL);

    if (view.wireframe && linePositions.length) {
      gl.bindBuffer(gl.ARRAY_BUFFER, renderer.positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(linePositions), gl.DYNAMIC_DRAW);
      gl.vertexAttribPointer(renderer.position, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, renderer.colourBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lineColours), gl.DYNAMIC_DRAW);
      gl.vertexAttribPointer(renderer.colour, 3, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.LINES, 0, linePositions.length / 3);
    }
  }

  function drawModelShadow(width, height, offsetX, offsetY, bounds, scale) {
    var shadowWidth = Math.min(width * 0.62, Math.max(80, bounds.size[0] * scale * 0.78));
    var shadowHeight = Math.min(height * 0.12, Math.max(18, bounds.size[1] * scale * 0.13));
    var centreY = Math.min(height * 0.82, offsetY + bounds.size[1] * scale * 0.2);
    ctx.save();
    ctx.translate(offsetX, centreY);
    ctx.scale(1, shadowHeight / shadowWidth);
    var gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, shadowWidth / 2);
    gradient.addColorStop(0, "rgba(18, 24, 34, 0.17)");
    gradient.addColorStop(0.56, "rgba(18, 24, 34, 0.075)");
    gradient.addColorStop(1, "rgba(18, 24, 34, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, shadowWidth / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawGrid(width, height) {
    var styles = getComputedStyle(document.documentElement);
    var dark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    ctx.save();
    ctx.strokeStyle = dark ? "rgba(255,255,255,.035)" : "rgba(60,60,67,.055)";
    ctx.lineWidth = 1;
    var spacing = Math.max(28, Math.min(width, height) / 12);
    for (var x = width / 2 % spacing; x < width; x += spacing) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (var y = height / 2 % spacing; y < height; y += spacing) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }
    ctx.fillStyle = styles.getPropertyValue("--secondary");
    ctx.globalAlpha = 0.18;
    ctx.beginPath(); ctx.arc(width / 2, height / 2, 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function faceNormal(a, b, c) {
    return normalise([
      (b[1] - a[1]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[1] - a[1]),
      (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]),
      (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
    ]);
  }

  function normalise(vector) {
    var length = Math.hypot(vector[0], vector[1], vector[2]) || 1;
    return [vector[0] / length, vector[1] / length, vector[2] / length];
  }

  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

  function parseColour(hex) {
    var value = hex.replace("#", "");
    return [parseInt(value.slice(0, 2), 16), parseInt(value.slice(2, 4), 16), parseInt(value.slice(4, 6), 16)];
  }

  function toHex(value) { return Math.round(clamp(value, 0, 255)).toString(16).padStart(2, "0"); }

  function shadeColour(hex, brightness) {
    var rgb = parseColour(hex);
    var ambient = 20;
    return "#" + rgb.map(function (channel) { return toHex(channel * brightness + ambient * (1 - brightness)); }).join("");
  }

  function mixColour(a, b, amount) {
    var first = parseColour(a);
    var second = parseColour(b);
    return "#" + first.map(function (channel, index) { return toHex(channel * (1 - amount) + second[index] * amount); }).join("");
  }

  function makeBinarySTL(currentModel) {
    var triangleCount = currentModel.solids.reduce(function (total, solid) { return total + solid.faces.length; }, 0);
    var buffer = new ArrayBuffer(84 + triangleCount * 50);
    var bytes = new Uint8Array(buffer);
    var header = "Form 3D Studio — millimetres";
    for (var h = 0; h < header.length && h < 80; h += 1) bytes[h] = header.charCodeAt(h);
    var data = new DataView(buffer);
    data.setUint32(80, triangleCount, true);
    var offset = 84;
    currentModel.solids.forEach(function (solid) {
      solid.faces.forEach(function (face) {
        var a = solid.vertices[face[0]], b = solid.vertices[face[1]], c = solid.vertices[face[2]];
        var normal = faceNormal(a, b, c);
        normal.concat(a, b, c).forEach(function (value) {
          data.setFloat32(offset, value, true);
          offset += 4;
        });
        data.setUint16(offset, 0, true);
        offset += 2;
      });
    });
    return buffer;
  }

  function makeSTEP(currentModel) {
    var entities = [];
    var nextId = 1;
    function add(value) { var id = nextId++; entities.push("#" + id + "=" + value + ";"); return id; }
    function ref(id) { return "#" + id; }
    function stepNumber(value) {
      var fixed = Number(value).toFixed(6).replace(/0+$/, "").replace(/\.$/, "");
      if (!fixed.includes(".")) fixed += ".";
      if (fixed === "-0.") fixed = "0.";
      return fixed;
    }
    function safeName(value) { return String(value).replace(/'/g, ""); }

    var appContext = add("APPLICATION_CONTEXT('automotive design')");
    add("APPLICATION_PROTOCOL_DEFINITION('international standard','automotive_design',2000," + ref(appContext) + ")");
    var productContext = add("PRODUCT_CONTEXT(''," + ref(appContext) + ",'mechanical')");
    var product = add("PRODUCT('FORM3D','" + safeName(currentModel.name) + "','',(" + ref(productContext) + "))");
    var formation = add("PRODUCT_DEFINITION_FORMATION('',''," + ref(product) + ")");
    var definitionContext = add("PRODUCT_DEFINITION_CONTEXT('part definition'," + ref(appContext) + ",'design')");
    var definition = add("PRODUCT_DEFINITION('design',''," + ref(formation) + "," + ref(definitionContext) + ")");
    var breps = [];

    currentModel.solids.forEach(function (solid) {
      var pointIds = solid.vertices.map(function (vertex) {
        return add("CARTESIAN_POINT('',(" + vertex.map(stepNumber).join(",") + "))");
      });
      var faceIds = solid.faces.map(function (face) {
        var loop = add("POLY_LOOP('',(" + face.map(function (index) { return ref(pointIds[index]); }).join(",") + "))");
        var bound = add("FACE_OUTER_BOUND(''," + ref(loop) + ",.T.)");
        return add("FACE('',(" + ref(bound) + "))");
      });
      var shell = add("CLOSED_SHELL('" + safeName(solid.name) + "',(" + faceIds.map(ref).join(",") + "))");
      breps.push(add("FACETED_BREP('" + safeName(solid.name) + "'," + ref(shell) + ")"));
    });

    var origin = add("CARTESIAN_POINT('',(0.,0.,0.))");
    var zDirection = add("DIRECTION('',(0.,0.,1.))");
    var xDirection = add("DIRECTION('',(1.,0.,0.))");
    var axis = add("AXIS2_PLACEMENT_3D(''," + ref(origin) + "," + ref(zDirection) + "," + ref(xDirection) + ")");
    var lengthUnit = add("(LENGTH_UNIT() NAMED_UNIT(*) SI_UNIT(.MILLI.,.METRE.))");
    var angleUnit = add("(NAMED_UNIT(*) PLANE_ANGLE_UNIT() SI_UNIT($,.RADIAN.))");
    var solidAngleUnit = add("(NAMED_UNIT(*) SI_UNIT($,.STERADIAN.) SOLID_ANGLE_UNIT())");
    var uncertainty = add("UNCERTAINTY_MEASURE_WITH_UNIT(LENGTH_MEASURE(1.E-6)," + ref(lengthUnit) + ",'distance_accuracy_value','confusion accuracy')");
    var representationContext = add("(GEOMETRIC_REPRESENTATION_CONTEXT(3) GLOBAL_UNCERTAINTY_ASSIGNED_CONTEXT((" + ref(uncertainty) + ")) GLOBAL_UNIT_ASSIGNED_CONTEXT((" + [lengthUnit, angleUnit, solidAngleUnit].map(ref).join(",") + ")) REPRESENTATION_CONTEXT('Context','3D'))");
    var representationItems = breps.concat([axis]).map(ref).join(",");
    var representation = add("SHAPE_REPRESENTATION('',(" + representationItems + ")," + ref(representationContext) + ")");
    var productShape = add("PRODUCT_DEFINITION_SHAPE('',''," + ref(definition) + ")");
    add("SHAPE_DEFINITION_REPRESENTATION(" + ref(productShape) + "," + ref(representation) + ")");
    add("PRODUCT_RELATED_PRODUCT_CATEGORY('part','',(" + ref(product) + "))");

    var now = new Date().toISOString();
    return [
      "ISO-10303-21;",
      "HEADER;",
      "FILE_DESCRIPTION(('Faceted model exported by Form 3D Studio'),'2;1');",
      "FILE_NAME('" + fileStem() + ".step','" + now + "',('Form 3D Studio'),('nj22az.github.io'),'Form 3D Studio','Form 3D Studio','');",
      "FILE_SCHEMA(('AUTOMOTIVE_DESIGN'));",
      "ENDSEC;",
      "DATA;",
      entities.join("\n"),
      "ENDSEC;",
      "END-ISO-10303-21;",
      ""
    ].join("\n");
  }

  function fileStem() {
    return (model.name || "form-3d-model").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }

  function exportModel(format) {
    if (!model) return;
    try {
      if (format === "step") {
        downloadBlob(new Blob([makeSTEP(model)], { type: "application/step" }), fileStem() + ".step");
        showToast("STEP model exported");
      } else {
        downloadBlob(new Blob([makeBinarySTL(model)], { type: "model/stl" }), fileStem() + ".stl");
        showToast("STL model exported");
      }
    } catch (error) {
      console.error(error);
      showToast("Export could not be created");
    }
  }

  function formatNumber(value, decimals) {
    return Number(value).toFixed(decimals).replace(/\.0$/, "");
  }

  function displayValue(name, value) {
    if (name === "threshold") return Math.round(value) + "%";
    if (name === "boxLidAngle") return Math.round(value) + "°";
    if (name === "boxClearance") return Number(value).toFixed(2);
    if (["keyThickness", "holeSize", "reliefHeight", "boxCornerRadius", "boxWall", "boxBottom", "boxLidThickness", "boxHingeDiameter"].includes(name)) return Number(value).toFixed(1);
    return String(Math.round(value));
  }

  function updateRangeFill(input) {
    var min = Number(input.min || 0);
    var max = Number(input.max || 100);
    var percent = (Number(input.value) - min) / (max - min) * 100;
    input.style.setProperty("--fill", percent + "%");
  }

  function syncControls() {
    document.querySelectorAll("[data-param]").forEach(function (input) {
      var name = input.dataset.param;
      if (input.type === "checkbox") input.checked = Boolean(state[name]);
      else input.value = state[name];
      if (input.type === "range") updateRangeFill(input);
      var output = document.querySelector('[data-output="' + name + '"]');
      if (output) output.textContent = displayValue(name, state[name]);
    });
    document.querySelectorAll("[data-mode]").forEach(function (button) {
      var active = button.dataset.mode === state.mode;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });
    document.querySelectorAll(".keychain-controls").forEach(function (element) { element.classList.toggle("hidden", state.mode !== "keychain"); });
    document.querySelectorAll(".box-controls").forEach(function (element) { element.classList.toggle("hidden", state.mode !== "box"); });
    document.querySelectorAll(".cylinder-controls").forEach(function (element) { element.classList.toggle("hidden", state.mode !== "cylinder"); });
    document.querySelectorAll("[data-color]").forEach(function (button) { button.classList.toggle("active", button.dataset.color === state.color); });
  }

  function handleImageFile(file) {
    if (!file || !/^image\//.test(file.type)) {
      showToast("Please choose an image file");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      showToast("Choose an image smaller than 12 MB");
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      var image = new Image();
      image.onload = function () {
        uploadedImage = image;
        uploadedName = file.name;
        document.getElementById("drop-preview").innerHTML = '<img alt="Uploaded artwork preview" src="' + reader.result + '">';
        document.getElementById("upload-label").textContent = uploadedName;
        document.getElementById("clear-art-button").classList.remove("hidden");
        scheduleBuild();
        showToast("Image converted to a raised relief");
      };
      image.onerror = function () { showToast("That image could not be read"); };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function clearImage() {
    uploadedImage = null;
    uploadedName = "";
    document.getElementById("drop-preview").innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 16.5V19a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2.5M8 8l4-4 4 4m-4-4v12" /></svg>';
    document.getElementById("upload-label").textContent = "Choose an image";
    document.getElementById("clear-art-button").classList.add("hidden");
    document.getElementById("image-input").value = "";
    scheduleBuild();
  }

  function useSampleArt() {
    var sample = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 180"><rect width="300" height="180" fill="white"/><path d="M150 24 178 72l55 12-37 41 6 56-52-23-52 23 6-56-37-41 55-12Z" fill="black"/><circle cx="150" cy="105" r="23" fill="white"/></svg>';
    var image = new Image();
    image.onload = function () {
      uploadedImage = image;
      uploadedName = "sample-star.svg";
      document.getElementById("drop-preview").innerHTML = '<img alt="Sample star artwork" src="' + image.src + '">';
      document.getElementById("upload-label").textContent = uploadedName;
      document.getElementById("clear-art-button").classList.remove("hidden");
      scheduleBuild();
      showToast("Sample artwork added");
    };
    image.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(sample);
  }

  function showToast(message) {
    var toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 2200);
  }

  function resetView() {
    view.yaw = -0.62;
    view.pitch = -0.9;
    view.zoom = 1;
    render();
  }

  function bindEvents() {
    document.querySelectorAll("[data-mode]").forEach(function (button) {
      button.addEventListener("click", function () {
        state.mode = button.dataset.mode;
        syncControls();
        saveState();
        buildModel();
      });
    });

    document.querySelectorAll("[data-param]").forEach(function (input) {
      input.addEventListener("input", function () {
        var name = input.dataset.param;
        state[name] = input.type === "checkbox" ? input.checked : Number(input.value);
        if (input.type === "range") updateRangeFill(input);
        var output = document.querySelector('[data-output="' + name + '"]');
        if (output) output.textContent = displayValue(name, state[name]);
        saveState();
        scheduleBuild();
      });
    });

    document.querySelectorAll("[data-color]").forEach(function (button) {
      button.addEventListener("click", function () {
        state.color = button.dataset.color;
        syncControls();
        saveState();
        buildModel();
      });
    });

    document.querySelectorAll("[data-export]").forEach(function (button) {
      button.addEventListener("click", function () { exportModel(button.dataset.export); });
    });

    var imageInput = document.getElementById("image-input");
    imageInput.addEventListener("change", function () { handleImageFile(imageInput.files[0]); });
    document.getElementById("clear-art-button").addEventListener("click", clearImage);
    document.getElementById("demo-art-button").addEventListener("click", useSampleArt);

    var dropZone = document.getElementById("drop-zone");
    ["dragenter", "dragover"].forEach(function (name) {
      dropZone.addEventListener(name, function (event) { event.preventDefault(); dropZone.classList.add("dragging"); });
    });
    ["dragleave", "drop"].forEach(function (name) {
      dropZone.addEventListener(name, function (event) { event.preventDefault(); dropZone.classList.remove("dragging"); });
    });
    dropZone.addEventListener("drop", function (event) { handleImageFile(event.dataTransfer.files[0]); });

    document.getElementById("reset-button").addEventListener("click", function () {
      state = Object.assign({}, defaults);
      clearImage();
      syncControls();
      saveState();
      buildModel();
      showToast("Model reset");
    });
    document.getElementById("view-reset").addEventListener("click", resetView);
    document.getElementById("wireframe-button").addEventListener("click", function (event) {
      view.wireframe = !view.wireframe;
      event.currentTarget.setAttribute("aria-pressed", String(view.wireframe));
      render();
    });

    var dragging = false;
    var lastX = 0;
    var lastY = 0;
    canvasWrap.addEventListener("pointerdown", function (event) {
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      canvasWrap.classList.add("dragging");
      canvasWrap.setPointerCapture(event.pointerId);
    });
    canvasWrap.addEventListener("pointermove", function (event) {
      if (!dragging) return;
      view.yaw += (event.clientX - lastX) * 0.009;
      view.pitch = clamp(view.pitch + (event.clientY - lastY) * 0.009, -1.48, -0.08);
      lastX = event.clientX;
      lastY = event.clientY;
      render();
    });
    function endDrag() { dragging = false; canvasWrap.classList.remove("dragging"); }
    canvasWrap.addEventListener("pointerup", endDrag);
    canvasWrap.addEventListener("pointercancel", endDrag);
    canvasWrap.addEventListener("dblclick", resetView);
    canvasWrap.addEventListener("wheel", function (event) {
      event.preventDefault();
      view.zoom = clamp(view.zoom * Math.exp(-event.deltaY * 0.0012), 0.45, 3.2);
      render();
    }, { passive: false });

    new ResizeObserver(render).observe(canvasWrap);
    if (window.matchMedia) window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", render);
  }

  function updateConnectionBadge() {
    var badge = document.getElementById("connection-badge");
    var online = navigator.onLine;
    badge.classList.toggle("is-offline", !online);
    badge.querySelector("span").textContent = online ? "Works offline" : "Offline mode";
  }

  function initPWA() {
    updateConnectionBadge();
    window.addEventListener("online", updateConnectionBadge);
    window.addEventListener("offline", updateConnectionBadge);
    window.addEventListener("beforeinstallprompt", function (event) {
      event.preventDefault();
      installPrompt = event;
      document.getElementById("install-button").classList.remove("hidden");
    });
    document.getElementById("install-button").addEventListener("click", function () {
      if (!installPrompt) return;
      installPrompt.prompt();
      installPrompt.userChoice.finally(function () {
        installPrompt = null;
        document.getElementById("install-button").classList.add("hidden");
      });
    });
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker.register("./sw.js").catch(function (error) { console.warn("Offline cache unavailable", error); });
      });
    }
  }

  syncControls();
  bindEvents();
  initPWA();
  buildModel();
})();
