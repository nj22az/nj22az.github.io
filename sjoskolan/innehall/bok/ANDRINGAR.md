# Bokgranskning: status efter septemberbygget

Statusnotering 27 september 2026: de två talflaggorna i rapporten nedan utreddes i
`462f9d8cf88f9b8d5a37217c2325828b998c2696`. Enligt de aktuella källposternas `granskning`:

- [EL-000048](../ovningar/EL-000048.json): grenströmmarna stämmer med V_{a} = 6,0 V; boken och kursen säger samma sak.
- [EL-000100](../ovningar/EL-000100.json): 400 V är linjespänningen i resonemanget, inget saknat svarsvärde.

Båda har `numeriskt_kontrollerad: true` och behåller status `att-granska`. De äldre varningarna nedan är därför
inte kvarstående bokrättningar. PDF:en byggdes om till 223 sidor i samma commit; se [byggflöde och granskningsbegränsningar](README.md).

## Historisk rapport före `462f9d8`

Följande är den tidigare genererade EPUB-jämförelsen, bevarad som historik. Ingen ny jämförelse mot den krypterade
EPUB:en har körts vid denna dokumentationsuppdatering. Vid nästa fullständiga granskning ersätter `bok.py granska`
filen från EPUB-arbetskopian och databasen; rättningar görs i innehållskällorna, aldrig i rapportens övningstext.

Genererat av `bok.py granska` mot databasen (448 poster). Databasen är källan; raderna nedan är vad EPUB:en fortfarande har i äldre form. Bokexportören (`innehall.py bygg bok`) skriver in dem i EPUB:en.

2 fält i 2 övningar.

### 5.8 · EL-000048 · att granska (ingen bokändring)

- Boken: V_{a} = 6 V, grenströmmar 2 A och 1 A
- Databasen: Bokens svar innehåller tal som inte finns i kursens facit: [1.0]

### 10.10 · EL-000100 · att granska (ingen bokändring)

- Boken: 400 V mellan faser garanterar inte rätt lastspänning
- Databasen: Bokens svar innehåller tal som inte finns i kursens facit: [400.0]
