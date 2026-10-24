(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.Form3DStepExport = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function stepString(value) {
    return String(value == null ? "" : value).replace(/'/g, "''").replace(/[\r\n]+/g, " ");
  }

  function stepNumber(value, precision) {
    var number = Number(value);
    if (!Number.isFinite(number)) throw new Error("STEP geometry contains a non-finite number");
    var fixed = number.toFixed(precision == null ? 7 : precision).replace(/0+$/, "").replace(/\.$/, "");
    if (fixed === "-0" || fixed === "") fixed = "0";
    if (!fixed.includes(".") && !/[eE]/.test(fixed)) fixed += ".";
    return fixed;
  }

  function tupleRows(rows, formatter) {
    if (!rows.length) return "()";
    return "(\n    " + rows.map(formatter).join(",\n    ") + "\n  )";
  }

  function sequentialIndices(count) {
    var lines = [];
    var line = [];
    for (var index = 1; index <= count; index += 1) {
      line.push(index);
      if (line.length === 128) {
        lines.push(line.join(","));
        line = [];
      }
    }
    if (line.length) lines.push(line.join(","));
    return "(\n    " + lines.join(",\n    ") + "\n  )";
  }

  function vertexNormals(solid) {
    var normals = new Float64Array(solid.vertices.length * 3);
    solid.faces.forEach(function (face) {
      if (!Array.isArray(face) || face.length !== 3) throw new Error("STEP export requires triangulated faces");
      var ia = Number(face[0]), ib = Number(face[1]), ic = Number(face[2]);
      var a = solid.vertices[ia], b = solid.vertices[ib], c = solid.vertices[ic];
      if (!a || !b || !c) throw new Error("STEP face references a missing vertex");
      var ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
      var vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
      var nx = uy * vz - uz * vy;
      var ny = uz * vx - ux * vz;
      var nz = ux * vy - uy * vx;
      [ia, ib, ic].forEach(function (vertexIndex) {
        var offset = vertexIndex * 3;
        normals[offset] += nx;
        normals[offset + 1] += ny;
        normals[offset + 2] += nz;
      });
    });
    return solid.vertices.map(function (_, index) {
      var offset = index * 3;
      var nx = normals[offset], ny = normals[offset + 1], nz = normals[offset + 2];
      var length = Math.hypot(nx, ny, nz);
      if (length < 1e-14) return [0, 0, 1];
      return [nx / length, ny / length, nz / length];
    });
  }

  function makeAP242STEP(currentModel, options) {
    options = options || {};
    if (!currentModel || !Array.isArray(currentModel.solids) || !currentModel.solids.length) {
      throw new Error("STEP export requires at least one solid");
    }

    var entities = [];
    var nextId = 1;
    function add(value) {
      var id = nextId;
      nextId += 1;
      entities.push("#" + id + " = " + value + ";");
      return id;
    }
    function ref(id) { return "#" + id; }

    var appContext = add("APPLICATION_CONTEXT('Managed model based 3d engineering')");
    add("APPLICATION_PROTOCOL_DEFINITION('international standard','ap242_managed_model_based_3d_engineering',2013," + ref(appContext) + ")");
    var productContext = add("PRODUCT_CONTEXT(''," + ref(appContext) + ",'mechanical')");
    var modelName = stepString(currentModel.name || "Form 3D model");
    var product = add("PRODUCT('FORM3D','" + modelName + "','',(" + ref(productContext) + "))");
    var formation = add("PRODUCT_DEFINITION_FORMATION('',''," + ref(product) + ")");
    var definitionContext = add("PRODUCT_DEFINITION_CONTEXT('part definition'," + ref(appContext) + ",'design')");
    var definition = add("PRODUCT_DEFINITION('design',''," + ref(formation) + "," + ref(definitionContext) + ")");
    var productShape = add("PRODUCT_DEFINITION_SHAPE('',''," + ref(definition) + ")");

    var origin = add("CARTESIAN_POINT('',(0.,0.,0.))");
    var zDirection = add("DIRECTION('',(0.,0.,1.))");
    var xDirection = add("DIRECTION('',(1.,0.,0.))");
    var axis = add("AXIS2_PLACEMENT_3D(''," + ref(origin) + "," + ref(zDirection) + "," + ref(xDirection) + ")");
    var tessellatedSolids = [];

    currentModel.solids.forEach(function (solid, solidIndex) {
      if (!solid || !Array.isArray(solid.vertices) || !solid.vertices.length || !Array.isArray(solid.faces) || !solid.faces.length) {
        throw new Error("STEP solid " + (solidIndex + 1) + " has no mesh geometry");
      }
      var solidName = stepString(solid.name || "Solid " + (solidIndex + 1));
      var coordinates = tupleRows(solid.vertices, function (vertex) {
        if (!Array.isArray(vertex) || vertex.length < 3) throw new Error("STEP export requires 3D vertices");
        return "(" + [vertex[0], vertex[1], vertex[2]].map(function (value) { return stepNumber(value, 7); }).join(",") + ")";
      });
      var coordinateList = add("COORDINATES_LIST('" + solidName + "'," + solid.vertices.length + "," + coordinates + ")");
      var normals = tupleRows(vertexNormals(solid), function (normal) {
        return "(" + normal.map(function (value) { return stepNumber(value, 9); }).join(",") + ")";
      });
      var triangles = tupleRows(solid.faces, function (face) {
        return "(" + face.map(function (vertexIndex) { return Number(vertexIndex) + 1; }).join(",") + ")";
      });
      var triangulatedFace = add(
        "TRIANGULATED_FACE('" + solidName + "'," + ref(coordinateList) + "," + solid.vertices.length + "," +
        normals + ",$," + sequentialIndices(solid.vertices.length) + "," + triangles + ")"
      );
      tessellatedSolids.push(add("TESSELLATED_SOLID('" + solidName + "',(" + ref(triangulatedFace) + "),$)"));
    });

    var lengthUnit = add("(LENGTH_UNIT() NAMED_UNIT(*) SI_UNIT(.MILLI.,.METRE.))");
    var angleUnit = add("(NAMED_UNIT(*) PLANE_ANGLE_UNIT() SI_UNIT($,.RADIAN.))");
    var solidAngleUnit = add("(NAMED_UNIT(*) SI_UNIT($,.STERADIAN.) SOLID_ANGLE_UNIT())");
    var uncertainty = add("UNCERTAINTY_MEASURE_WITH_UNIT(LENGTH_MEASURE(1.E-7)," + ref(lengthUnit) + ",'distance_accuracy_value','confusion accuracy')");
    var representationContext = add(
      "(GEOMETRIC_REPRESENTATION_CONTEXT(3) GLOBAL_UNCERTAINTY_ASSIGNED_CONTEXT((" + ref(uncertainty) + ")) " +
      "GLOBAL_UNIT_ASSIGNED_CONTEXT((" + [lengthUnit, angleUnit, solidAngleUnit].map(ref).join(",") + ")) " +
      "REPRESENTATION_CONTEXT('Context #1','3D Context with UNIT and UNCERTAINTY'))"
    );
    var representation = add(
      "ADVANCED_BREP_SHAPE_REPRESENTATION('',(" + [axis].concat(tessellatedSolids).map(ref).join(",") + ")," + ref(representationContext) + ")"
    );
    add("SHAPE_DEFINITION_REPRESENTATION(" + ref(productShape) + "," + ref(representation) + ")");
    add("PRODUCT_RELATED_PRODUCT_CATEGORY('part',$,(" + ref(product) + "))");
    add("TESSELLATED_SHAPE_REPRESENTATION('',(" + tessellatedSolids.map(ref).join(",") + ")," + ref(representationContext) + ")");

    var timestamp = stepString(options.timestamp || new Date().toISOString());
    var fileName = stepString(options.fileName || "form-3d-model.step");
    return [
      "ISO-10303-21;",
      "HEADER;",
      "FILE_DESCRIPTION(('AP242 tessellated solid model exported by Form 3D Studio'),'2;1');",
      "FILE_NAME('" + fileName + "','" + timestamp + "',('Form 3D Studio'),('nj22az.github.io'),'Form 3D Studio','Form 3D Studio','');",
      "FILE_SCHEMA((",
      "'AP242_MANAGED_MODEL_BASED_3D_ENGINEERING_MIM_LF {1 0 10303 442 1 1 4 }'",
      "));",
      "ENDSEC;",
      "DATA;",
      entities.join("\n"),
      "ENDSEC;",
      "END-ISO-10303-21;",
      ""
    ].join("\n");
  }

  return { makeAP242STEP: makeAP242STEP };
});
