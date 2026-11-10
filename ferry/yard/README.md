# Johansson Shipyard: newbuilding No. 1, the Chisum

The owner, 11 November 2026: "This ferry optimisation will eventually replace the Minato Maru in Johansson world and Sakura
World , its important we get it tight, I want you to act as a class inspector and we simulate that this is real ship
construction my shipyard is called Johansson Shipyard , economy in building the ship is secondary , what's important is that we
build a fully functional ferry that is classified etc , I want this to generate the proper papery work a real shipyard would
have. […] I want you to build a "real" ship with simulations for all steps to make even the paperwork real". And: "If a real
ship construction firm saw our paper work and the model they should be impressed".

That is the standard for everything under `ferry/`: **a yard's own people should find the paperwork and the model in order.**
This folder holds the paperwork.

## Who is who

| | |
|---|---|
| **The yard** | Johansson Shipyard. It designs and builds her: the model (`../blender/`), the register of her systems (`../systems/`), the drawings and calculations listed in `document-register.csv` |
| **The ship** | The Chisum, newbuilding No. 1 (a working number until the owner gives the yard's own): a 34.5 m car and passenger ferry for the Minato to Kitano-jima service |
| **The owner** | The owner of this site, for whom she is built, and who decides |
| **Class** | A surveyor who reads what the yard submits, as a classification society's plan approval and survey departments would, and writes it up: comment sheets on drawings (`class/PA-…`), survey reports on the build (`class/SR-…`), and, when everything is closed, her certificates |

**The society is not a real one, and none of this is a real class document.** It is the working name *Minato Register of Shipping*
(for the owner to rename), a society of Johansson World. Nothing here imitates the forms, notations or marks of an existing
society, and no approval here means a real ship may be built from it. What is real is the engineering: each comment says which
requirement it rests on, where that requirement comes from, and **whether its text was checked or is recalled**. A recalled
requirement is a lead, not a finding, until it has been read.

## How she is built, step by step

1. **Rule basis.** Settled by the owner on 11 November 2026 ("Rectify and proceed work according to your recommendations"):
   **the international conventions are the benchmark**: SOLAS as for a passenger ship, COLREG and the Load Line convention,
   though a 34.5 m ferry on her service would be a domestic ship under her flag's own rules. Where a regulation binds only
   larger ships she meets it all the same. `class/PA-001` lists what has been read of them, where, and what is still recalled.
2. **Plan approval, section by section.** The yard submits a section (first: the navigation bridge). Class reads it and writes a
   comment sheet. The yard answers each comment by changing the design or by showing why it stands. A section is approved when no
   comment of category A is open. The navigation bridge was approved with comments on 11 November 2026 (PA-001 revision 1).
   The yard's calculations are programs that read the model and the register (`calc/`): run again after any change, they
   stop with an error when a result leaves its limit. They found five defects in the bridge that reading the drawings had not.
3. **Construction.** The model is built from the approved documents; class surveys it against them (`SR-…`): that what is drawn
   is what was approved, and that the checks the yard claims were run.
4. **Tests and trials**, simulated honestly: a test is a calculation or a run of the model with a stated method and a result, never
   a line that says "passed" with nothing behind it. Inclining test and stability, load balance, short-circuit and voltage
   drop, bilge and fire pump capacities, steering gear timing, bridge visibility, noise and escape.
5. **Certificates and the delivery documents**, when the list is closed.

## The paperwork

Paths in this folder that begin with `temp/minato-maru/` or `ferry/design/bridge/` are on the development branch
`claude/festive-rubin-fo8mmp`, not on `main`: the other ship's working drawings and the survey of her bridge.

`document-register.csv` lists what a yard holds for a ship of this kind: 83 documents, each with its number, what it is, and
whether it **exists** (with where), is **partly** there, or is **to do**. Documents are numbered by ship group (1 general, 2 hull,
3 cargo equipment: the ramp and car deck, 4 ship equipment: navigation, steering, anchoring, 5 crew and passengers, 6 machinery,
7 machinery systems, 8 ship systems and electrical), after the SFI group system's main groups as I recall them, and 9 for class.

The yard's own quality documents (a quality manual and its quality, environmental and health and safety policies, modelled on
Oresund Dry Docks' and numbered `JSY-…`) are listed in the register and **kept by the owner outside this repository**, by the
owner's instruction of 11 November 2026: "these shouldn't be pushed". They are not to be added here.

## Reference material that would help

The owner asked: "If we find public general arrangement or installation drawings would that be helpful ?" Yes. They are studied
and measured, never traced or copied (as for New Yokosuka and the HAER drawings of M/V Ranger III, `../README.md`). In order of
use to her:

1. **A general arrangement and tank plan of a small double-ended or bow-ramp car ferry, 25 to 45 m**: the layout of machinery
   spaces, the engine control room, crew spaces with their wet units, the car deck's lanes, pillars and ramp. Nothing in the
   public domain was found for this type on 10 November.
2. **The rule texts themselves**, which are published: the conventions' regulations on steering gear, emergency power, fire
   detection, bridge visibility, navigation lights and radio; and one society's rules for small passenger ships. With them the
   word "recalled" comes out of the comment sheets. The conventions' regulations for the bridge were read on 11 November
   (`class/PA-001`, the rule basis); a society's rules for the electrical installation have not been.
3. **An electrical one-line diagram and load balance** of a ship with two generators and an emergency generator.
4. **Machinery and piping diagrams** (bilge, ballast, fire main, fuel, cooling, compressed air) of a twin-screw vessel of her power.
5. **A shipyard's own standard documents**: an inspection and test plan, a sea trial programme, a docking plan.

## The yard's model: Oresund Dry Docks

The owner, 11 November 2026: "I want the Oresund drydocks be the inspiration for the Johansson Shipyard , we will build it later
too when I'm happy with the 3d vessel" (<https://oddab.eu/downloads/>). A standing inspiration, studied and never copied; the
yard is built after the ship. Read from their site on 11 November 2026 (figures as their *Shipyard* page gives them):

- A repair and conversion yard at Landskrona, Sweden, of about 100 people, on a complex of 100,000 m² with 35,000 m² of roofed
  workshops (200 t lifting capacity, 19.4 m lifting height).
- **A dry dock 202 × 34 × 7 m** in the middle of the complex, with two pits for azimuth thrusters and 50 and 20 t cranes.
- **A floating dock 165 × 28 × 7 m**, 8,000 t lifting capacity, along the northern quay.
- Quays: northern 115 m (6 m of water), southern 260 m (7 m), western 260 m (8 m), cranes to 130 t (180 t in all); shore
  power at 400 or 440 V, 50 or 60 Hz, to 2,000 A.
- **What a real yard publishes**, which is the list Johansson Shipyard's own front office should have: a quality policy, an
  environmental policy, a health and safety policy, its general terms (and the standard repair contract it works to), and its
  certificates: quality management (ISO 9001), environment (ISO 14001), occupational safety (ISO 45001), welding quality
  (ISO 3834-2) and steel structures (EN 1090-1).

Their site lists 635 m of quay by name and says "more than 800 m" in all; nothing here was measured beyond what the page says.
