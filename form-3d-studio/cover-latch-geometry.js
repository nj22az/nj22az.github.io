(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.Form3DCoverLatch = api;
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function clamp(value, minimum, maximum) {
    return Math.max(minimum, Math.min(maximum, value));
  }

  function finite(value, fallback) {
    value = Number(value);
    return Number.isFinite(value) ? value : fallback;
  }

  function calculate(options) {
    options = options || {};
    var width = Math.max(45, finite(options.width, 76));
    var depth = Math.max(35, finite(options.depth, 54));
    var height = Math.max(20, finite(options.height, 34));
    var wall = clamp(finite(options.wall, 2.4), 1.6, 4.5);
    var clearance = clamp(finite(options.clearance, 0.35), 0.15, 0.8);
    var lidThickness = clamp(finite(options.lidThickness, 2.6), 1.8, 5);
    var requestedBayDepth = clamp(finite(options.bayDepth, 9.2), 8, 12);
    var gearTurn = clamp(finite(options.gearTurn, 0), 0, 110);

    var inputTeeth = 12;
    var outputTeeth = 18;
    var maximumModule = Math.max(0.58, Math.min(
      1.05,
      (width - 12) / 48,
      (depth - 10) / 34
    ));
    var gearModule = Math.min(clamp(finite(options.gearModule, 0.8), 0.58, 1.05), maximumModule);
    var radialClearance = Math.max(0.4, clearance);
    var axialClearance = Math.max(0.4, clearance);
    var innerSkin = clamp(wall * 0.66, 1.45, 1.9);
    var minimumGearThickness = Math.max(2.05, gearModule * 2.65);
    var minimumBayDepth = lidThickness + innerSkin + axialClearance * 2 + minimumGearThickness + 0.12;
    var bayDepth = Math.min(12, Math.max(requestedBayDepth, minimumBayDepth));

    var lidBottomZ = height + clearance;
    var lidTopZ = lidBottomZ + lidThickness;
    var cassetteBottomZ = lidTopZ - bayDepth;
    var cavityBottomZ = cassetteBottomZ + innerSkin;
    var cavityTopZ = lidBottomZ;
    var cavityHeight = cavityTopZ - cavityBottomZ;
    var preferredGearThickness = clamp(gearModule * 3.3, 2.3, 3.25);
    var gearThickness = Math.max(1.85, Math.min(
      preferredGearThickness,
      cavityHeight - axialClearance * 2 - 0.12
    ));
    var gearBottomZ = cavityBottomZ + axialClearance;
    var gearTopZ = gearBottomZ + gearThickness;
    var gearZ = (gearBottomZ + gearTopZ) / 2;

    var inputPitchRadius = inputTeeth * gearModule / 2;
    var outputPitchRadius = outputTeeth * gearModule / 2;
    var inputOuterRadius = inputPitchRadius + gearModule;
    var outputOuterRadius = outputPitchRadius + gearModule;
    var gearCentreDistance = inputPitchRadius + outputPitchRadius + Math.max(0.2, radialClearance * 0.55);
    var inputX = -gearCentreDistance / 2;
    var outputX = gearCentreDistance / 2;
    var axleRadius = clamp(gearModule * 1.22, 0.92, 1.38);
    var gearBoreRadius = axleRadius + radialClearance;

    var keeperRadius = clamp(gearModule * 2.02, 1.4, 2.15);
    var hookInnerRadius = keeperRadius + radialClearance + 0.3;
    var hookOuterRadius = Math.max(hookInnerRadius + 1.72, clamp(gearModule * 5.55, 4.15, 5.75));
    var hookReach = clamp(depth * 0.17, 8.1, 10.6);
    var keeperX = outputX;
    var keeperY = -depth / 2 + wall + radialClearance + hookOuterRadius + 1.48;
    var gearY = keeperY + hookReach;
    var inputY = gearY;
    var outputY = gearY;
    var inputAngle = -gearTurn;
    var outputAngle = gearTurn * inputTeeth / outputTeeth;
    var maximumOutputAngle = 110 * inputTeeth / outputTeeth;

    function hookCentre(angleDegrees) {
      var angle = angleDegrees * Math.PI / 180;
      return {
        x: outputX + Math.sin(angle) * hookReach,
        y: outputY - Math.cos(angle) * hookReach
      };
    }

    var hook = hookCentre(outputAngle);
    var sweep = [];
    for (var step = 0; step <= 18; step += 1) {
      sweep.push(hookCentre(maximumOutputAngle * step / 18));
    }
    var hookMinX = Math.min.apply(null, sweep.map(function (point) { return point.x - hookOuterRadius; }));
    var hookMaxX = Math.max.apply(null, sweep.map(function (point) { return point.x + hookOuterRadius; }));
    var hookMinY = Math.min.apply(null, sweep.map(function (point) { return point.y - hookOuterRadius; }));
    var hookMaxY = Math.max.apply(null, sweep.map(function (point) { return point.y + hookOuterRadius; }));
    var enclosurePadding = Math.max(1.35, innerSkin * 0.88);
    var housingLeft = Math.min(inputX - inputOuterRadius, outputX - outputOuterRadius, hookMinX) - enclosurePadding;
    var housingRight = Math.max(inputX + inputOuterRadius, outputX + outputOuterRadius, hookMaxX) + enclosurePadding;
    var housingFront = Math.min(inputY - inputOuterRadius, outputY - outputOuterRadius, hookMinY) - enclosurePadding;
    var housingBack = Math.max(inputY + inputOuterRadius, outputY + outputOuterRadius, hookMaxY) + enclosurePadding;
    var housingWidth = housingRight - housingLeft;
    var housingDepth = housingBack - housingFront;

    var sleeveOuterRadius = gearBoreRadius + Math.max(0.68, gearModule * 0.86);
    var dialRadius = Math.max(sleeveOuterRadius + 0.65, gearModule * 4.85);
    var dialPortRadius = dialRadius + radialClearance;
    var collarOuterRadius = dialPortRadius + Math.max(1.05, innerSkin * 0.68);
    var coverRim = Math.max(2.4, wall * 0.92);
    var coverInnerLeft = -width / 2 - 0.4 + coverRim;
    var coverInnerRight = width / 2 + 0.4 - coverRim;
    var coverInnerFront = -depth / 2 - 0.4 + coverRim;
    var coverInnerBack = depth / 2 + 0.4 - coverRim;
    var keeperWindowHalf = hookOuterRadius + radialClearance + 0.42;
    var keeperWindow = {
      left: keeperX - keeperWindowHalf,
      right: keeperX + keeperWindowHalf,
      front: keeperY - keeperWindowHalf,
      back: keeperY + keeperWindowHalf
    };

    var printable = {
      minimumMovingGap: Math.min(radialClearance, axialClearance),
      gearTopGap: cavityTopZ - gearTopZ,
      gearBottomGap: gearBottomZ - cavityBottomZ,
      housingInsideCover: housingLeft > coverInnerLeft && housingRight < coverInnerRight &&
        housingFront > coverInnerFront && housingBack < coverInnerBack,
      gearThickness: gearThickness,
      sidePrintRequired: true
    };

    return {
      inputTeeth: inputTeeth,
      outputTeeth: outputTeeth,
      maximumModule: maximumModule,
      gearModule: gearModule,
      radialClearance: radialClearance,
      axialClearance: axialClearance,
      requestedBayDepth: requestedBayDepth,
      bayDepth: bayDepth,
      innerSkin: innerSkin,
      lidBottomZ: lidBottomZ,
      lidTopZ: lidTopZ,
      cassetteBottomZ: cassetteBottomZ,
      cavityBottomZ: cavityBottomZ,
      cavityTopZ: cavityTopZ,
      cavityHeight: cavityHeight,
      gearBottomZ: gearBottomZ,
      gearTopZ: gearTopZ,
      gearZ: gearZ,
      gearThickness: gearThickness,
      inputPitchRadius: inputPitchRadius,
      outputPitchRadius: outputPitchRadius,
      inputOuterRadius: inputOuterRadius,
      outputOuterRadius: outputOuterRadius,
      gearCentreDistance: gearCentreDistance,
      inputX: inputX,
      outputX: outputX,
      inputY: inputY,
      outputY: outputY,
      axleRadius: axleRadius,
      gearBoreRadius: gearBoreRadius,
      keeperRadius: keeperRadius,
      hookInnerRadius: hookInnerRadius,
      hookOuterRadius: hookOuterRadius,
      hookReach: hookReach,
      keeperX: keeperX,
      keeperY: keeperY,
      hookX: hook.x,
      hookY: hook.y,
      inputAngle: inputAngle,
      outputAngle: outputAngle,
      housingLeft: housingLeft,
      housingRight: housingRight,
      housingFront: housingFront,
      housingBack: housingBack,
      housingWidth: housingWidth,
      housingDepth: housingDepth,
      sleeveOuterRadius: sleeveOuterRadius,
      dialRadius: dialRadius,
      dialPortRadius: dialPortRadius,
      collarOuterRadius: collarOuterRadius,
      coverRim: coverRim,
      coverInnerLeft: coverInnerLeft,
      coverInnerRight: coverInnerRight,
      coverInnerFront: coverInnerFront,
      coverInnerBack: coverInnerBack,
      keeperWindow: keeperWindow,
      printable: printable
    };
  }

  return { calculate: calculate };
}));
