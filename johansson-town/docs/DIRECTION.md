# Direction — Johansson Town (October 2026)

> **This replaces `SESSION-PURPOSE.md`** as the statement of what the town is for. The look,
> building kit and avatar rules are still set by `AMPLIFY-AUDIT.md`.

Johansson Town is two things at once:

1. **A place to relax.** You walk round a small Okinawan harbour town, talk to the people
   who live there, do small things (shop at Sakura, drink at Minato, fish, print at the
   workshop) and pick up side stories. Nothing is urgent, and a short visit should feel complete.
2. **A place to learn.** The town shows Nils's real projects from the inside. As Johansson
   you can look round an engine in the engine room and take a motor apart in the workshop.
   Thuan shows you how a kakeibo works, with a real one in the game. A 1990s computer opens
   the real spreadsheets and documents, which you can download.

Both have to be true at once: the lessons live in places and people you would visit anyway,
and they never get in the way of a quiet walk.

## Settled

- **The year is 1997** (Heisei 9). Where an older note says 1988, it is out of date. The save key
  keeps its old `1988` name so existing saves still load.
- **You play Johansson.** The game is played as Johansson, the engineer who lives in the
  mayor's wing of the town hall. Residents talk to him, and what he learns in town, he learns
  by doing.
- **Johansson also teaches, outside the game.** In Sjöskolan's theory lessons, Johansson is the
  engineer on site: he gives the instruction and shows on a 3D model what to do. Those are
  Sjöskolan scenes (like `sjoskolan/simulatorer/`, which already uses his avatar), not part of
  the town. Both use the same character, so his look should come from one shared recipe
  rather than separate copies that drift apart.
- **Thuan is the lead** at Sakura, and Yuri does not exist (unchanged).
- **The cast is the street cast** (`STREET_CAST_NAMES` in `src/people/residents.js`). Anyone who
  takes part in quests must be reachable on the street.
- **Course content stays in Sjöskolan.** Anything the engine room or workshop teaches comes from
  `sjoskolan/innehall/` and keeps its notation. The game shows it; it does not rewrite it.
- **Paid and protected material stays protected.** The 90s computer never hands out the
  Elteknik book or Sjöskolan's encrypted teacher files.

## Pillars and what each needs

| Pillar | Exists | Next |
|---|---|---|
| Relax: walk, talk, small activities | Day clock, residents with routines, friendship hearts, daily wants, shops, izakaya, workshop printing | Keep the first minute calm; fix world edge and night (QA O1/O2) |
| Side stories | **Trade quests** (this change, `TRADE-QUESTS.md`) | More stories; residents mention finished stories in passing |
| Learn: engine room | Sjöskolan's standalone engine room (`sjoskolan/simulatorer/`) | A room by the town hall where you, as Johansson, explore it, as the workshop opens StepWise |
| Teach: Johansson on site | Johansson's avatar, copied into `sjoskolan/simulatorer/character/` | One shared avatar source for the town and Sjöskolan; instructor scenes for theory lessons |
| Learn: motor teardown | Workshop bench, Form 3D models, Sjöskolan's electrical motor model | Mechanical parts and an exploded-view bench |
| Learn: kakeibo with Thuan | Sakura's shop ledger; the player's yen | A purchase journal for the player, then a kakeibo Thuan can explain |
| Learn: 90s computer | Harbour office workbook viewer with downloads | A window-and-icons shell around it, more file types, a published file list |

## The port and the island

The port grows into a Rishiri-style ferry port for passengers, cars and trucks, and the land
grows towards the airport island. `RISHIRI-AUDIT.md` has the reference, the gaps and the open
question of setting (Okinawa, the north, or a mix). Every machine in town (valves, motors,
engines, generators) comes from one shared equipment library that study material can use too.

## Order of work

1. ~~Direction and year~~ (this document).
2. ~~Trade quests~~ (`TRADE-QUESTS.md`).
3. Player purchase journal → kakeibo with Thuan.
4. The 90s computer shell, starting from `src/office/workbooks.js`.
5. Engine room by the town hall.
6. Johansson as the instructor in Sjöskolan theory lessons, from a shared avatar.
7. Motor teardown (needs new art; the same 3D motor can serve the lessons).
