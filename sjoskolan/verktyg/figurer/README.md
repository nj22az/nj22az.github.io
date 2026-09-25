# Figurer till veckopresentationerna

Källkod för figurerna som lades in i vecka 40:s presentationer den 25 september 2026. Filerna publiceras inte som elevmaterial.

- `figlib.py` – gemensam stil: Carlito (metriskt lik Calibri), kursens blå `#064F91`, P blå, Q grön, S röd, sökt storhet röd med ”?”.
- `figs40.py` – en funktion per figur. Namnet anger deck och bild, till exempel `v40_01_s13_ovn2`.
- `insert.py` + `spec40.json` – lägger in figurerna på angivna bilder. På övningsbilder smalnas uppgiftstexten av till vänster och figuren placeras till höger. På teoribilder krymps textrutorna till vänster halva och teckenstorleken minskas vid behov. Bilder som redan har en figur (formnamn som börjar med `Figur:`) hoppas över. Varje figur får alternativtext.

Kör från repositoryroten:

```sh
pip install python-pptx matplotlib
python3 sjoskolan/verktyg/figurer/figs40.py sjoskolan/verktyg/figurer /tmp/figs
python3 sjoskolan/verktyg/figurer/insert.py sjoskolan/verktyg/figurer/spec40.json /tmp/figs
```

Figurerna visar givna värden och markerar den sökta storheten, men ger inte svaret. Övningsfigurerna är undervisningsmodeller och inte skalenliga ritningar.
