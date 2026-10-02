# Direction — Johansson Town (October 2026)

> **This replaces `SESSION-PURPOSE.md`** as the statement of what the town is for. The look,
> building kit and avatar rules are still set by `AMPLIFY-AUDIT.md`.

Johansson Town is two things at once:

1. **A place to relax.** You walk round a small Okinawan harbour town, talk to the people
   who live there, do small things (shop at Sakura, drink at Minato, fish, print at the
   workshop) and pick up side stories. Nothing is urgent, and a short visit should feel complete.
2. **A place to learn.** The town shows Nils's real projects from the inside. Johansson the
   engineer explains an engine in the engine room and takes a motor apart in the workshop.
   Thuan shows how a kakeibo works, with a real one in the game. A 1990s computer opens the
   real spreadsheets and documents, which you can download.

Both have to be true at once: the lessons live in places and people you would visit anyway,
and they never get in the way of a quiet walk.

## Settled

- **The year is 1997** (Heisei 9). Where an older note says 1988, it is out of date. The save key
  keeps its old `1988` name so existing saves still load.
- **Thuan is the lead** at Sakura, and Yuri does not exist (unchanged).
- **The cast is the street cast** (`STREET_CAST_NAMES` in `src/people/residents.js`). Anyone who
  takes part in quests must be reachable on the street.
- **Course content stays in Sjöskolan.** Anything the engine room or workshop teaches comes from
  `sjoskolan/innehall/` and keeps its notation. The game shows it; it does not rewrite it.
- **Paid and protected material stays protected.** The 90s computer never hands out the
  Elteknik book or Sjöskolan's encrypted teacher files.

## Still open

- **Who Johansson is.** The player is called Johansson in dialogue and lives in the mayor's wing,
  but the lessons need Johansson to explain things to *someone*. The options are a separate
  Johansson NPC (the player is a visitor), a lecture mode where the player is Johansson, or the
  workshop staff (Kenji, Tetsuo) teaching instead. Decide before building the engine room.

## Pillars and what each needs

| Pillar | Exists | Next |
|---|---|---|
| Relax: walk, talk, small activities | Day clock, residents with routines, friendship hearts, daily wants, shops, izakaya, workshop printing | Keep the first minute calm; fix world edge and night (QA O1/O2) |
| Side stories | **Trade quests** (this change, `TRADE-QUESTS.md`) | More stories; residents mention finished stories in passing |
| Learn: engine room | Sjöskolan's standalone engine room (`sjoskolan/simulatorer/`) | A room by the town hall that opens it, as the workshop opens StepWise |
| Learn: motor teardown | Workshop bench, Form 3D models, Sjöskolan's electrical motor model | Mechanical parts and an exploded-view bench |
| Learn: kakeibo with Thuan | Sakura's shop ledger; the player's yen | A purchase journal for the player, then a kakeibo Thuan can explain |
| Learn: 90s computer | Harbour office workbook viewer with downloads | A window-and-icons shell around it, more file types, a published file list |

## Order of work

1. ~~Direction and year~~ (this document).
2. ~~Trade quests~~ (`TRADE-QUESTS.md`).
3. Player purchase journal → kakeibo with Thuan.
4. The 90s computer shell, starting from `src/office/workbooks.js`.
5. Engine room by the town hall (after Johansson's role is decided).
6. Motor teardown (needs new art).
