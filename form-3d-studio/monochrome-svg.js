(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.Form3DMonochrome = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function luminance(red, green, blue) {
    return red * 0.2126 + green * 0.7152 + blue * 0.0722;
  }

  function colourDistanceSquared(first, second) {
    var red = first[0] - second[0];
    var green = first[1] - second[1];
    var blue = first[2] - second[2];
    return red * red + green * green + blue * blue;
  }

  function sampleBackground(pixels, width, height, bounds) {
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

  function otsuThreshold(pixels) {
    var histogram = new Array(256).fill(0);
    var total = 0;
    var totalLuminance = 0;
    for (var index = 0; index < pixels.length; index += 4) {
      if (pixels[index + 3] < 72) continue;
      var value = Math.round(luminance(pixels[index], pixels[index + 1], pixels[index + 2]));
      histogram[value] += 1;
      total += 1;
      totalLuminance += value;
    }
    if (!total) return 128;

    var backgroundWeight = 0;
    var backgroundSum = 0;
    var bestVariance = -1;
    var bestThreshold = Math.round(totalLuminance / total);
    for (var threshold = 0; threshold < 256; threshold += 1) {
      backgroundWeight += histogram[threshold];
      if (!backgroundWeight) continue;
      var foregroundWeight = total - backgroundWeight;
      if (!foregroundWeight) break;
      backgroundSum += threshold * histogram[threshold];
      var backgroundMean = backgroundSum / backgroundWeight;
      var foregroundMean = (totalLuminance - backgroundSum) / foregroundWeight;
      var difference = backgroundMean - foregroundMean;
      var variance = backgroundWeight * foregroundWeight * difference * difference;
      if (variance > bestVariance) {
        bestVariance = variance;
        bestThreshold = threshold;
      }
    }
    return bestThreshold;
  }

  function insideRoundedRectangle(col, row, width, height, radius) {
    var x = col + 0.5;
    var y = row + 0.5;
    var nearestX = clamp(x, radius, width - radius);
    var nearestY = clamp(y, radius, height - radius);
    var dx = x - nearestX;
    var dy = y - nearestY;
    return dx * dx + dy * dy <= radius * radius;
  }

  function smoothLabels(labels, iterations) {
    var height = labels.length;
    var width = labels[0].length;
    var current = labels.map(function (row) { return row.slice(); });
    for (var pass = 0; pass < iterations; pass += 1) {
      var next = current.map(function (row) { return row.slice(); });
      for (var row = 0; row < height; row += 1) {
        for (var col = 0; col < width; col += 1) {
          if (current[row][col] < 0) continue;
          var counts = [0, 0];
          for (var dy = -1; dy <= 1; dy += 1) {
            for (var dx = -1; dx <= 1; dx += 1) {
              if (!dx && !dy) continue;
              var y = row + dy;
              var x = col + dx;
              if (x < 0 || x >= width || y < 0 || y >= height) continue;
              var label = current[y][x];
              if (label >= 0) counts[label] += 1;
            }
          }
          counts[current[row][col]] += 2;
          if (counts[0] !== counts[1]) next[row][col] = counts[1] > counts[0] ? 1 : 0;
        }
      }
      current = next;
    }
    return current;
  }

  function signedArea(points) {
    var area = 0;
    for (var index = 0; index < points.length; index += 1) {
      var next = (index + 1) % points.length;
      area += points[index][0] * points[next][1] - points[next][0] * points[index][1];
    }
    return area / 2;
  }

  function removeCollinear(points) {
    if (points.length <= 3) return points.slice();
    return points.filter(function (point, index) {
      var previous = points[(index - 1 + points.length) % points.length];
      var next = points[(index + 1) % points.length];
      return (point[0] - previous[0]) * (next[1] - point[1]) !==
        (point[1] - previous[1]) * (next[0] - point[0]);
    });
  }

  function segmentDistanceSquared(point, start, end) {
    var dx = end[0] - start[0];
    var dy = end[1] - start[1];
    if (!dx && !dy) {
      dx = point[0] - start[0];
      dy = point[1] - start[1];
      return dx * dx + dy * dy;
    }
    var amount = clamp(((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) / (dx * dx + dy * dy), 0, 1);
    var x = start[0] + amount * dx;
    var y = start[1] + amount * dy;
    dx = point[0] - x;
    dy = point[1] - y;
    return dx * dx + dy * dy;
  }

  function simplifyOpen(points, toleranceSquared) {
    if (points.length <= 2) return points.slice();
    var maximum = toleranceSquared;
    var split = -1;
    for (var index = 1; index < points.length - 1; index += 1) {
      var distance = segmentDistanceSquared(points[index], points[0], points[points.length - 1]);
      if (distance > maximum) {
        maximum = distance;
        split = index;
      }
    }
    if (split < 0) return [points[0], points[points.length - 1]];
    var left = simplifyOpen(points.slice(0, split + 1), toleranceSquared);
    var right = simplifyOpen(points.slice(split), toleranceSquared);
    return left.slice(0, -1).concat(right);
  }

  function simplifyClosed(points, tolerance) {
    var cleaned = removeCollinear(points);
    if (cleaned.length <= 4 || tolerance <= 0) return cleaned;
    var farthest = 1;
    var farthestDistance = -1;
    for (var index = 1; index < cleaned.length; index += 1) {
      var dx = cleaned[index][0] - cleaned[0][0];
      var dy = cleaned[index][1] - cleaned[0][1];
      var distance = dx * dx + dy * dy;
      if (distance > farthestDistance) {
        farthestDistance = distance;
        farthest = index;
      }
    }
    var first = simplifyOpen(cleaned.slice(0, farthest + 1), tolerance * tolerance);
    var second = simplifyOpen(cleaned.slice(farthest).concat([cleaned[0]]), tolerance * tolerance);
    var simplified = removeCollinear(first.concat(second.slice(1, -1)));
    return simplified.length >= 3 ? simplified : cleaned;
  }

  function edgeDirection(edge) {
    if (edge[2] > edge[0]) return 0;
    if (edge[3] > edge[1]) return 1;
    if (edge[2] < edge[0]) return 2;
    return 3;
  }

  function pointKey(x, y) {
    return x + ":" + y;
  }

  function traceContours(labels, options) {
    options = options || {};
    var height = labels.length;
    var width = labels[0].length;
    var edges = [];
    var outgoing = new Map();
    function active(row, col) {
      return row >= 0 && row < height && col >= 0 && col < width && labels[row][col] === 1;
    }
    function addEdge(x0, y0, x1, y1) {
      var edge = [x0, y0, x1, y1];
      var index = edges.push(edge) - 1;
      var key = pointKey(x0, y0);
      var list = outgoing.get(key) || [];
      list.push(index);
      outgoing.set(key, list);
    }
    for (var row = 0; row < height; row += 1) {
      for (var col = 0; col < width; col += 1) {
        if (!active(row, col)) continue;
        if (!active(row - 1, col)) addEdge(col, row, col + 1, row);
        if (!active(row, col + 1)) addEdge(col + 1, row, col + 1, row + 1);
        if (!active(row + 1, col)) addEdge(col + 1, row + 1, col, row + 1);
        if (!active(row, col - 1)) addEdge(col, row + 1, col, row);
      }
    }

    var visited = new Array(edges.length).fill(false);
    var contours = [];
    var tolerance = Number.isFinite(options.simplifyTolerance) ? Math.max(0, options.simplifyTolerance) : 0.62;
    var minimumArea = Number.isFinite(options.minimumArea) ? Math.max(0, options.minimumArea) : Math.max(1.5, width * height * 0.0006);
    for (var startIndex = 0; startIndex < edges.length; startIndex += 1) {
      if (visited[startIndex]) continue;
      var start = edges[startIndex];
      var startKey = pointKey(start[0], start[1]);
      var currentIndex = startIndex;
      var points = [[start[0], start[1]]];
      var closed = false;
      for (var step = 0; step <= edges.length; step += 1) {
        var current = edges[currentIndex];
        if (visited[currentIndex]) break;
        visited[currentIndex] = true;
        points.push([current[2], current[3]]);
        var endKey = pointKey(current[2], current[3]);
        if (endKey === startKey) {
          closed = true;
          break;
        }
        var candidates = (outgoing.get(endKey) || []).filter(function (index) { return !visited[index]; });
        if (!candidates.length) break;
        var direction = edgeDirection(current);
        candidates.sort(function (first, second) {
          function rank(index) {
            var turn = (edgeDirection(edges[index]) - direction + 4) % 4;
            if (turn === 1) return 0;
            if (turn === 0) return 1;
            if (turn === 3) return 2;
            return 3;
          }
          return rank(first) - rank(second);
        });
        currentIndex = candidates[0];
      }
      if (!closed) continue;
      points.pop();
      var simplified = simplifyClosed(points, tolerance);
      var area = signedArea(simplified);
      if (simplified.length < 3 || Math.abs(area) < minimumArea) continue;
      contours.push({ points: simplified, hole: area < 0, area: Math.abs(area) });
    }
    contours.sort(function (first, second) { return second.area - first.area; });
    return contours.slice(0, Math.max(1, Math.round(Number(options.maximumContours) || 64)));
  }

  function svgNumber(value) {
    return Number(value.toFixed(2)).toString();
  }

  function pathFromContours(contours) {
    return contours.map(function (contour) {
      return "M" + contour.points.map(function (point) {
        return svgNumber(point[0]) + " " + svgNumber(point[1]);
      }).join("L") + "Z";
    }).join("");
  }

  function makeSvg(contours, width, height, radius, physicalWidth, physicalHeight) {
    var path = pathFromContours(contours);
    var dimensions = "";
    if (Number.isFinite(physicalWidth) && Number.isFinite(physicalHeight)) {
      dimensions = ' width="' + Number(physicalWidth).toFixed(2) + 'mm" height="' + Number(physicalHeight).toFixed(2) + 'mm"';
    }
    return '<?xml version="1.0" encoding="UTF-8"?>' +
      '<svg xmlns="http://www.w3.org/2000/svg"' + dimensions + ' viewBox="0 0 ' + width + " " + height + '" shape-rendering="geometricPrecision">' +
      '<title>Monochrome keychain artwork</title>' +
      '<rect width="' + width + '" height="' + height + '" rx="' + radius + '" fill="#ffffff"/>' +
      (path ? '<path d="' + path + '" fill="#111111" fill-rule="evenodd"/>' : "") +
      "</svg>";
  }

  function trace(pixels, width, height, bounds, options) {
    options = options || {};
    if (!pixels || pixels.length !== width * height * 4) throw new Error("Invalid RGBA image data");
    var automaticThreshold = otsuThreshold(pixels);
    var thresholdBias = Number.isFinite(options.thresholdBias) ? options.thresholdBias : 50;
    var background = options.removeBackground ? sampleBackground(pixels, width, height, bounds) : null;
    var backgroundLuminance = background ? luminance(background[0], background[1], background[2]) : null;
    var foregroundIsLight = backgroundLuminance !== null && backgroundLuminance <= automaticThreshold;
    var biasAdjustment = (thresholdBias - 50) * 2.4;
    var threshold = clamp(automaticThreshold + (foregroundIsLight ? -biasAdjustment : biasAdjustment), 0, 255);
    var tolerance = (Number(options.backgroundTolerance) || 0) / 100 * Math.sqrt(3 * 255 * 255);
    var toleranceSquared = tolerance * tolerance;
    var radius = Math.max(1, Math.min(Math.min(width, height) / 2, Number(options.cornerRadius) || Math.round(Math.min(width, height) * 0.08)));
    var labels = Array.from({ length: height }, function () { return new Array(width).fill(0); });

    for (var row = 0; row < height; row += 1) {
      for (var col = 0; col < width; col += 1) {
        if (!insideRoundedRectangle(col, row, width, height, radius)) {
          labels[row][col] = -1;
          continue;
        }
        var index = (row * width + col) * 4;
        if (pixels[index + 3] < 72) continue;
        var colour = [pixels[index], pixels[index + 1], pixels[index + 2]];
        if (background && colourDistanceSquared(colour, background) <= toleranceSquared) continue;
        var value = luminance(colour[0], colour[1], colour[2]);
        var foreground = foregroundIsLight ? value >= threshold : value <= threshold;
        if (foreground) labels[row][col] = 1;
      }
    }

    labels = smoothLabels(labels, Math.max(0, Math.round(Number(options.smoothing) || 0)));
    var contours = traceContours(labels, {
      simplifyTolerance: 0.38 + Math.max(0, Number(options.smoothing) || 0) * 0.18,
      minimumArea: Math.max(1.5, width * height * 0.0006),
      maximumContours: 64
    });
    var blackPixels = labels.reduce(function (total, row) {
      return total + row.reduce(function (count, label) { return count + (label === 1 ? 1 : 0); }, 0);
    }, 0);
    return {
      width: width,
      height: height,
      labels: labels,
      contours: contours,
      palette: ["#ffffff", "#111111"],
      svg: makeSvg(contours, width, height, radius, options.physicalWidth, options.physicalHeight),
      threshold: threshold,
      blackPixels: blackPixels
    };
  }

  return {
    trace: trace,
    makeSvg: makeSvg,
    traceContours: traceContours,
    otsuThreshold: otsuThreshold
  };
});
