/**
 * Från innehållsdatabasen: byggs med innehall.py bygg tentamen. Ändra källposterna, inte utdata.
 * Det färdiga skriptet klistras in i ett nytt projekt på https://script.google.com/.
 * Kör skapaOvningstentamen. Inga tilläggstjänster, API-nycklar eller triggers behövs.
 * Frågor, alternativ, facit och kriterier hämtas från innehållsdatabasen.
 * Det här är den frivilliga övningstentan, inte den bedömda skriftliga tentamen.
 */
const UPPGIFTER = [
  {
    "nummer": 1,
    "id": "EL-000851",
    "revision": 2,
    "titel": "Länspumpens energi",
    "fraga": "En länspump på 24 V DC tar 4,5 A och går sammanlagt 6 h per dygn. Beräkna effekt, energi i kWh och laddning i Ah per dygn.",
    "losning": "P = 24 · 4,5 = 108 W. E = 0,108 kW · 6 h ≈ 0,65 kWh. Q = 4,5 A · 6 h = 27 Ah. Energi och laddning är olika storheter.",
    "kriterier": [
      "Visar samband, insättning och enhetsomvandling för effekt, energi och laddning.",
      "Förklarar skillnaden mellan energi och laddning och kontrollerar storleksordningen."
    ],
    "fragor": [
      {
        "id": "a",
        "text": "Vilken elektrisk effekt tar länspumpen?",
        "alternativ": [
          "5,33 W",
          "0,108 W",
          "144 W",
          "108 W"
        ],
        "ratt": 3
      },
      {
        "id": "b",
        "text": "Hur mycket energi använder pumpen per dygn?",
        "alternativ": [
          "0,108 kWh",
          "27 kWh",
          "0,648 kWh (cirka 0,65 kWh)",
          "648 kWh"
        ],
        "ratt": 2
      },
      {
        "id": "c",
        "text": "Vilken laddning tar pumpen per dygn?",
        "alternativ": [
          "648 Ah",
          "27 Ah",
          "0,75 Ah",
          "108 Ah"
        ],
        "ratt": 1
      }
    ]
  },
  {
    "nummer": 2,
    "id": "EL-000852",
    "revision": 4,
    "titel": "Belastad spänningsdelare",
    "fraga": "24 V matar R₁ = 3 kΩ i serie med R₂ = 6 kΩ. Beräkna utspänningen över R₂ utan last och när en last på 6 kΩ ansluts över R₂.",
    "losning": "Utan last: 24 · 6/9 = 16 V. Med last: R (index p) = 6 · 6/12 = 3 kΩ, U (index ut) = 24 · 3/6 = 12 V. Lasten sänker utspänningen eftersom den nedre resistansen minskar.",
    "kriterier": [
      "Visar ekvivalent resistans och spänningsdelning både utan och med last.",
      "Förklarar lastens inverkan på utspänningen."
    ],
    "fragor": [
      {
        "id": "a",
        "text": "Vilken utspänning får du utan last?",
        "alternativ": [
          "12 V",
          "24 V",
          "16 V",
          "8 V"
        ],
        "ratt": 2
      },
      {
        "id": "b",
        "text": "Vilken utspänning får du med lasten ansluten?",
        "alternativ": [
          "6 V",
          "12 V",
          "16 V",
          "8 V"
        ],
        "ratt": 1
      },
      {
        "id": "c",
        "text": "Varför ändras utspänningen när lasten ansluts?",
        "alternativ": [
          "Lasten ligger parallellt med det nedre motståndet och sänker dess ekvivalenta resistans.",
          "Lasten ökar matningsspänningen.",
          "Lasten ligger i serie med båda motstånden.",
          "Det övre motståndet kortsluts automatiskt."
        ],
        "ratt": 0
      }
    ]
  },
  {
    "nummer": 3,
    "id": "EL-000853",
    "revision": 3,
    "titel": "Kabelns spänningsfall",
    "fraga": "En 24 V-last tar 10 A. Enkel kabellängd är 15 m och arean 4 mm² koppar (ρ = 0,0175 Ω·mm²/m). Beräkna slingresistans, spänningsfall i volt och procent, och förlusteffekt i kabeln.",
    "losning": "R (index slinga) = 0,0175 · 30/4 ≈ 0,131 Ω. ΔU = 10 · 0,131 ≈ 1,31 V ≈ 5,5 % av 24 V. P (index förlust) = 10² · 0,131 ≈ 13 W.",
    "kriterier": [
      "Tar med båda ledarna i kabelslingan och använder rätt referens för procenttalet.",
      "Visar samband och enheter för spänningsfall och förlusteffekt."
    ],
    "fragor": [
      {
        "id": "a",
        "text": "Vilken är kabelns slingresistans?",
        "alternativ": [
          "0,525 Ω",
          "0,131 Ω",
          "0,0656 Ω",
          "1,31 Ω"
        ],
        "ratt": 1
      },
      {
        "id": "b",
        "text": "Vilket spänningsfall får du i volt och procent av matningsspänningen?",
        "alternativ": [
          "1,31 V och cirka 5,5 %",
          "0,656 V och cirka 2,7 %",
          "13,1 V och cirka 54,7 %",
          "1,31 V och cirka 0,55 %"
        ],
        "ratt": 0
      },
      {
        "id": "c",
        "text": "Vilken förlusteffekt utvecklas i kabeln?",
        "alternativ": [
          "Cirka 1,3 W",
          "Cirka 131 W",
          "240 W",
          "Cirka 13 W"
        ],
        "ratt": 3
      }
    ]
  },
  {
    "nummer": 4,
    "id": "EL-000854",
    "revision": 3,
    "titel": "Sinusspänning",
    "fraga": "Vägguttaget hemma ger 230 V, 50 Hz. Beräkna toppvärde och period. Vilket momentanvärde har spänningen 2,5 ms efter en stigande nollpassage?",
    "losning": "û = √2 · 230 ≈ 325 V. T = 20 ms. 2,5 ms är en åttondels period, alltså 45°: u = 325 · sin 45° ≈ 230 V.",
    "kriterier": [
      "Kopplar effektivvärde, toppvärde och period till angivna värden.",
      "Visar tidens fasläge och använder rätt vinkelenhet i sinusberäkningen."
    ],
    "fragor": [
      {
        "id": "a",
        "text": "Vilket toppvärde har sinusspänningen?",
        "alternativ": [
          "Cirka 325 V",
          "230 V",
          "Cirka 163 V",
          "460 V"
        ],
        "ratt": 0
      },
      {
        "id": "b",
        "text": "Vilken period har sinusspänningen?",
        "alternativ": [
          "50 ms",
          "10 ms",
          "0,02 ms",
          "20 ms"
        ],
        "ratt": 3
      },
      {
        "id": "c",
        "text": "Vilket momentanvärde får du vid den angivna tidpunkten?",
        "alternativ": [
          "Cirka +325 V",
          "Cirka -230 V",
          "Cirka +230 V",
          "0 V"
        ],
        "ratt": 2
      }
    ]
  },
  {
    "nummer": 5,
    "id": "EL-000855",
    "revision": 3,
    "titel": "RL-last",
    "fraga": "En last består av R = 20 Ω i serie med en spole med X (index L) = 15 Ω vid 50 Hz. Den ansluts till 230 V i ett vägguttag i land. Beräkna |Z|, I, cos φ, P, Q och S.",
    "losning": "|Z| = √(20² + 15²) = 25 Ω. I = 230/25 = 9,2 A. cos φ = 20/25 = 0,80. P = I²R = 9,2² · 20 ≈ 1 693 W. Q = I²X (index L) = 9,2² · 15 ≈ 1 270 var. S = U · I = 230 · 9,2 = 2 116 VA. Kontroll: √(1 693² + 1 270²) ≈ 2 116 VA.",
    "kriterier": [
      "Visar impedans, ström och effektfaktor med rimliga enheter.",
      "Redovisar aktiv, reaktiv och skenbar effekt och kontrollerar effekttriangeln."
    ],
    "fragor": [
      {
        "id": "a",
        "text": "Vilka värden får du på impedansens belopp och strömmen?",
        "alternativ": [
          "35 Ω och 6,57 A",
          "5 Ω och 46 A",
          "20 Ω och 11,5 A",
          "25 Ω och 9,2 A"
        ],
        "ratt": 3
      },
      {
        "id": "b",
        "text": "Vilken effektfaktor har lasten?",
        "alternativ": [
          "1,00",
          "0,75",
          "0,80",
          "0,60"
        ],
        "ratt": 2
      },
      {
        "id": "c",
        "text": "Vilken kombination av aktiv, reaktiv och skenbar effekt stämmer?",
        "alternativ": [
          "P ≈ 1 693 W, Q = 0 var, S ≈ 1 693 VA",
          "P ≈ 1 693 W, Q ≈ 1 270 var, S = 2 116 VA",
          "P = 2 116 W, Q ≈ 1 270 var, S ≈ 1 693 VA",
          "P ≈ 1 270 W, Q ≈ 1 693 var, S = 2 116 VA"
        ],
        "ratt": 1
      }
    ]
  },
  {
    "nummer": 6,
    "id": "EL-000856",
    "revision": 5,
    "titel": "Samma värmare i Y och Δ",
    "fraga": "Tre värmeelement på 23 Ω vardera ansluts till ett 400 V-nät i land. Beräkna grenspänning, linjeström och total effekt i Y och i Δ.",
    "losning": "Y: U (index gren) = 400/√3 ≈ 231 V, I (index L) = 231/23 ≈ 10,0 A, P = 3 · 231²/23 ≈ 6,96 kW. Δ: U (index gren) = 400 V, I (index gren) = 400/23 ≈ 17,4 A, I (index L) = √3 · 17,4 ≈ 30,1 A, P = 3 · 400²/23 ≈ 20,9 kW, tre gånger effekten i Y.",
    "kriterier": [
      "Skiljer gren- och linjestorheter i Y och Δ.",
      "Visar effektberäkningarna och förklarar förhållandet mellan kopplingarna."
    ],
    "fragor": [
      {
        "id": "a",
        "text": "Vilka värden gäller i Y: grenspänning, linjeström och total effekt?",
        "alternativ": [
          "231 V, 17,4 A och 12,0 kW",
          "400 V, 10,0 A och 6,96 kW",
          "Cirka 231 V, 10,0 A och 6,96 kW",
          "400 V, 17,4 A och 20,9 kW"
        ],
        "ratt": 2
      },
      {
        "id": "b",
        "text": "Vilka värden gäller i Δ: grenspänning, linjeström och total effekt?",
        "alternativ": [
          "690 V, cirka 30,1 A och 36,0 kW",
          "400 V, cirka 30,1 A och 20,9 kW",
          "231 V, cirka 10,0 A och 6,96 kW",
          "400 V, cirka 17,4 A och 12,0 kW"
        ],
        "ratt": 1
      },
      {
        "id": "c",
        "text": "Hur förhåller sig effekten i Δ till effekten i Y vid samma huvudspänning?",
        "alternativ": [
          "Effekten i Δ är tre gånger effekten i Y.",
          "Effekten är lika stor.",
          "Effekten i Y är tre gånger effekten i Δ.",
          "Effekten i Δ är roten ur tre gånger effekten i Y."
        ],
        "ratt": 0
      }
    ]
  },
  {
    "nummer": 7,
    "id": "EL-000857",
    "revision": 3,
    "titel": "Bruten neutralledare",
    "fraga": "En 60 W-lampa sitter mellan L1 och N och en 15 W-lampa mellan L2 och N (båda märkta 230 V) i ett 400/230 V-nät i land. Neutralledaren bryts. Räkna med konstanta resistanser och beräkna spänningen över varje lampa. Vad händer i verkligheten?",
    "losning": "R = U²/P: 60 W ≈ 882 Ω, 15 W ≈ 3 527 Ω. Utan N ligger lamporna i serie över 400 V. I = 400/4 408 ≈ 0,091 A. 60 W-lampan får ≈ 80 V, 15 W-lampan ≈ 320 V. Den svaga lampan får långt över sin märkspänning och går sönder. Lasten med minst effekt drabbas hårdast.",
    "kriterier": [
      "Härleder resistansmodellen och spänningsfördelningen vid neutralbrott.",
      "Förklarar risken och att konstant resistans är en förenkling."
    ],
    "fragor": [
      {
        "id": "a",
        "text": "Vilken spänning får 60 W-lampan med uppgiftens resistansmodell?",
        "alternativ": [
          "200 V",
          "Cirka 80 V",
          "Cirka 320 V",
          "230 V"
        ],
        "ratt": 1
      },
      {
        "id": "b",
        "text": "Vilken spänning får 15 W-lampan med uppgiftens resistansmodell?",
        "alternativ": [
          "Cirka 320 V",
          "Cirka 80 V",
          "230 V",
          "200 V"
        ],
        "ratt": 0
      },
      {
        "id": "c",
        "text": "Vilken slutsats följer av beräkningen?",
        "alternativ": [
          "Båda lamporna får alltid sin märkspänning.",
          "60 W-lampan får högst spänning eftersom dess märkeffekt är störst.",
          "Neutralbrottet gör automatiskt båda lamporna spänningslösa.",
          "15 W-lampan får överspänning; de konstanta resistanserna är en förenklad modell."
        ],
        "ratt": 3
      }
    ]
  },
  {
    "nummer": 8,
    "id": "EL-000858",
    "revision": 2,
    "titel": "Riskbedömning före arbete",
    "fraga": "En belysningsgrupp i maskinrummet ska felsökas. Arbetsplanen säger: ”Säkringen F12 är urtagen, börja arbeta.” Gruppen kan även matas från nödtavlan. Beskriv minst tre brister och vad som ska göras innan arbete utan spänning får börja.",
    "losning": "Ett bra svar tar upp: nödtavlan saknas i planen och måste frånskiljas också; urtagen säkring är inte skyddad mot återinsättning (lås och märkning behövs); spänningslöshet är inte kontrollerad med provare på arbetsstället; ingen ansvarig eller arbetsgräns anges. Arbetet börjar först när alla matningar är frånskilda, låsta, kontrollerade och ett tydligt startbesked givits.",
    "kriterier": [
      "Kopplar minst tre konkreta brister i planen till motsvarande åtgärder.",
      "Beskriver ansvar, arbetsgräns och villkor för att arbete får börja."
    ],
    "fragor": [
      {
        "id": "a",
        "text": "Vilken matning saknas i den beskrivna arbetsplanen?",
        "alternativ": [
          "Den möjliga matningen från nödtavlan.",
          "Endast strömmen genom lampornas neutralledare.",
          "Ingen, det räcker att F12 är urtagen.",
          "Endast en tänkt trefastransformator som inte nämns i underlaget."
        ],
        "ratt": 0
      },
      {
        "id": "b",
        "text": "Vad saknas för att hindra återinkoppling?",
        "alternativ": [
          "Enbart ett muntligt antagande att ingen sätter tillbaka säkringen.",
          "Att hålla en START-knapp intryckt.",
          "Att ställa multimetern på resistansmätning.",
          "Säkring mot återinkoppling genom låsning och märkning av berörda frånskiljningar."
        ],
        "ratt": 3
      },
      {
        "id": "c",
        "text": "Vilken kontroll och vilket besked behövs före arbete utan spänning?",
        "alternativ": [
          "Enbart att säkringen ser hel ut.",
          "Ett startbesked innan den andra matningen har utretts.",
          "Kontroll av spänningslöshet på arbetsstället och tydligt startbesked inom angiven arbetsgräns.",
          "Enbart att belysningen är släckt."
        ],
        "ratt": 2
      }
    ]
  },
  {
    "nummer": 9,
    "id": "EL-000859",
    "revision": 3,
    "titel": "Motorn",
    "fraga": "En fyrpolig motor är märkt 7,5 kW, Δ/Y 400/690 V, 1 455 r/min, η = 0,89 och cos φ = 0,84. Nätet i land är 400 V, 50 Hz. Vilken koppling används? Beräkna eftersläpning, elektrisk inmatning och linjeström vid märklast.",
    "losning": "Δ, eftersom lindningen är avsedd för 400 V. n (index s) = 1 500 r/min, s = 45/1 500 = 3,0 %. P (index in) = 7,5/0,89 ≈ 8,43 kW. I (index L) = 8 430/(√3 · 400 · 0,84) ≈ 14,5 A.",
    "kriterier": [
      "Motiverar kopplingen från märkdata och visar beräkningen av eftersläpning.",
      "Skiljer axeleffekt från elektrisk inmatning och visar beräkningen av linjeström."
    ],
    "fragor": [
      {
        "id": "a",
        "text": "Vilken koppling ska motorn ha på det angivna nätet?",
        "alternativ": [
          "Y",
          "Valfri koppling ger samma märkdrift.",
          "Varken Y eller Δ får användas vid någon nätspänning.",
          "Δ"
        ],
        "ratt": 3
      },
      {
        "id": "b",
        "text": "Vilken eftersläpning har motorn vid märklast?",
        "alternativ": [
          "97,0 %",
          "4,5 %",
          "3,0 %",
          "0,30 %"
        ],
        "ratt": 2
      },
      {
        "id": "c",
        "text": "Vilken elektrisk inmatning och linjeström får du vid märklast?",
        "alternativ": [
          "Cirka 8,43 kW och 8,36 A",
          "Cirka 8,43 kW och 14,5 A",
          "7,50 kW och 12,9 A",
          "Cirka 6,68 kW och 11,5 A"
        ],
        "ratt": 1
      }
    ]
  },
  {
    "nummer": 10,
    "id": "EL-000860",
    "revision": 2,
    "titel": "Hållkrets som inte startar",
    "fraga": "12 V DC: +U → S0 STOPP (NC) → punkt a → S1 START (NO) parallellt med K1 NO → punkt b → K1-spole → punkt c → retur → 0 V. K1 drar inte när START hålls in. Mätt mot 0 V med START intryckt: a = 12 V, b = 0 V, c = 0 V. Var sitter felet och hur bekräftar du det?",
    "losning": "Spänningen finns före START (a) men inte efter (b). Felet ligger mellan a och b: START sluter inte eller en ledare där är av. Bekräfta genom att mäta över S1 med knappen intryckt: 12 V över en intryckt knapp visar att den inte sluter. Returen är inte felet eftersom spolen då skulle ha 12 V på b-sidan.",
    "kriterier": [
      "Skiljer observationerna från hypotesen och avgränsar sökområdet.",
      "Anger mätpunkter, driftläge och vilket resultat som bekräftar eller motsäger hypotesen."
    ],
    "fragor": [
      {
        "id": "a",
        "text": "Vilket sökområde stöds av mätvärdena?",
        "alternativ": [
          "Endast matningskällan före STOPP.",
          "Motorns kraftkrets, utan att undersöka styrkretsen.",
          "Sträckan mellan a och b, inklusive START-kontakten och dess anslutningar.",
          "Sträckan mellan c och 0 V är säkert avbruten."
        ],
        "ratt": 2
      },
      {
        "id": "b",
        "text": "Vilken mätning prövar hypotesen om ett avbrott mellan a och b?",
        "alternativ": [
          "Byt spolen direkt utan en ny mätning.",
          "Mät spänningen mellan a och b med START intryckt.",
          "Mät resistans i den spänningssatta kretsen.",
          "Mät endast mellan c och 0 V igen."
        ],
        "ratt": 1
      },
      {
        "id": "c",
        "text": "Vilket resultat stöder avbrottshypotesen vid denna kontroll?",
        "alternativ": [
          "Cirka 12 V över sträckan a–b medan START hålls intryckt.",
          "0 V över en fungerande sluten sträcka bevisar avbrott.",
          "En strömmätning parallellt över källan.",
          "Samma värde mellan c och 0 V oavsett felställe."
        ],
        "ratt": 0
      }
    ]
  },
  {
    "nummer": 11,
    "id": "EL-000861",
    "revision": 3,
    "titel": "IT-nätet ombord",
    "fraga": "Ett 440 V IT-nät larmar för låg isolation. Isolationsprovning av en utgående grupp med 500 V DC ger en läckström på 0,80 mA. Fartygets instruktion anger minst 1 MΩ. a) Beräkna isolationsresistansen och bedöm den. b) Anta ett fullständigt jordfel på L1. Vilken spänning har L2 och L3 mot skrovet? c) Vad händer vid ett andra jordfel på L2?",
    "losning": "a) R (index iso) = 500/0,00080 = 625 kΩ = 0,625 MΩ, under 1 MΩ. Gruppen ska utredas. b) Omkring 440 V, huvudspänningen, i stället för normalt cirka 254 V. c) Ett andra fel på en annan fas blir en kortslutning mellan L1 och L2 via skrovet. Skydden ska lösa, och stor felström kan ge ljusbåge och brand.",
    "kriterier": [
      "Visar isolationsberäkningen med enhetsomvandling och bedömer den mot instruktionen.",
      "Förklarar fasernas potentialer samt strömväg och risk vid andra jordfelet."
    ],
    "fragor": [
      {
        "id": "a",
        "text": "Vilken isolationsresistans får du, och uppfylls instruktionens gräns?",
        "alternativ": [
          "1,60 MΩ; värdet är över 1 MΩ.",
          "0,625 MΩ; värdet är under 1 MΩ.",
          "625 MΩ; värdet är över 1 MΩ.",
          "0,000625 MΩ; värdet är över 1 MΩ."
        ],
        "ratt": 1
      },
      {
        "id": "b",
        "text": "Vilken spänning får de friska faserna mot skrovet vid det antagna fullständiga jordfelet?",
        "alternativ": [
          "Omkring 440 V",
          "Omkring 254 V",
          "0 V",
          "Omkring 880 V"
        ],
        "ratt": 0
      },
      {
        "id": "c",
        "text": "Vad innebär ett andra jordfel på L2 enligt uppgiftens förutsättningar?",
        "alternativ": [
          "Att första jordfelet automatiskt försvinner.",
          "Att nätet blir ett friskt TN-system.",
          "Att felströmmen säkert blir mindre än vid första felet.",
          "En kortslutningsväg mellan L1 och L2 via skrovet, där skydden ska koppla bort felet."
        ],
        "ratt": 3
      }
    ]
  },
  {
    "nummer": 12,
    "id": "EL-000862",
    "revision": 2,
    "titel": "Uppfyller spänningen kravet?",
    "fraga": "Kravet är 230 V ±1 %. Instrumentet visar 229,4 V med specifikationen ±(0,8 % + 3 siffror) och upplösningen 0,1 V. Kan du intyga att kravet är uppfyllt?",
    "losning": "Krav: 227,7–232,3 V. δ = 0,008 · 229,4 + 3 · 0,1 ≈ 2,1 V. Mätintervall ≈ 227,3–231,5 V. Den nedre gränsen ligger under 227,7 V, så kravet kan inte intygas med detta instrument. Mät med ett noggrannare instrument.",
    "kriterier": [
      "Visar kravintervallet och felgränsens båda delar, inklusive upplösningen.",
      "Jämför hela mätintervallet med kravet och motiverar slutsats och nästa åtgärd."
    ],
    "fragor": [
      {
        "id": "a",
        "text": "Vilket spänningsintervall tillåter kravet?",
        "alternativ": [
          "227,7–232,3 V",
          "229,0–231,0 V",
          "228,4–230,4 V",
          "230,0–232,3 V"
        ],
        "ratt": 0
      },
      {
        "id": "b",
        "text": "Vilken felgräns och vilket mätintervall får du efter avrundning?",
        "alternativ": [
          "Cirka ±0,3 V och 229,1–229,7 V",
          "Cirka ±1,8 V och 227,6–231,2 V",
          "Cirka ±0,021 V och 229,379–229,421 V",
          "Cirka ±2,1 V och 227,3–231,5 V"
        ],
        "ratt": 3
      },
      {
        "id": "c",
        "text": "Vilken slutsats kan du dra om kravet?",
        "alternativ": [
          "Spänningen är säkert för hög.",
          "Spänningen är säkert för låg.",
          "Kravet kan inte intygas med detta mätresultat; ett noggrannare underlag behövs.",
          "Kravet är säkert uppfyllt eftersom visningen ligger inom gränserna."
        ],
        "ratt": 2
      }
    ]
  }
];
const QUIZ_VERSION = '9479e6455574626e';

function skapaOvningstentamen() {
  const lock = LockService.getUserLock();
  lock.waitLock(30000);
  try {
    const properties = PropertiesService.getUserProperties();
    const key = 'SJOSKOLAN_OVNINGSTENTAMEN_' + QUIZ_VERSION;
    const existing = properties.getProperty(key);
    if (existing) {
      const form = FormApp.openById(existing);
      if (properties.getProperty(key + '_klar') !== 'ja') {
        throw new Error('Ett tidigare bygge avbröts. Granska utkastet innan ett nytt skapas: ' + form.getEditUrl());
      }
      return visaQuiz_(form); // Bevara befintliga frågor, lärarändringar och elevsvar vid omkörning.
    }

    // Skapas opublicerat och stängt: läraren väljer resultatvisning och granskar före publicering.
    const form = FormApp.create('Sjöskolan | Övningstentamen i elteknik och ellära', false);
    properties.setProperty(key, form.getId());
    form.setAcceptingResponses(false);
    form.setIsQuiz(true)
      .setDescription('Frivillig träning på kursens tolv scenarier. 36 flervalsfrågor à 1 poäng och tolv skriftliga motiveringar à 2 poäng: totalt 60 poäng. Läraren granskar motiveringarna innan ett fullständigt resultat kan ges. Poängen är ett träningsstöd, inte en officiell betygsgräns. Räkna först själv med papper, räknare och kursens formelsamling. Arbeta i egen takt; formuläret har ingen automatisk tidtagning.')
      .setProgressBar(true)
      .setShuffleQuestions(false)
      .setCollectEmail(false)
      .setLimitOneResponsePerUser(false)
      .setAllowResponseEdits(false)
      .setPublishingSummary(false)
      .setShowLinkToRespondAgain(true)
      .setConfirmationMessage('Dina svar är sparade. De skriftliga motiveringarna behöver granskas av läraren innan du har ett fullständigt resultat. Använd återkopplingen för att välja vad du ska öva mer på.');

    form.addSectionHeaderItem().setTitle('Börja här').setHelpText('Välj ett svar per flervalsfråga. Skriv sedan hur du tänkte. Behåll givna värden, samband, insättning, svar och enheter. Ett nytt försök sparas separat.');
    form.addTextItem().setTitle('Namn').setRequired(true).setPoints(0);
    form.addTextItem().setTitle('Grupp eller klass (frivilligt)').setRequired(false).setPoints(0);

    const avsnitt = {
      1: ['1. Likström, energi och ledningar', 'Uppgift 1–3 | 15 poäng'],
      4: ['2. Växelström', 'Uppgift 4–5 | 10 poäng'],
      6: ['3. Trefas och neutralledare', 'Uppgift 6–7 | 10 poäng'],
      8: ['4. Elsäkerhet och arbetsplanering', 'Uppgift 8 | 5 poäng'],
      9: ['5. Motorer och systematisk felsökning', 'Uppgift 9–10 | 10 poäng'],
      11: ['6. IT-system och mätosäkerhet', 'Uppgift 11–12 | 10 poäng']
    };
    UPPGIFTER.forEach(function (uppgift) {
      if (avsnitt[uppgift.nummer]) {
        const rubrik = avsnitt[uppgift.nummer];
        form.addPageBreakItem().setTitle(rubrik[0]).setHelpText(rubrik[1]);
      }
      form.addSectionHeaderItem().setTitle('Uppgift ' + uppgift.nummer + ': ' + uppgift.titel).setHelpText(uppgift.fraga);
      uppgift.fragor.forEach(function (delfraga) {
        const item = form.addMultipleChoiceItem()
          .setTitle(uppgift.nummer + '.' + delfraga.id + ' ' + delfraga.text)
          .setHelpText('1 poäng. Välj det alternativ som bäst stämmer med ditt eget svar.')
          .setRequired(true).setPoints(1);
        // Blanda alternativen en gång vid skapandet. Facit följer texten, inte bokstaven.
        const alternativ = delfraga.alternativ.map(function (text, i) { return {text: text, ratt: i === delfraga.ratt}; });
        for (let i = alternativ.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          const tmp = alternativ[i]; alternativ[i] = alternativ[j]; alternativ[j] = tmp;
        }
        item.setChoices(alternativ.map(function (a) { return item.createChoice(a.text, a.ratt); }));
        const feedback = FormApp.createFeedback().setText(uppgift.losning)
          .addLink('https://nj22az.github.io/sjoskolan/tentamen/ovningstentamen-facit.pdf', 'Facit med lösningsgång').build();
        item.setFeedbackForCorrect(feedback).setFeedbackForIncorrect(feedback);
      });
      const kriterier = uppgift.kriterier.map(function (k, i) { return (i + 1) + '. ' + k; }).join('\n');
      form.addParagraphTextItem().setTitle(uppgift.nummer + '.d Visa och förklara hur du kom fram till svaren')
        .setHelpText('2 poäng, bedöms av läraren. Redovisa hela uppgiftens beräkningar eller resonemang.\n' + kriterier)
        .setRequired(true).setPoints(2)
        .setGeneralFeedback(FormApp.createFeedback().setText('Bedömningsstöd: 1 poäng per uppfyllt kriterium. Delvis uppfyllda kriterier kan ge delpoäng vid lärarens granskning.\n' + kriterier + '\n\nLösningsgång:\n' + uppgift.losning).build());
    });

    form.addPageBreakItem().setTitle('7. Din fortsatta träning').setHelpText('Frivillig reflektion. Inga poäng.');
    form.addMultipleChoiceItem().setTitle('Hur säker känner du dig på dina lösningar?')
      .setChoiceValues(['Jag behöver öva mer på grunderna.', 'Jag kan metoderna men behöver kontrollera några delar.', 'Jag kan förklara mina lösningar och kontrollera rimligheten.'])
      .setRequired(false).setPoints(0);
    form.addParagraphTextItem().setTitle('Vilka två områden vill du repetera, och vad ska du göra härnäst?').setRequired(false).setPoints(0);
    properties.setProperty(key + '_klar', 'ja');
    return visaQuiz_(form);
  } finally {
    lock.releaseLock();
  }
}

function visaQuiz_(form) {
  const info = {
    redigera: form.getEditUrl(),
    uppgifter: 12, automatiskaFragor: 36, skriftligaMotiveringar: 12, maxpoang: 60,
    nastaSteg: 'Granska utkastet. I Inställningar > Gör till quiz: välj att släppa resultat senare efter manuell granskning och kontrollera vilka rätta svar som visas. Publicera och dela först därefter.'
  };
  console.log(JSON.stringify(info, null, 2));
  return info;
}
