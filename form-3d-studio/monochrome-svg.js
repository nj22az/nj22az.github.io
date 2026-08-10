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

  function pathFromLabels(labels) {
    var commands = [];
    for (var row = 0; row < labels.length; row += 1) {
      var col = 0;
      while (col < labels[row].length) {
        if (labels[row][col] !== 1) {
          col += 1;
          continue;
        }
        var start = col;
        while (col < labels[row].length && labels[row][col] === 1) col += 1;
        var run = col - start;
        commands.push("M" + start + " " + row + "h" + run + "v1h-" + run + "z");
      }
    }
    return commands.join("");
  }

  function makeSvg(labels, width, height, radius, physicalWidth, physicalHeight) {
    var path = pathFromLabels(labels);
    var dimensions = "";
    if (Number.isFinite(physicalWidth) && Number.isFinite(physicalHeight)) {
      dimensions = ' width="' + Number(physicalWidth).toFixed(2) + 'mm" height="' + Number(physicalHeight).toFixed(2) + 'mm"';
    }
    return '<?xml version="1.0" encoding="UTF-8"?>' +
      '<svg xmlns="http://www.w3.org/2000/svg"' + dimensions + ' viewBox="0 0 ' + width + " " + height + '" shape-rendering="geometricPrecision">' +
      '<title>Monochrome keychain artwork</title>' +
      '<rect width="' + width + '" height="' + height + '" rx="' + radius + '" fill="#ffffff"/>' +
      (path ? '<path d="' + path + '" fill="#111111"/>' : "") +
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
    var blackPixels = labels.reduce(function (total, row) {
      return total + row.reduce(function (count, label) { return count + (label === 1 ? 1 : 0); }, 0);
    }, 0);
    return {
      width: width,
      height: height,
      labels: labels,
      palette: ["#ffffff", "#111111"],
      svg: makeSvg(labels, width, height, radius, options.physicalWidth, options.physicalHeight),
      threshold: threshold,
      blackPixels: blackPixels
    };
  }

  return {
    trace: trace,
    makeSvg: makeSvg,
    otsuThreshold: otsuThreshold
  };
});
