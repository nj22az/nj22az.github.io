# Studio integration handover

## Completed

- Model workshop ported to current main, focused checks and browser round trip passed; #275 merged.
- Room project changes ported without merging the old work branch's unrelated history.
- World asset purpose inventory, review UI/MCP and static room support operations implemented.
- Sato Ramen's unsupported drinks corner identified by a ray query (base .92 m, floor .04 m); authored stand and collider added.
- Existing jojo film implementation inspected. Unpushed duplicate Remotion prototype checkpointed locally and excluded.
- Clean plate/camera/cast staging export reuses Build scene and targets jojo/remotion.

## Decisions

The historical work branch and main diverged by hundreds of commits. Apply only feature diffs onto current main.
Current main has no johansson-town-live publishing workflow; main-target commits explicitly document the port.
Preserve current surface/stair fixes from #280. No repository split.

## Open issues

Full visual animation-track editing is still unimplemented. Staging packets require mapping into an existing jojo
episode; they do not include a depth matte or collision approval. Actors' custom scales/elevated floors/takes are flagged.
Room publication into World still needs reference-aware collision/door/seat/route integration and rollback.
Support sampling does not prove physical balance or exact contact. Physical iPad/Safari remains untested.

## Next action

Fixed checks and independent review completed; both review findings corrected. Push the reviewed room/library integration onto current main and merge #277. The full animation editor and reference-aware World publication remain separate unfinished implementation work.
