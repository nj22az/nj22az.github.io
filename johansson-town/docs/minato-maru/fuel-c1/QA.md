# C1 verification record

FOR DESIGN REVIEW - CONSTRUCTION NOT APPROVED.

- 136 ferry regression checks passed, including eight C1 tests for separate ports, clearance, bounded ownership, rejected obstruction, self-intersection, immutable Revision B references and unchanged accepted non-fuel services.
- Independent Python checks repeat endpoint/topology/orthogonality, equipment/access AABB and pipe-surface separation calculations. See `export-checks.json` for the calculated minimum gap and DXF/PDF export checks.
- All six A3 PDF sheets were rendered and visually inspected. The final plan/profile and 3D view were inspected after route simplification; tables and approval labels remain legible within the page border.
- Six DXFs and the 3D DXF reopen with the parser/auditor without errors. Physical viewports are locked at 1:50; model units are millimetres.
- The 3D OBJ/DXF contain outside-radius cylinder envelopes. Sharp joins do not specify actual bend or fitting geometry. Internal compound assemblies, tank partitions and unvalidated services remain explicit holds.
- All files in the published Revision B reference directory match their pre-change SHA-256 hashes.

This is internal computational and visual verification. It is not an independent professional review, certification, flag/class approval, hydraulic acceptance or proof of real-world buildability.
