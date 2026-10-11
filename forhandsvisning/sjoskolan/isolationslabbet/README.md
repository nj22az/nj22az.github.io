# Isolationslabbet

Simulator för vecka 44: isolationsövervakning och jordfel i fartygets 440 V IT-nät, och isolationsprovning av en motor.

- `model.mjs` – beräkningar (Millmans sats för skrovets potential, isolationsprovning). Inga DOM-beroenden.
- `lessons.mjs` – räkna-först-uppgifter med facit och vanliga fel.
- `protokoll.mjs` – labbprotokollet och de fasta lägen protokollet mäter i.
- `app.mjs` – ritning, reglage och uppgifter.
- `model.test.mjs` – `node --test sjoskolan/isolationslabbet/model.test.mjs`

## Pekskärm

Uppgiften står först i HTML; mellan 768 och 999 px står schemat över hela bredden med uppgift och reglage under, från 1000 px bredvid. Storlekar i `../gemensamt/labbpekskarm.css`. Beskedet efter ”Hämta avläsning” visas i mätningens ruta.
