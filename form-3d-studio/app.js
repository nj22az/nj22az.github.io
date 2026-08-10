(function () {
  "use strict";

  var STORAGE_KEY = "form-3d-studio-settings-v4";
  var defaults = {
    mode: "keychain",
    keyWidth: 52,
    keyHeight: 30,
    keyThickness: 3,
    holeSize: 5,
    reliefHeight: 1.2,
    detail: 64,
    amsColours: 4,
    imageSmoothing: 1,
    removeBackground: true,
    backgroundTolerance: 14,
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
    boxGearModule: 0.8,
    boxGearTurn: 0,
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
  var mechanismAnimation = 0;
  var view = { yaw: -0.62, pitch: -0.9, zoom: 1, wireframe: false };

  var canvas = document.getElementById("viewport");
  var canvasWrap = document.getElementById("canvas-wrap");
  var gl = canvas.getContext("webgl", { antialias: true, alpha: true, depth: true });
  var ctx = gl ? null : canvas.getContext("2d");
  var webglRenderer = null;
  canvasWrap.classList.add(gl ? "webgl-renderer" : "depth-renderer");

  function loadState() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || localStorage.getItem("form-3d-studio-settings-v3") || "{}");
      var merged = Object.assign({}, defaults, saved);
      if (!["keychain", "box", "cylinder"].includes(merged.mode)) merged.mode = "keychain";
      merged.detail = clamp(Number(merged.detail) || defaults.detail, 32, 96);
      merged.amsColours = clamp(Number(merged.amsColours) || defaults.amsColours, 2, 4);
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
    this.material = 0;
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

  function tubeAlongX(name, color, cx, cy, cz, length, outerRadius, innerRadius, segments) {
    var solid = new Solid(name, color);
    var x0 = cx - length / 2;
    var x1 = cx + length / 2;
    var leftOuter = [], leftInner = [], rightOuter = [], rightInner = [];
    for (var i = 0; i < segments; i += 1) {
      var angle = Math.PI * 2 * i / segments;
      var cosine = Math.cos(angle);
      var sine = Math.sin(angle);
      leftOuter.push(solid.vertex(x0, cy + cosine * outerRadius, cz + sine * outerRadius));
      leftInner.push(solid.vertex(x0, cy + cosine * innerRadius, cz + sine * innerRadius));
      rightOuter.push(solid.vertex(x1, cy + cosine * outerRadius, cz + sine * outerRadius));
      rightInner.push(solid.vertex(x1, cy + cosine * innerRadius, cz + sine * innerRadius));
    }
    for (var j = 0; j < segments; j += 1) {
      var next = (j + 1) % segments;
      solid.quad(leftOuter[j], leftOuter[next], rightOuter[next], rightOuter[j]);
      solid.quad(leftInner[j], rightInner[j], rightInner[next], leftInner[next]);
      solid.triangle(leftOuter[j], leftInner[next], leftOuter[next]);
      solid.triangle(leftOuter[j], leftInner[j], leftInner[next]);
      solid.triangle(rightOuter[j], rightOuter[next], rightInner[next]);
      solid.triangle(rightOuter[j], rightInner[next], rightInner[j]);
    }
    return solid;
  }

  function cylinderAlongY(name, color, cx, cy, cz, length, radius, segments) {
    var solid = new Solid(name, color);
    var y0 = cy - length / 2;
    var y1 = cy + length / 2;
    var front = [];
    var back = [];
    for (var i = 0; i < segments; i += 1) {
      var angle = Math.PI * 2 * i / segments;
      var x = cx + Math.cos(angle) * radius;
      var z = cz + Math.sin(angle) * radius;
      front.push(solid.vertex(x, y0, z));
      back.push(solid.vertex(x, y1, z));
    }
    var frontCentre = solid.vertex(cx, y0, cz);
    var backCentre = solid.vertex(cx, y1, cz);
    for (var j = 0; j < segments; j += 1) {
      var next = (j + 1) % segments;
      solid.triangle(frontCentre, front[j], front[next]);
      solid.triangle(backCentre, back[next], back[j]);
      solid.quad(front[j], back[j], back[next], front[next]);
    }
    return solid;
  }

  function tubeAlongY(name, color, cx, cy, cz, length, outerRadius, innerRadius, segments) {
    var solid = new Solid(name, color);
    var y0 = cy - length / 2;
    var y1 = cy + length / 2;
    var frontOuter = [], frontInner = [], backOuter = [], backInner = [];
    for (var i = 0; i < segments; i += 1) {
      var angle = Math.PI * 2 * i / segments;
      var cosine = Math.cos(angle);
      var sine = Math.sin(angle);
      frontOuter.push(solid.vertex(cx + cosine * outerRadius, y0, cz + sine * outerRadius));
      frontInner.push(solid.vertex(cx + cosine * innerRadius, y0, cz + sine * innerRadius));
      backOuter.push(solid.vertex(cx + cosine * outerRadius, y1, cz + sine * outerRadius));
      backInner.push(solid.vertex(cx + cosine * innerRadius, y1, cz + sine * innerRadius));
    }
    for (var j = 0; j < segments; j += 1) {
      var next = (j + 1) % segments;
      solid.quad(frontOuter[j], backOuter[j], backOuter[next], frontOuter[next]);
      solid.quad(frontInner[j], frontInner[next], backInner[next], backInner[j]);
      solid.triangle(frontOuter[j], frontInner[next], frontInner[j]);
      solid.triangle(frontOuter[j], frontOuter[next], frontInner[next]);
      solid.triangle(backOuter[j], backInner[j], backInner[next]);
      solid.triangle(backOuter[j], backInner[next], backOuter[next]);
    }
    return solid;
  }

  function extrudeXZConvexAlongY(name, color, contour, y0, y1) {
    var solid = new Solid(name, color);
    var front = contour.map(function (point) { return solid.vertex(point[0], y0, point[1]); });
    var back = contour.map(function (point) { return solid.vertex(point[0], y1, point[1]); });
    var centre = contour.reduce(function (sum, point) {
      return [sum[0] + point[0], sum[1] + point[1]];
    }, [0, 0]);
    centre[0] /= contour.length;
    centre[1] /= contour.length;
    var frontCentre = solid.vertex(centre[0], y0, centre[1]);
    var backCentre = solid.vertex(centre[0], y1, centre[1]);
    for (var i = 0; i < contour.length; i += 1) {
      var next = (i + 1) % contour.length;
      solid.triangle(frontCentre, front[i], front[next]);
      solid.triangle(backCentre, back[next], back[i]);
      solid.quad(front[i], back[i], back[next], front[next]);
    }
    return solid;
  }

  function spurGearAlongY(name, color, cx, cy, cz, teeth, moduleSize, thickness, boreRadius, angleDegrees) {
    var solid = new Solid(name, color);
    var pointCount = teeth * 4;
    var pitchRadius = teeth * moduleSize / 2;
    var outerRadius = pitchRadius + moduleSize;
    var rootRadius = Math.max(boreRadius + moduleSize, pitchRadius - moduleSize * 1.25);
    var rotation = angleDegrees * Math.PI / 180;
    var y0 = cy - thickness / 2;
    var y1 = cy + thickness / 2;
    var frontOuter = [], frontInner = [], backOuter = [], backInner = [];
    for (var i = 0; i < pointCount; i += 1) {
      var angle = rotation + Math.PI * 2 * i / pointCount;
      var toothPoint = i % 4;
      var radius = toothPoint === 1 || toothPoint === 2 ? outerRadius : rootRadius;
      var cosine = Math.cos(angle);
      var sine = Math.sin(angle);
      frontOuter.push(solid.vertex(cx + cosine * radius, y0, cz + sine * radius));
      frontInner.push(solid.vertex(cx + cosine * boreRadius, y0, cz + sine * boreRadius));
      backOuter.push(solid.vertex(cx + cosine * radius, y1, cz + sine * radius));
      backInner.push(solid.vertex(cx + cosine * boreRadius, y1, cz + sine * boreRadius));
    }
    for (var j = 0; j < pointCount; j += 1) {
      var next = (j + 1) % pointCount;
      solid.quad(frontOuter[j], backOuter[j], backOuter[next], frontOuter[next]);
      solid.quad(frontInner[j], frontInner[next], backInner[next], backInner[j]);
      solid.triangle(frontOuter[j], frontInner[next], frontInner[j]);
      solid.triangle(frontOuter[j], frontOuter[next], frontInner[next]);
      solid.triangle(backOuter[j], backInner[j], backInner[next]);
      solid.triangle(backOuter[j], backInner[next], backOuter[next]);
    }
    return solid;
  }

  function barBetweenXZAlongY(name, color, x0, z0, x1, z1, width, y0, y1) {
    var dx = x1 - x0;
    var dz = z1 - z0;
    var length = Math.max(0.001, Math.hypot(dx, dz));
    var nx = -dz / length * width / 2;
    var nz = dx / length * width / 2;
    return extrudeXZConvexAlongY(name, color, [
      [x0 + nx, z0 + nz],
      [x0 - nx, z0 - nz],
      [x1 - nx, z1 - nz],
      [x1 + nx, z1 + nz]
    ], y0, y1);
  }

  function arcHookAlongY(name, color, cx, cy, cz, innerRadius, outerRadius, startDegrees, endDegrees, thickness, steps) {
    var solid = new Solid(name, color);
    var y0 = cy - thickness / 2;
    var y1 = cy + thickness / 2;
    var frontOuter = [], frontInner = [], backOuter = [], backInner = [];
    for (var i = 0; i <= steps; i += 1) {
      var degrees = startDegrees + (endDegrees - startDegrees) * i / steps;
      var angle = degrees * Math.PI / 180;
      var cosine = Math.cos(angle);
      var sine = Math.sin(angle);
      frontOuter.push(solid.vertex(cx + cosine * outerRadius, y0, cz + sine * outerRadius));
      frontInner.push(solid.vertex(cx + cosine * innerRadius, y0, cz + sine * innerRadius));
      backOuter.push(solid.vertex(cx + cosine * outerRadius, y1, cz + sine * outerRadius));
      backInner.push(solid.vertex(cx + cosine * innerRadius, y1, cz + sine * innerRadius));
    }
    for (var j = 0; j < steps; j += 1) {
      var next = j + 1;
      solid.quad(frontOuter[j], backOuter[j], backOuter[next], frontOuter[next]);
      solid.quad(frontInner[j], frontInner[next], backInner[next], backInner[j]);
      solid.triangle(frontOuter[j], frontInner[next], frontInner[j]);
      solid.triangle(frontOuter[j], frontOuter[next], frontInner[next]);
      solid.triangle(backOuter[j], backInner[j], backInner[next]);
      solid.triangle(backOuter[j], backInner[next], backOuter[next]);
    }
    solid.quad(frontOuter[0], frontInner[0], backInner[0], backOuter[0]);
    solid.quad(frontOuter[steps], backOuter[steps], backInner[steps], frontInner[steps]);
    return solid;
  }

  function frameAlongY(name, color, cx, cy, cz, outerWidth, outerHeight, frameWidth, depth) {
    var solid = new Solid(name, color);
    var innerWidth = Math.max(2, outerWidth - frameWidth * 2);
    var innerHeight = Math.max(2, outerHeight - frameWidth * 2);
    var y0 = cy - depth / 2;
    var y1 = cy + depth / 2;
    var outer = [
      [cx - outerWidth / 2, cz - outerHeight / 2],
      [cx + outerWidth / 2, cz - outerHeight / 2],
      [cx + outerWidth / 2, cz + outerHeight / 2],
      [cx - outerWidth / 2, cz + outerHeight / 2]
    ];
    var inner = [
      [cx - innerWidth / 2, cz - innerHeight / 2],
      [cx + innerWidth / 2, cz - innerHeight / 2],
      [cx + innerWidth / 2, cz + innerHeight / 2],
      [cx - innerWidth / 2, cz + innerHeight / 2]
    ];
    var frontOuter = outer.map(function (point) { return solid.vertex(point[0], y0, point[1]); });
    var backOuter = outer.map(function (point) { return solid.vertex(point[0], y1, point[1]); });
    var frontInner = inner.map(function (point) { return solid.vertex(point[0], y0, point[1]); });
    var backInner = inner.map(function (point) { return solid.vertex(point[0], y1, point[1]); });
    for (var i = 0; i < 4; i += 1) {
      var next = (i + 1) % 4;
      solid.triangle(frontOuter[i], frontOuter[next], frontInner[next]);
      solid.triangle(frontOuter[i], frontInner[next], frontInner[i]);
      solid.triangle(backOuter[i], backInner[next], backOuter[next]);
      solid.triangle(backOuter[i], backInner[i], backInner[next]);
      solid.quad(frontOuter[i], backOuter[i], backOuter[next], frontOuter[next]);
      solid.quad(frontInner[i], frontInner[next], backInner[next], backInner[i]);
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

  function rotateSolidAboutY(solid, pivotX, pivotZ, angleDegrees) {
    var angle = angleDegrees * Math.PI / 180;
    var cosine = Math.cos(angle);
    var sine = Math.sin(angle);
    return transformSolid(solid, function (vertex) {
      var x = vertex[0] - pivotX;
      var z = vertex[2] - pivotZ;
      return [
        pivotX + cosine * x - sine * z,
        vertex[1],
        pivotZ + sine * x + cosine * z
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

  function colourDistanceSquared(a, b) {
    var red = a[0] - b[0];
    var green = a[1] - b[1];
    var blue = a[2] - b[2];
    return red * red + green * green + blue * blue;
  }

  function sampleImageBackground(pixels, width, height, bounds) {
    if (!bounds) return null;
    var inset = Math.max(1, Math.round(Math.min(bounds.width, bounds.height) * 0.035));
    var points = [
      [bounds.x + inset, bounds.y + inset],
      [bounds.x + bounds.width - inset - 1, bounds.y + inset],
      [bounds.x + inset, bounds.y + bounds.height - inset - 1],
      [bounds.x + bounds.width - inset - 1, bounds.y + bounds.height - inset - 1]
    ];
    var sum = [0, 0, 0];
    var count = 0;
    points.forEach(function (point) {
      var centreX = Math.round(point[0]);
      var centreY = Math.round(point[1]);
      for (var offsetY = -1; offsetY <= 1; offsetY += 1) {
        for (var offsetX = -1; offsetX <= 1; offsetX += 1) {
          var x = clamp(centreX + offsetX, 0, width - 1);
          var y = clamp(centreY + offsetY, 0, height - 1);
          var index = (y * width + x) * 4;
          if (pixels[index + 3] < 180) continue;
          sum[0] += pixels[index];
          sum[1] += pixels[index + 1];
          sum[2] += pixels[index + 2];
          count += 1;
        }
      }
    });
    return count ? sum.map(function (value) { return value / count; }) : null;
  }

  function quantiseArtwork(samples, colourCount) {
    if (!samples.length) return { palette: [], assignments: [] };
    var histogram = new Map();
    samples.forEach(function (sample) {
      var key = (sample[0] >> 4) + ":" + (sample[1] >> 4) + ":" + (sample[2] >> 4);
      var bucket = histogram.get(key) || { sum: [0, 0, 0], count: 0 };
      bucket.sum[0] += sample[0];
      bucket.sum[1] += sample[1];
      bucket.sum[2] += sample[2];
      bucket.count += 1;
      histogram.set(key, bucket);
    });
    var buckets = Array.from(histogram.values()).map(function (bucket) {
      return {
        colour: bucket.sum.map(function (value) { return value / bucket.count; }),
        count: bucket.count
      };
    });
    buckets.sort(function (a, b) { return b.count - a.count; });
    var targetCount = Math.min(colourCount, buckets.length);
    var centroids = [buckets[0].colour.slice()];
    while (centroids.length < targetCount) {
      var best = null;
      var bestScore = -1;
      buckets.forEach(function (bucket) {
        var nearest = Math.min.apply(null, centroids.map(function (centroid) {
          return colourDistanceSquared(bucket.colour, centroid);
        }));
        var score = nearest * Math.sqrt(bucket.count);
        if (score > bestScore) { bestScore = score; best = bucket.colour; }
      });
      centroids.push(best.slice());
    }

    var assignments = new Array(samples.length).fill(0);
    for (var iteration = 0; iteration < 9; iteration += 1) {
      var sums = centroids.map(function () { return [0, 0, 0, 0]; });
      samples.forEach(function (sample, index) {
        var nearestIndex = 0;
        var nearestDistance = Infinity;
        centroids.forEach(function (centroid, centroidIndex) {
          var distance = colourDistanceSquared(sample, centroid);
          if (distance < nearestDistance) { nearestDistance = distance; nearestIndex = centroidIndex; }
        });
        assignments[index] = nearestIndex;
        sums[nearestIndex][0] += sample[0];
        sums[nearestIndex][1] += sample[1];
        sums[nearestIndex][2] += sample[2];
        sums[nearestIndex][3] += 1;
      });
      sums.forEach(function (sum, index) {
        if (sum[3]) centroids[index] = [sum[0] / sum[3], sum[1] / sum[3], sum[2] / sum[3]];
      });
    }
    return {
      palette: centroids.map(function (colour) {
        return "#" + colour.map(toHex).join("");
      }),
      assignments: assignments
    };
  }

  function smoothArtworkLabels(labels, iterations) {
    var height = labels.length;
    var width = labels[0].length;
    var current = labels.map(function (row) { return row.slice(); });
    for (var pass = 0; pass < iterations; pass += 1) {
      var next = current.map(function (row) { return row.slice(); });
      for (var row = 0; row < height; row += 1) {
        for (var col = 0; col < width; col += 1) {
          var counts = new Map();
          var activeNeighbours = 0;
          for (var dy = -1; dy <= 1; dy += 1) {
            for (var dx = -1; dx <= 1; dx += 1) {
              if (!dx && !dy) continue;
              var y = row + dy;
              var x = col + dx;
              if (x < 0 || x >= width || y < 0 || y >= height) continue;
              var label = current[y][x];
              if (label < 0) continue;
              activeNeighbours += 1;
              counts.set(label, (counts.get(label) || 0) + 1);
            }
          }
          if (current[row][col] >= 0 && activeNeighbours <= 1) {
            next[row][col] = -1;
            continue;
          }
          if (current[row][col] < 0 && activeNeighbours >= 7) {
            var fill = Array.from(counts.entries()).sort(function (a, b) { return b[1] - a[1]; })[0];
            if (fill) next[row][col] = fill[0];
            continue;
          }
          if (current[row][col] >= 0) {
            counts.set(current[row][col], (counts.get(current[row][col]) || 0) + 2);
            var winner = Array.from(counts.entries()).sort(function (a, b) { return b[1] - a[1]; })[0];
            if (winner && winner[1] >= 4) next[row][col] = winner[0];
          }
        }
      }
      current = next;
    }
    return current;
  }

  function createArtworkMap() {
    var width = Math.round(state.detail);
    var targetAspect = (state.keyWidth * 0.68) / (state.keyHeight * 0.66);
    var height = Math.max(14, Math.round(width / targetAspect));
    var offscreen = document.createElement("canvas");
    offscreen.width = width;
    offscreen.height = height;
    var imageContext = offscreen.getContext("2d", { willReadFrequently: true });
    imageContext.clearRect(0, 0, width, height);
    imageContext.imageSmoothingEnabled = true;
    imageContext.imageSmoothingQuality = "high";
    var bounds = null;

    if (uploadedImage) {
      var sourceAspect = uploadedImage.naturalWidth / uploadedImage.naturalHeight;
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
      imageContext.drawImage(uploadedImage, x, y, drawWidth, drawHeight);
      bounds = { x: x, y: y, width: drawWidth, height: drawHeight };
    } else {
      imageContext.fillStyle = "#161617";
      imageContext.textAlign = "center";
      imageContext.textBaseline = "middle";
      imageContext.font = "900 " + Math.round(height * 0.76) + "px -apple-system, BlinkMacSystemFont, sans-serif";
      imageContext.fillText("3D", width / 2, height / 2 + 1);
    }

    var pixels = imageContext.getImageData(0, 0, width, height).data;
    var background = state.removeBackground ? sampleImageBackground(pixels, width, height, bounds) : null;
    var tolerance = state.backgroundTolerance / 100 * Math.sqrt(3 * 255 * 255);
    var toleranceSquared = tolerance * tolerance;
    var samples = [];
    var sampleLocations = [];
    for (var row = 0; row < height; row += 1) {
      for (var col = 0; col < width; col += 1) {
        var index = (row * width + col) * 4;
        var alpha = pixels[index + 3];
        if (alpha < 72) continue;
        var colour = [pixels[index], pixels[index + 1], pixels[index + 2]];
        if (background && colourDistanceSquared(colour, background) <= toleranceSquared) continue;
        samples.push(colour);
        sampleLocations.push([row, col]);
      }
    }
    var quantised = quantiseArtwork(samples, Math.max(1, state.amsColours - 1));
    var labels = Array.from({ length: height }, function () { return new Array(width).fill(-1); });
    sampleLocations.forEach(function (location, index) {
      labels[location[0]][location[1]] = quantised.assignments[index];
    });
    labels = smoothArtworkLabels(labels, Math.round(state.imageSmoothing));
    return { width: width, height: height, labels: labels, palette: quantised.palette };
  }

  function voxelMaskSolid(name, color, material, artwork, target, cell, offsetX, offsetY, z0, z1) {
    var solid = new Solid(name, color);
    solid.material = material;
    var vertexCache = new Map();
    function vertex(col, row, top) {
      var key = col + ":" + row + ":" + top;
      if (vertexCache.has(key)) return vertexCache.get(key);
      var x = offsetX + (col - artwork.width / 2) * cell;
      var y = offsetY + (artwork.height / 2 - row) * cell;
      var index = solid.vertex(x, y, top ? z1 : z0);
      vertexCache.set(key, index);
      return index;
    }
    function active(row, col) {
      return row >= 0 && row < artwork.height && col >= 0 && col < artwork.width && artwork.labels[row][col] === target;
    }
    for (var row = 0; row < artwork.height; row += 1) {
      for (var col = 0; col < artwork.width; col += 1) {
        if (!active(row, col)) continue;
        var bottomTL = vertex(col, row, false);
        var bottomTR = vertex(col + 1, row, false);
        var bottomBR = vertex(col + 1, row + 1, false);
        var bottomBL = vertex(col, row + 1, false);
        var topTL = vertex(col, row, true);
        var topTR = vertex(col + 1, row, true);
        var topBR = vertex(col + 1, row + 1, true);
        var topBL = vertex(col, row + 1, true);
        solid.triangle(topTL, topBL, topBR);
        solid.triangle(topTL, topBR, topTR);
        solid.triangle(bottomTL, bottomTR, bottomBR);
        solid.triangle(bottomTL, bottomBR, bottomBL);
        if (!active(row - 1, col)) solid.quad(bottomTL, topTL, topTR, bottomTR);
        if (!active(row + 1, col)) solid.quad(bottomBL, bottomBR, topBR, topBL);
        if (!active(row, col - 1)) solid.quad(bottomTL, bottomBL, topBL, topTL);
        if (!active(row, col + 1)) solid.quad(bottomTR, topTR, topBR, bottomBR);
      }
    }
    return solid.faces.length ? solid : null;
  }

  function buildKeychain() {
    var solids = [];
    var corner = Math.min(6, state.keyHeight * 0.24);
    var base = extrudeConvex("AMS 1 · Keychain base", state.color, roundedRectangle(state.keyWidth, state.keyHeight, corner, 9), 0, state.keyThickness);
    base.material = 0;
    solids.push(base);

    var innerRadius = state.holeSize / 2;
    var outerRadius = innerRadius + Math.max(2, state.keyThickness * 0.72);
    var ringX = -state.keyWidth / 2 - outerRadius * 0.5;
    var eye = extrudeRing("AMS 1 · Keyring eye", state.color, ringX, 0, outerRadius, innerRadius, 0, state.keyThickness, 48);
    eye.material = 0;
    solids.push(eye);

    var bezel = roundedFrame(
      "AMS 1 · Face bezel",
      state.color,
      state.keyWidth - 5.2,
      state.keyHeight - 4.8,
      1.05,
      state.keyThickness - 0.04,
      state.keyThickness + 0.34,
      Math.max(1.8, corner - 1.4),
      9
    );
    bezel.material = 0;
    solids.push(bezel);

    var artwork = createArtworkMap();
    var cell = Math.min(state.keyWidth * 0.68 / artwork.width, state.keyHeight * 0.66 / artwork.height);
    var offsetX = state.keyWidth * 0.045;
    var materials = [{ name: "AMS 1 · Base", color: state.color, slot: 1 }];
    artwork.palette.forEach(function (color, index) {
      var material = index + 1;
      var relief = voxelMaskSolid(
        "AMS " + (material + 1) + " · Artwork",
        color,
        material,
        artwork,
        index,
        cell,
        offsetX,
        0,
        state.keyThickness - 0.045,
        state.keyThickness + state.reliefHeight
      );
      if (relief) {
        solids.push(relief);
        materials.push({ name: "AMS " + (material + 1) + " · Artwork", color: color, slot: material + 1 });
      }
    });
    return { name: "AMS image keychain", solids: solids, materials: materials, artwork: artwork };
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
      var pinRadius = hingeRadius * 0.34;
      var boreRadius = Math.min(hingeRadius - 0.65, pinRadius + clearance);

      solids.push(tubeAlongX("Left body hinge", hardwareColor, -sideOffset, pivotY, pivotZ, sideLength, hingeRadius, boreRadius, 28));
      solids.push(tubeAlongX("Right body hinge", hardwareColor, sideOffset, pivotY, pivotZ, sideLength, hingeRadius, boreRadius, 28));
      solids.push(tubeAlongX("Cover hinge", lidColor, 0, pivotY, pivotZ, centreLength, hingeRadius, boreRadius, 28));
      solids.push(cylinderAlongX("Hinge pin", pinColor, 0, pivotY, pivotZ, hingeSpan + 1.4, pinRadius, 24));

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
      var inputTeeth = 12;
      var outputTeeth = 16;
      var maximumModule = Math.max(0.58, Math.min((width - 14) / 30, (height - 5) / 20));
      var gearModule = Math.min(state.boxGearModule, maximumModule);
      var inputPitchRadius = inputTeeth * gearModule / 2;
      var outputPitchRadius = outputTeeth * gearModule / 2;
      var inputOuterRadius = inputPitchRadius + gearModule;
      var outputOuterRadius = outputPitchRadius + gearModule;
      var gearCentreDistance = inputPitchRadius + outputPitchRadius + Math.max(0.16, clearance * 0.55);
      var inputX = -gearCentreDistance / 2;
      var outputX = gearCentreDistance / 2;
      var gearCentreZ = height - outputOuterRadius - 1.65;
      var axialClearance = Math.max(0.28, clearance);
      var axleRadius = clamp(gearModule * 1.35, 1, 1.45);
      var boreRadius = axleRadius + clearance;
      var gearThickness = clamp(gearModule * 3.25, 2.35, 3.2);
      var coverFrontY = -depth / 2 - 0.4;
      var plateBackY = coverFrontY + 0.28;
      var plateFrontY = plateBackY - 1.6;
      var gearBackY = plateFrontY - axialClearance;
      var gearFrontY = gearBackY - gearThickness;
      var gearY = (gearBackY + gearFrontY) / 2;
      var housingPadding = 1.45 + axialClearance;
      var housingLeft = inputX - inputOuterRadius - housingPadding;
      var housingRight = outputX + outputOuterRadius + housingPadding;
      var housingBottom = gearCentreZ - outputOuterRadius - 1.2;
      var housingTop = pivotZ + lidThickness / 2 - 0.2;
      var housingChamfer = Math.min(2.2, (housingRight - housingLeft) * 0.08);
      var housingContour = [
        [housingLeft + housingChamfer, housingBottom],
        [housingRight - housingChamfer, housingBottom],
        [housingRight, housingBottom + housingChamfer],
        [housingRight, housingTop - housingChamfer],
        [housingRight - housingChamfer, housingTop],
        [housingLeft + housingChamfer, housingTop],
        [housingLeft, housingTop - housingChamfer],
        [housingLeft, housingBottom + housingChamfer]
      ];
      lidParts.push(extrudeXZConvexAlongY(
        "Gearbox reinforced backplate",
        lidColor,
        housingContour,
        plateFrontY,
        plateBackY
      ));

      var guardFrontY = gearFrontY - 0.72;
      var cageDepth = plateBackY - guardFrontY;
      var cageY = (plateBackY + guardFrontY) / 2;
      var cageRail = Math.max(1.25, gearModule * 1.65);
      lidParts.push(makeBoxSolid(
        "Gearbox top guard",
        hardwareColor,
        (housingLeft + housingRight) / 2,
        cageY,
        housingTop - cageRail,
        housingRight - housingLeft,
        cageDepth,
        cageRail
      ));
      lidParts.push(makeBoxSolid(
        "Gearbox left guard",
        hardwareColor,
        housingLeft + cageRail / 2,
        cageY,
        housingBottom + cageRail - 0.12,
        cageRail,
        cageDepth,
        housingTop - housingBottom - cageRail * 2 + 0.24
      ));
      lidParts.push(makeBoxSolid(
        "Gearbox right guard",
        hardwareColor,
        housingRight - cageRail / 2,
        cageY,
        housingBottom + cageRail - 0.12,
        cageRail,
        cageDepth,
        housingTop - housingBottom - cageRail * 2 + 0.24
      ));
      var lowerBraceRight = inputX + inputOuterRadius + housingPadding * 0.45;
      lidParts.push(makeBoxSolid(
        "Gearbox lower brace",
        hardwareColor,
        (housingLeft + lowerBraceRight) / 2,
        cageY,
        housingBottom,
        lowerBraceRight - housingLeft,
        cageDepth,
        cageRail
      ));

      var inputAngle = -state.boxGearTurn;
      var outputAngle = state.boxGearTurn * inputTeeth / outputTeeth;
      var inputPhase = -0.375 * 360 / inputTeeth;
      var outputPhase = 0.125 * 360 / outputTeeth;
      lidParts.push(spurGearAlongY(
        "12 tooth drive gear",
        trimColor,
        inputX,
        gearY,
        gearCentreZ,
        inputTeeth,
        gearModule,
        gearThickness,
        boreRadius,
        inputPhase + inputAngle
      ));
      lidParts.push(spurGearAlongY(
        "16 tooth cam gear",
        pinColor,
        outputX,
        gearY,
        gearCentreZ,
        outputTeeth,
        gearModule,
        gearThickness,
        boreRadius,
        outputPhase + outputAngle
      ));

      var hookOuterRadius = clamp(gearModule * 5.1, 3.5, 5.2);
      var strikerRadius = clamp(gearModule * 2, 1.45, 2.1);
      var hookInnerRadius = strikerRadius + clearance + 0.3;
      var desiredReach = clamp(height * 0.29, 7, 11.2);
      var hookReach = Math.max(5.5, Math.min(desiredReach, gearCentreZ - hookOuterRadius - 0.9));
      var hookZ = gearCentreZ - hookReach;
      var movingY0 = gearFrontY + 0.12;
      var movingY1 = gearBackY - 0.12;
      var movingThickness = movingY1 - movingY0;
      var armWidth = clamp(gearModule * 3.9, 2.8, 4.1);
      var armEndZ = hookZ + hookOuterRadius * 0.8;
      var outputArm = barBetweenXZAlongY(
        "Dead-centre output arm",
        hardwareColor,
        outputX,
        gearCentreZ - axleRadius * 0.25,
        outputX,
        armEndZ,
        armWidth,
        movingY0,
        movingY1
      );
      var camHook = arcHookAlongY(
        "Geared rotary cam hook",
        hardwareColor,
        outputX,
        gearY,
        hookZ,
        hookInnerRadius,
        hookOuterRadius,
        265,
        450,
        movingThickness,
        38
      );
      rotateSolidAboutY(outputArm, outputX, gearCentreZ, outputAngle);
      rotateSolidAboutY(camHook, outputX, gearCentreZ, outputAngle);
      lidParts.push(outputArm);
      lidParts.push(camHook);
      lidParts.push(tubeAlongY(
        "Output gear hub",
        hardwareColor,
        outputX,
        gearY,
        gearCentreZ,
        gearThickness + 0.12,
        boreRadius + Math.max(0.62, gearModule * 0.8),
        boreRadius,
        28
      ));

      var dialBackY = gearFrontY + 0.12;
      var dialFrontY = gearFrontY - 1.25;
      var dialThickness = dialBackY - dialFrontY;
      var dialModule = gearModule * 0.85;
      lidParts.push(spurGearAlongY(
        "Knurled drive wheel",
        trimColor,
        inputX,
        (dialBackY + dialFrontY) / 2,
        gearCentreZ,
        10,
        dialModule,
        dialThickness,
        boreRadius,
        inputAngle
      ));
      lidParts.push(tubeAlongY(
        "Drive wheel hub",
        trimColor,
        inputX,
        (gearBackY + dialFrontY) / 2,
        gearCentreZ,
        gearBackY - dialFrontY,
        boreRadius + Math.max(0.65, gearModule * 0.86),
        boreRadius,
        28
      ));

      var capThickness = Math.max(0.72, gearModule * 0.92);
      var capRadius = boreRadius + Math.max(0.62, gearModule * 0.78);
      var inputCapBackY = dialFrontY - axialClearance;
      var inputCapFrontY = inputCapBackY - capThickness;
      var outputCapBackY = gearFrontY - axialClearance;
      var outputCapFrontY = outputCapBackY - capThickness;
      var axleBackY = plateBackY - 0.14;
      var inputAxleFrontY = inputCapFrontY + 0.08;
      var outputAxleFrontY = outputCapFrontY + 0.08;
      lidParts.push(cylinderAlongY(
        "Input fixed axle",
        pinColor,
        inputX,
        (inputAxleFrontY + axleBackY) / 2,
        gearCentreZ,
        axleBackY - inputAxleFrontY,
        axleRadius,
        28
      ));
      lidParts.push(cylinderAlongY(
        "Output fixed axle",
        pinColor,
        outputX,
        (outputAxleFrontY + axleBackY) / 2,
        gearCentreZ,
        axleBackY - outputAxleFrontY,
        axleRadius,
        28
      ));
      lidParts.push(cylinderAlongY(
        "Input axle retainer",
        pinColor,
        inputX,
        (inputCapBackY + inputCapFrontY) / 2,
        gearCentreZ,
        capThickness,
        capRadius,
        28
      ));
      lidParts.push(cylinderAlongY(
        "Output axle retainer",
        pinColor,
        outputX,
        (outputCapBackY + outputCapFrontY) / 2,
        gearCentreZ,
        capThickness,
        capRadius,
        28
      ));

      var lockStopRadius = Math.max(0.78, gearModule);
      var lockStopX = outputX - armWidth / 2 - axialClearance - lockStopRadius;
      var lockStopZ = gearCentreZ - outputOuterRadius - 1.48;
      lidParts.push(cylinderAlongY(
        "Dead-centre lock stop",
        pinColor,
        lockStopX,
        (guardFrontY + plateFrontY + 0.28) / 2,
        lockStopZ,
        plateFrontY + 0.28 - guardFrontY,
        lockStopRadius,
        24
      ));

      var bossHalfWidth = hookOuterRadius + 1.25;
      var bossHalfHeight = hookOuterRadius + 0.9;
      var bossChamfer = Math.min(1.5, bossHalfWidth * 0.24);
      var bossContour = [
        [outputX - bossHalfWidth + bossChamfer, hookZ - bossHalfHeight],
        [outputX + bossHalfWidth - bossChamfer, hookZ - bossHalfHeight],
        [outputX + bossHalfWidth, hookZ - bossHalfHeight + bossChamfer],
        [outputX + bossHalfWidth, hookZ + bossHalfHeight - bossChamfer],
        [outputX + bossHalfWidth - bossChamfer, hookZ + bossHalfHeight],
        [outputX - bossHalfWidth + bossChamfer, hookZ + bossHalfHeight],
        [outputX - bossHalfWidth, hookZ + bossHalfHeight - bossChamfer],
        [outputX - bossHalfWidth, hookZ - bossHalfHeight + bossChamfer]
      ];
      var bossFrontY = gearBackY + axialClearance;
      var bossBackY = -depth / 2 + wall * 0.62;
      solids.push(extrudeXZConvexAlongY(
        "Reinforced striker pedestal",
        hardwareColor,
        bossContour,
        bossFrontY,
        bossBackY
      ));
      var strikerCapRadius = hookInnerRadius + Math.max(0.68, gearModule * 0.88);
      var strikerCapThickness = Math.max(0.82, gearModule * 1.08);
      var strikerCapBackY = gearFrontY - axialClearance;
      var strikerCapFrontY = strikerCapBackY - strikerCapThickness;
      var strikerShaftBackY = -depth / 2 + wall * 0.36;
      var strikerShaftFrontY = strikerCapFrontY + 0.08;
      solids.push(cylinderAlongY(
        "Hardened latch striker",
        pinColor,
        outputX,
        (strikerShaftFrontY + strikerShaftBackY) / 2,
        hookZ,
        strikerShaftBackY - strikerShaftFrontY,
        strikerRadius,
        30
      ));
      solids.push(cylinderAlongY(
        "Mushroom striker retainer",
        pinColor,
        outputX,
        (strikerCapBackY + strikerCapFrontY) / 2,
        hookZ,
        strikerCapThickness,
        strikerCapRadius,
        30
      ));
    }

    var openingAngle = -state.boxLidAngle;
    lidParts.forEach(function (part) {
      rotateSolidAboutX(part, pivotY, pivotZ, openingAngle);
      solids.push(part);
    });

    var name = state.boxHinges ? "Hinged storage box" : "Fitted storage box";
    if (state.boxLatch) name = state.boxHinges ? "Geared cam-latch box" : "Geared latching box";
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
    updateAMSPalette();
  }

  function updateAMSPalette() {
    var palette = document.getElementById("ams-palette");
    if (!palette) return;
    palette.innerHTML = "";
    var materials = model && model.materials ? model.materials : [{ name: "AMS 1 · Base", color: state.color, slot: 1 }];
    for (var slot = 1; slot <= state.amsColours; slot += 1) {
      var material = materials.find(function (candidate) { return candidate.slot === slot; });
      var chip = document.createElement("span");
      chip.className = "ams-chip" + (material ? "" : " empty");
      var colour = document.createElement("i");
      colour.style.setProperty("--chip", material ? material.color : "#d1d1d6");
      var label = document.createElement("span");
      label.textContent = material ? "A" + slot : "A" + slot + " empty";
      chip.title = material ? material.name + " · " + material.color.toUpperCase() : "Unused AMS slot";
      chip.appendChild(colour);
      chip.appendChild(label);
      palette.appendChild(chip);
    }
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
    if (!gl) pixelRatio = Math.max(1.35, pixelRatio);
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
    renderSoftware3D(width, height, pixelRatio);
    return;
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

  function renderSoftware3D(width, height, pixelRatio) {
    var targetWidth = canvas.width;
    var targetHeight = canvas.height;
    var image = ctx.createImageData(targetWidth, targetHeight);
    var pixels = image.data;
    var depthBuffer = new Float32Array(targetWidth * targetHeight);
    depthBuffer.fill(-Infinity);
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
    var light = normalise([-0.38, -0.46, 0.84]);
    var halfLight = normalise([light[0], light[1], light[2] + 1]);
    var visibleLines = [];

    function screenPoint(vertex) {
      return [
        (offsetX + vertex[0] * scale) * pixelRatio,
        (offsetY - vertex[1] * scale) * pixelRatio,
        vertex[2]
      ];
    }

    function rasterise(a, b, c, rgb) {
      var minX = Math.max(0, Math.floor(Math.min(a[0], b[0], c[0])));
      var maxX = Math.min(targetWidth - 1, Math.ceil(Math.max(a[0], b[0], c[0])));
      var minY = Math.max(0, Math.floor(Math.min(a[1], b[1], c[1])));
      var maxY = Math.min(targetHeight - 1, Math.ceil(Math.max(a[1], b[1], c[1])));
      var denominator = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1]);
      if (Math.abs(denominator) < 0.00001) return;
      var inverse = 1 / denominator;
      for (var y = minY; y <= maxY; y += 1) {
        var py = y + 0.5;
        for (var x = minX; x <= maxX; x += 1) {
          var px = x + 0.5;
          var weightA = ((b[1] - c[1]) * (px - c[0]) + (c[0] - b[0]) * (py - c[1])) * inverse;
          var weightB = ((c[1] - a[1]) * (px - c[0]) + (a[0] - c[0]) * (py - c[1])) * inverse;
          var weightC = 1 - weightA - weightB;
          if (weightA < -0.0001 || weightB < -0.0001 || weightC < -0.0001) continue;
          var depth = weightA * a[2] + weightB * b[2] + weightC * c[2];
          var index = y * targetWidth + x;
          if (depth <= depthBuffer[index]) continue;
          depthBuffer[index] = depth;
          var pixel = index * 4;
          pixels[pixel] = rgb[0];
          pixels[pixel + 1] = rgb[1];
          pixels[pixel + 2] = rgb[2];
          pixels[pixel + 3] = 255;
        }
      }
    }

    model.solids.forEach(function (solid) {
      var rotated = solid.vertices.map(function (vertex) { return rotateVertex(vertex, centre); });
      solid.faces.forEach(function (face) {
        var a = rotated[face[0]], b = rotated[face[1]], c = rotated[face[2]];
        var normal = faceNormal(a, b, c);
        var diffuse = Math.max(0, dot(normal, light));
        var specular = Math.pow(Math.max(0, dot(normal, halfLight)), 20) * 0.16;
        var brightness = clamp(0.48 + diffuse * 0.38 + Math.max(0, normal[2]) * 0.08 + specular, 0.34, 1.03);
        var rgb = parseColour(shadeColour(solid.color, brightness));
        var projected = [screenPoint(a), screenPoint(b), screenPoint(c)];
        rasterise(projected[0], projected[1], projected[2], rgb);
        if (view.wireframe && normal[2] >= -0.01) visibleLines.push(projected);
      });
    });

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.putImageData(image, 0, 0);
    if (view.wireframe) {
      ctx.strokeStyle = "rgba(16, 18, 22, 0.48)";
      ctx.lineWidth = Math.max(0.75, pixelRatio * 0.62);
      ctx.lineJoin = "round";
      visibleLines.forEach(function (triangle) {
        ctx.beginPath();
        ctx.moveTo(triangle[0][0], triangle[0][1]);
        ctx.lineTo(triangle[1][0], triangle[1][1]);
        ctx.lineTo(triangle[2][0], triangle[2][1]);
        ctx.closePath();
        ctx.stroke();
      });
    }
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

  function xmlEscape(value) {
    return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&apos;");
  }

  function signedMeshVolume(solid) {
    return solid.faces.reduce(function (volume, face) {
      var a = solid.vertices[face[0]], b = solid.vertices[face[1]], c = solid.vertices[face[2]];
      return volume + (
        a[0] * (b[1] * c[2] - b[2] * c[1]) +
        a[1] * (b[2] * c[0] - b[0] * c[2]) +
        a[2] * (b[0] * c[1] - b[1] * c[0])
      ) / 6;
    }, 0);
  }

  function groupModelByMaterial(currentModel) {
    var groups = new Map();
    currentModel.solids.forEach(function (solid) {
      if (!solid.faces.length) return;
      var material = Number.isFinite(solid.material) ? solid.material : 0;
      var group = groups.get(material) || { material: material, vertices: [], faces: [], color: solid.color, names: [] };
      var offset = group.vertices.length;
      var reverseWinding = signedMeshVolume(solid) < 0;
      solid.vertices.forEach(function (vertex) { group.vertices.push(vertex); });
      solid.faces.forEach(function (face) {
        var ordered = reverseWinding ? [face[0], face[2], face[1]] : face;
        group.faces.push(ordered.map(function (index) { return index + offset; }));
      });
      group.names.push(solid.name);
      groups.set(material, group);
    });
    return Array.from(groups.values()).sort(function (a, b) { return a.material - b.material; });
  }

  function make3MF(currentModel) {
    var groups = groupModelByMaterial(currentModel);
    var modelMaterials = currentModel.materials || [];
    var materialXml = groups.map(function (group, index) {
      var details = modelMaterials.find(function (material) { return material.slot === group.material + 1; });
      group.baseIndex = index;
      group.name = details ? details.name : "Material " + (group.material + 1);
      group.displayColor = (details ? details.color : group.color || state.color).toUpperCase();
      return '<base name="' + xmlEscape(group.name) + '" displaycolor="' + group.displayColor + 'FF"/>';
    }).join("");
    var objectXml = groups.map(function (group, index) {
      group.objectId = index + 2;
      var vertices = group.vertices.map(function (vertex) {
        return '<vertex x="' + Number(vertex[0]).toFixed(5) + '" y="' + Number(vertex[1]).toFixed(5) + '" z="' + Number(vertex[2]).toFixed(5) + '"/>';
      }).join("");
      var triangles = group.faces.map(function (face) {
        return '<triangle v1="' + face[0] + '" v2="' + face[1] + '" v3="' + face[2] + '"/>';
      }).join("");
      return '<object id="' + group.objectId + '" type="model" name="' + xmlEscape(group.name) + '" pid="1" pindex="' + group.baseIndex + '"><mesh><vertices>' + vertices + '</vertices><triangles>' + triangles + '</triangles></mesh></object>';
    }).join("");
    var assemblyId = groups.length + 2;
    var components = groups.map(function (group) { return '<component objectid="' + group.objectId + '"/>'; }).join("");
    var translateX = Math.max(0, -currentModel.bounds.min[0]);
    var translateY = Math.max(0, -currentModel.bounds.min[1]);
    var translateZ = Math.max(0, -currentModel.bounds.min[2]);
    var buildTransform = [1, 0, 0, 0, 1, 0, 0, 0, 1, translateX, translateY, translateZ].map(function (value) {
      return Number(value).toFixed(5);
    }).join(" ");
    var modelXml = '<?xml version="1.0" encoding="UTF-8"?>' +
      '<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">' +
      '<metadata name="Title">' + xmlEscape(currentModel.name) + '</metadata>' +
      '<metadata name="Designer">Form 3D Studio</metadata>' +
      '<metadata name="Description">Multi-material AMS model generated locally in Form 3D Studio</metadata>' +
      '<resources><basematerials id="1">' + materialXml + '</basematerials>' + objectXml +
      '<object id="' + assemblyId + '" type="model" name="' + xmlEscape(currentModel.name) + '"><components>' + components + '</components></object>' +
      '</resources><build><item objectid="' + assemblyId + '" transform="' + buildTransform + '"/></build></model>';
    var contentTypes = '<?xml version="1.0" encoding="UTF-8"?>' +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
      '<Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/>' +
      '</Types>';
    var relationships = '<?xml version="1.0" encoding="UTF-8"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/>' +
      '</Relationships>';
    return makeStoredZip([
      { name: "[Content_Types].xml", content: contentTypes },
      { name: "_rels/.rels", content: relationships },
      { name: "3D/3dmodel.model", content: modelXml }
    ]);
  }

  function crc32(bytes) {
    var table = [];
    for (var index = 0; index < 256; index += 1) {
      var value = index;
      for (var bit = 0; bit < 8; bit += 1) value = value & 1 ? 0xedb88320 ^ value >>> 1 : value >>> 1;
      table[index] = value >>> 0;
    }
    var crc = 0xffffffff;
    for (var i = 0; i < bytes.length; i += 1) crc = table[(crc ^ bytes[i]) & 0xff] ^ crc >>> 8;
    return (crc ^ 0xffffffff) >>> 0;
  }

  function makeStoredZip(entries) {
    var encoder = new TextEncoder();
    var localParts = [];
    var centralParts = [];
    var offset = 0;
    entries.forEach(function (entry) {
      var name = encoder.encode(entry.name);
      var content = typeof entry.content === "string" ? encoder.encode(entry.content) : entry.content;
      var checksum = crc32(content);
      var local = new Uint8Array(30 + name.length + content.length);
      var localView = new DataView(local.buffer);
      localView.setUint32(0, 0x04034b50, true);
      localView.setUint16(4, 20, true);
      localView.setUint16(6, 0, true);
      localView.setUint16(8, 0, true);
      localView.setUint16(10, 0, true);
      localView.setUint16(12, 0, true);
      localView.setUint32(14, checksum, true);
      localView.setUint32(18, content.length, true);
      localView.setUint32(22, content.length, true);
      localView.setUint16(26, name.length, true);
      localView.setUint16(28, 0, true);
      local.set(name, 30);
      local.set(content, 30 + name.length);
      localParts.push(local);

      var central = new Uint8Array(46 + name.length);
      var centralView = new DataView(central.buffer);
      centralView.setUint32(0, 0x02014b50, true);
      centralView.setUint16(4, 20, true);
      centralView.setUint16(6, 20, true);
      centralView.setUint16(8, 0, true);
      centralView.setUint16(10, 0, true);
      centralView.setUint16(12, 0, true);
      centralView.setUint16(14, 0, true);
      centralView.setUint32(16, checksum, true);
      centralView.setUint32(20, content.length, true);
      centralView.setUint32(24, content.length, true);
      centralView.setUint16(28, name.length, true);
      centralView.setUint16(30, 0, true);
      centralView.setUint16(32, 0, true);
      centralView.setUint16(34, 0, true);
      centralView.setUint16(36, 0, true);
      centralView.setUint32(38, 0, true);
      centralView.setUint32(42, offset, true);
      central.set(name, 46);
      centralParts.push(central);
      offset += local.length;
    });
    var centralOffset = offset;
    var centralSize = centralParts.reduce(function (total, part) { return total + part.length; }, 0);
    var end = new Uint8Array(22);
    var endView = new DataView(end.buffer);
    endView.setUint32(0, 0x06054b50, true);
    endView.setUint16(4, 0, true);
    endView.setUint16(6, 0, true);
    endView.setUint16(8, entries.length, true);
    endView.setUint16(10, entries.length, true);
    endView.setUint32(12, centralSize, true);
    endView.setUint32(16, centralOffset, true);
    endView.setUint16(20, 0, true);
    var totalSize = centralOffset + centralSize + end.length;
    var zip = new Uint8Array(totalSize);
    var cursor = 0;
    localParts.concat(centralParts).concat([end]).forEach(function (part) {
      zip.set(part, cursor);
      cursor += part.length;
    });
    return zip;
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
      if (format === "3mf") {
        downloadBlob(new Blob([make3MF(model)], { type: "model/3mf" }), fileStem() + "-ams.3mf");
        showToast("AMS 3MF project exported");
      } else if (format === "step") {
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
    if (name === "amsColours") return Math.round(value) + " slots";
    if (name === "backgroundTolerance") return Math.round(value) + "%";
    if (name === "imageSmoothing") return ["Off", "Clean", "Smooth"][Math.round(value)] || "Clean";
    if (name === "boxLidAngle") return Math.round(value) + "°";
    if (name === "boxClearance") return Number(value).toFixed(2);
    if (name === "boxGearModule") {
      var fittedModule = Math.min(Number(value), Math.max(0.58, Math.min((state.boxWidth - 14) / 30, (state.boxHeight - 5) / 20)));
      return fittedModule.toFixed(2) + (fittedModule + 0.001 < Number(value) ? " · fitted" : "");
    }
    if (name === "boxGearTurn") {
      if (Number(value) <= 2) return Math.round(value) + "° · locked";
      if (Number(value) >= 92) return Math.round(value) + "° · released";
      return Math.round(value) + "° · moving";
    }
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
    document.querySelectorAll(".gear-controls").forEach(function (element) {
      element.classList.toggle("hidden", state.mode !== "box" || !state.boxLid || !state.boxLatch);
    });
    document.querySelectorAll(".background-controls").forEach(function (element) {
      element.classList.toggle("hidden", state.mode !== "keychain" || !state.removeBackground);
    });
    document.querySelectorAll(".ams-export").forEach(function (element) {
      element.classList.toggle("hidden", state.mode !== "keychain");
    });
    document.querySelectorAll("[data-gear-state]").forEach(function (button) {
      var target = Number(button.dataset.gearState);
      var active = Math.abs(state.boxGearTurn - target) < 2;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    document.querySelectorAll("[data-color]").forEach(function (button) { button.classList.toggle("active", button.dataset.color === state.color); });
  }

  function animateGearPosition(target) {
    cancelAnimationFrame(mechanismAnimation);
    var start = state.boxGearTurn;
    var startedAt = performance.now();
    var duration = 460 + Math.abs(target - start) * 2.2;
    function frame(now) {
      var progress = clamp((now - startedAt) / duration, 0, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      state.boxGearTurn = start + (target - start) * eased;
      syncControls();
      buildModel();
      if (progress < 1) mechanismAnimation = requestAnimationFrame(frame);
      else {
        state.boxGearTurn = target;
        syncControls();
        saveState();
        buildModel();
      }
    }
    mechanismAnimation = requestAnimationFrame(frame);
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
        if (name === "boxLid" || name === "boxLatch" || name === "removeBackground") syncControls();
        saveState();
        scheduleBuild();
      });
    });

    document.querySelectorAll("[data-gear-state]").forEach(function (button) {
      button.addEventListener("click", function () {
        animateGearPosition(Number(button.dataset.gearState));
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
