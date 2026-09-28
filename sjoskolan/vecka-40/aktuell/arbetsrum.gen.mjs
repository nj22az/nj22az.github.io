// GENERERAD FIL · innehall.py bygg arbetsrum. Redigera innehall/ovningar och studieplan-v40.json.
export const STUDY = {
  "version": 1,
  "cards": {
    "M1": {
      "titel": "Instrumentkort M1",
      "text": "DC-spänning 0–20 V. Upplösning 0,01 V. Felgräns ±(0,5 % av visat värde + 2 siffror). Spänningsingångens resistans är 10 MΩ. Ingen AC-, ström- eller resistansfunktion anges. Konstruerat utbildningsunderlag."
    },
    "M2": {
      "titel": "Instrumentkort M2",
      "text": "Separata DC- och true-RMS AC-spänningslägen. AC-frekvensområde 40–400 Hz. Ω-funktion för avgränsat spänningslöst objekt. Säkrad mA-ingång för likström, högst 200 mA. Konstruerat utbildningsunderlag; övriga instrumentvillkor måste också följas."
    }
  },
  "guidance": {
    "franskiljning": {
      "titel": "Frånskiljning och mätteknik",
      "nar": "Måndag: V2-1 och V2-2 på lektionen. V2-3 och V2-4 hemma före tisdagens lektion.",
      "syfte": "Du ska kunna upptäcka när underlaget inte räcker för en säker mätning och välja ett instrument som passar uppgiften.",
      "gor": [
        "Följ matning A och B i figuren. Skriv vad som behöver kontrolleras innan arbetsområdet kan bedömas som spänningslöst.",
        "Läs instrumentkorten. Välj mätfunktion och beskriv anslutningen för varje fall.",
        "Följ räkneexemplet om felgräns och använd sedan metoden i V2-3. Avsluta med att beskriva vilket underlag som saknas i V2-4."
      ],
      "klar": "Du har sparat ett eget försök till V2-1–V2-4 och kan peka ut det du behöver hjälp med. Läraren bedömer dina motiveringar.",
      "lasuppdrag": {
        "matningar": "Följ A och B fram till lasten i figuren. Leta efter vad vi vet och vad som fortfarande måste verifieras.",
        "instrument": "Jämför kort M1 och M2. Hitta vilka funktioner och begränsningar som avgör om ett instrument går att använda.",
        "felgrans": "Ta reda på vad procentdelen respektive siffrorna betyder. Du ska snart räkna båda delarna i volt.",
        "exempel": "Räkna med på papper. Försök få fram nästa rad innan du visar den. Du använder sedan metoden med andra värden i V2-3.",
        "ansvar": "Leta efter de uppgifter och ansvariga roller som måste vara klarlagda innan ett arbete kan planeras."
      }
    },
    "sinus": {
      "titel": "Sinus och mätvärden",
      "nar": "Måndag: övning 1–3 med läraren. Övning 4–10 hemma före tisdagens lektion.",
      "syfte": "En kurva och en multimeter kan visa olika tal för samma spänning. Du ska kunna avgöra vilket värde du läser och förutsäga mätarens visning.",
      "gor": [
        "Läs hur du hittar en period och räknar tiden för den. Prova sedan själv i svarsfälten.",
        "Följ exemplet om toppvärde och effektivvärde. Räkna övningarna med deras egna värden.",
        "Avsluta med att jämföra vågformer och läsa hur en förväntad och en avläst mätning skrivs i protokollet."
      ],
      "klar": "Du har bearbetat alla tio övningar och kan förklara skillnaden mellan periodtid, toppvärde och effektivvärde. Skriv ned frågor till tisdagens lektion.",
      "lasuppdrag": {
        "kurvan": "Peka ut nollnivån, en positiv topp och en hel period i kurvan. Läs vilken storhet varje axel visar.",
        "period": "Följ hur frekvensen blir en tid. Kontrollera särskilt om svaret står i sekunder eller millisekunder.",
        "topp": "Peka ut sträckan från noll till toppen och sträckan från negativ till positiv topp. Förklara skillnaden.",
        "rms": "Läs vad effektivvärdet betyder för ett värmeelement. Förklara varför det inte är samma tal som kurvans topp.",
        "exempel": "Räkna med på papper. Försök välja samband och enhet innan du visar nästa steg.",
        "medel": "Förklara hur en spänning kan ha medelvärdet noll och ändå värma en resistor.",
        "radianer": "Kontrollera din räknare: hitta RAD och DEG. Läs vilket läge som hör till respektive formel.",
        "moment": "Följ hur millisekunder blir sekunder och hur tiden sätts in i sinusuttrycket. Använd RAD.",
        "fas": "Ta reda på hur en tidsskillnad kan uttryckas som en del av ett helt varv.",
        "kurvformer": "Jämför sinus och fyrkantvåg. Undersök varför samma toppvärde inte måste ge samma effektivvärde.",
        "matarna": "Läs hur de två mätarna kontrolleras mot en känd signal. Förklara vad du förväntar dig att de visar.",
        "protokoll": "Följ en protokollrad: förväntat värde, avläst värde, skillnad och förklaring. Detta gör du själv i fredagens simulatorlabb.",
        "klart": "Försök besvara frågorna med egna ord. Om någon är oklar, välj det avsnittet i översikten eller skriv ned en fråga till läraren."
      }
    },
    "impedans": {
      "titel": "Spole, motstånd och ström",
      "nar": "Tisdag: övning 1–4 med läraren. Övning 5–10 hemma tisdag kväll och onsdag.",
      "syfte": "En motorlindning påverkar växelström på fler sätt än ett vanligt motstånd. Du tränar på att beräkna strömmen innan du läser av den i simulatorn.",
      "gor": [
        "Läs först om resistorn och spolen. Räkna spolens reaktans och sedan hela kretsens impedans.",
        "Använd impedansen för att räkna strömmen. Följ exemplet och prova med övningens egna värden.",
        "Fortsätt med fasvinkel och hur kondensatorn ändrar kretsen. Skriv ned vad som händer med strömmen."
      ],
      "klar": "Du har bearbetat alla tio övningar och kan beskriva vägen från induktans och frekvens till reaktans, impedans och ström. Ta med kvarvarande frågor till fredag.",
      "lasuppdrag": {
        "resistor": "Jämför spännings- och strömkurvan. Leta efter om topparna kommer samtidigt.",
        "spole": "Jämför med resistorn. Leta efter vilken kurva som når sin topp först när en spole ingår.",
        "xl": "Följ omvandlingen från mH till H. Ta reda på varför frekvensen behövs för att beräkna reaktansen.",
        "z": "Följ de två vinkelräta sidorna och diagonalen i triangeln. Förklara varför beloppen inte adderas direkt.",
        "strom": "Använd den beräknade impedansen för att följa strömberäkningen. Jämför med kretsen som bara har en resistor.",
        "exempel": "Räkna varje rad på papper före nästa steg: impedans, ström och sedan spänningen över varje komponent.",
        "fas": "Läs vad vinkelns tecken betyder. Förklara om strömmen kommer före eller efter spänningen.",
        "xc": "Följ omvandlingen från µF till F. Jämför hur frekvensen påverkar kondensatorn och spolen.",
        "rc": "Följ beräkningen och lägg märke till minus i nettoreaktansen. Förklara vad det säger om strömmen.",
        "rlc": "Börja med skillnaden mellan spolens och kondensatorns reaktans. Följ sedan beräkningen av impedansen.",
        "resonans": "Ta reda på vad som händer när spolens och kondensatorns reaktanser är lika stora.",
        "labb": "Läs vilka värden du ska beräkna före avläsningen i fredagens simulatorlabb. Följ ordningen reaktans, impedans, ström.",
        "klart": "Förklara beräkningskedjan med egna ord. Repetera ett oklart steg eller skriv ned en fråga till läraren."
      }
    },
    "effekt": {
      "titel": "Effekt och effektfaktor",
      "nar": "Torsdag hemma: övning 1–6. Fredag med läraren: övning 7–10, sedan simulatorlabben.",
      "syfte": "Två laster med samma aktiva effekt kan kräva olika ström. Du ska kunna förklara skillnaden och vad den betyder för matningen och ledningsförlusterna.",
      "gor": [
        "Läs vad aktiv effekt och effektfaktor betyder. Följ hur strömmen beräknas.",
        "Använd effekttriangeln och räkna övningarna. Skriv rätt enhet: W, VA eller var.",
        "Jämför ström före och efter ändrad effektfaktor. Använd detta i fredagens labb och förklara vad som ändras."
      ],
      "klar": "Du har bearbetat alla tio övningar och kan förklara varför strömmen ändras när effektfaktorn ändras trots samma aktiva effekt. Därefter använder du metoden i den guidade simulatorlabben.",
      "lasuppdrag": {
        "resistiv": "Läs vad aktiv effekt används till och följ strömberäkningen för värmeelementet.",
        "pf": "Ta reda på vilka två effekter som jämförs i effektfaktorn. Förklara varför den saknar enhet.",
        "strom": "Räkna med i de två fallen. Kontrollera vilka storheter som är oförändrade och vilken som ändras.",
        "s": "Följ båda sätten att räkna skenbar effekt. Kontrollera att båda ger samma värde i VA.",
        "q": "Hitta P, Q och S i triangeln. Förklara varför Q inte är samma sak som förbrukad aktiv energi.",
        "exempel": "Räkna med på papper i ordningen S, Q och I. Försök välja formel innan du visar nästa steg.",
        "energi": "Skilj på hur stor effekten är och hur länge lasten går. Kontrollera enheterna kW, timmar och kWh.",
        "kompensering": "Följ hur kondensatorns reaktiva effekt motverkar lastens. Var uppmärksam på tecknen.",
        "forlust": "Jämför strömmen före och efter. Läs varför strömförhållandet ska kvadreras för att jämföra ledningsförluster.",
        "overtoner": "Läs när PF och cos φ kan skilja sig åt. Avgör vilket samband som fortfarande gäller.",
        "labb": "Läs hur två fall jämförs i simulatorn. Skriv vilka storheter som hålls konstanta och vilken du ska förutsäga.",
        "klart": "Besvara frågorna med egna ord. Repetera det du behöver innan du öppnar simulatorlabben."
      }
    }
  },
  "isolation": {
    "id": "franskiljning",
    "number": 0,
    "title": "Frånskiljning och mätteknik",
    "goal": "Resonera om alla matningsvägar, välja mätfunktion och räkna instrumentets felgräns.",
    "deck": "../../vecka-38/aktuell/v38_01_Franskiljning_och_matteknik_elev.pptx",
    "slides": [
      {
        "id": "mal",
        "title": "Måndag: börja här",
        "body": [
          "Du arbetar med fyra skärmuppgifter. Figurer, instrumentkort och skrivfält finns vid uppgiften.",
          "Läs förklaringen, följ exemplet och gör ett eget försök. Dina svar sparas i den här webbläsaren.",
          "Gör inga elektriska mätningar hemma. Praktiska moment sker vid den handledda stationen."
        ]
      },
      {
        "id": "matningar",
        "title": "Följ varje väg som kan mata arbetsområdet",
        "body": [
          "En öppen brytare visar bara att just den brytaren är öppen. En reservmatning, återmatning eller lagrad energi kan fortfarande finnas.",
          "Börja med aktuellt schema och ett fastställt arbetsområde. Skilj dokumenterad information från antaganden.",
          "I figuren är A ordinarie matning och B reserv. Väljarens verkliga ställning och spärrstatus är inte kända i uppgiften."
        ],
        "image": "assets/b7becb76d1db_04_tva_matningar.png",
        "alt": "Två möjliga matningsvägar A och B mot en gemensam last. Väljarens verkliga läge måste verifieras."
      },
      {
        "id": "instrument",
        "title": "Välj funktion innan du väljer instrument",
        "body": [
          "Bestäm först storheten: spänning, ström eller resistans. Avgör sedan om signalen är likström eller växelström.",
          "Spänning mäts mellan två punkter, parallellt. Strömmätning kräver en avsedd seriekoppling med rätt säkrad ingång.",
          "Resistans mäts på ett avgränsat spänningslöst objekt. Läs instrumentkortens funktioner och begränsningar innan du väljer."
        ],
        "cards": [
          "M1",
          "M2"
        ]
      },
      {
        "id": "felgrans",
        "title": "Två delar bildar instrumentets felgräns",
        "body": [
          "Specifikationen ±(procent av visat värde + siffror) innehåller två bidrag som ska räknas i samma enhet.",
          "Procentdelen: dela procenttalet med 100 och multiplicera med det visade värdet.",
          "Sifferdelen: multiplicera antalet siffror med upplösningen. Addera sedan de två bidragen.",
          "Bilda ett intervall genom att dra ifrån och lägga till gränsen. Detta är den angivna förenklade felmodellen, inte en fullständig osäkerhetsbudget."
        ]
      },
      {
        "id": "exempel",
        "title": "Följ ett exempel: instrumentets felgräns",
        "example": true,
        "body": [
          "Givet: 8,00 V, ±(1 % av visat värde + 3 siffror), upplösning 0,01 V. Exemplet har andra värden än din uppgift.",
          "Sökt: felgränsen i volt och intervallet kring mätvärdet.",
          "Välj metod: procentdelen och sifferdelen räknas var för sig och adderas.",
          "Omvandla procent: 1 % = 1/100 = 0,01. Procentdelen är 0,01 · 8,00 = 0,08 V.",
          "Sifferdelen är 3 · 0,01 = 0,03 V. Gränsen blir ±(0,08 + 0,03) = ±0,11 V.",
          "Kontroll: intervallet 7,89–8,11 V ligger symmetriskt kring 8,00 V. I din uppgift använder du uppgiftens egna värden."
        ]
      },
      {
        "id": "ansvar",
        "title": "När underlaget inte räcker",
        "body": [
          "En beskrivning av ett ställverk är inte ett kopplingsprogram. Saknas fastställda gränser och underlag går det inte att bestämma en arbetsordning.",
          "Ange vad som behöver klarläggas: energikällor, lagrad energi, arbetsområde, riskbedömning, ansvariga roller och rätt kompetens.",
          "I uppgiften beskriver du vilka förutsättningar som saknas. Du ska inte föreslå manöverordning eller generella säkerhetsavstånd."
        ]
      }
    ]
  },
  "sequence": {
    "franskiljning": [
      "mal",
      "matningar",
      "EL-000630",
      "instrument",
      "EL-000631",
      "felgrans",
      "exempel",
      "EL-000632",
      "ansvar",
      "EL-000633"
    ],
    "sinus": [
      "mal",
      "kurvan",
      "period",
      "EL-000061",
      "EL-000062",
      "topp",
      "rms",
      "exempel",
      "EL-000063",
      "EL-000064",
      "EL-000065",
      "medel",
      "radianer",
      "moment",
      "EL-000066",
      "EL-000067",
      "fas",
      "EL-000068",
      "EL-000069",
      "kurvformer",
      "EL-000070",
      "matarna",
      "protokoll",
      "klart"
    ],
    "impedans": [
      "mal",
      "resistor",
      "spole",
      "xl",
      "EL-000071",
      "xc",
      "EL-000072",
      "z",
      "EL-000073",
      "strom",
      "EL-000074",
      "exempel",
      "EL-000075",
      "fas",
      "EL-000076",
      "rc",
      "EL-000077",
      "EL-000078",
      "rlc",
      "EL-000079",
      "resonans",
      "EL-000080",
      "labb",
      "klart"
    ],
    "effekt": [
      "mal",
      "resistiv",
      "pf",
      "strom",
      "s",
      "EL-000081",
      "EL-000082",
      "q",
      "exempel",
      "EL-000083",
      "EL-000084",
      "energi",
      "EL-000085",
      "EL-000086",
      "kompensering",
      "EL-000087",
      "EL-000088",
      "forlust",
      "EL-000089",
      "overtoner",
      "EL-000090",
      "labb",
      "klart"
    ]
  },
  "tasks": {
    "EL-000630": {
      "del": "franskiljning",
      "teori": [
        "matningar"
      ],
      "resonemang": true,
      "tillampning": false,
      "image": "assets/b7becb76d1db_04_tva_matningar.png",
      "syfte": "upptäcka en möjlig reserv- eller återmatning i stället för att lita på en enda öppen brytare",
      "id": "EL-000630",
      "revision": 3,
      "title": "Två matningar",
      "number": "V2-1",
      "anchor": "v2-1",
      "question": {
        "fraga": "Ange varför A:s öppna brytare inte räcker som säkerhetsbevis. Skriv ett underlagskrav och en verifieringsfråga.",
        "instruktion": "egen lösning med metod och motivering.",
        "scenario": "Använd figur 04. Källa A är ordinarie och B är reserv. A:s brytare är öppen. Väljarens verkliga ställning och spärrstatus är okända."
      },
      "hints": [
        {
          "niva": "begrepp",
          "status": "utkast",
          "text": "Följ alla tänkbara energivägar fram till arbetsområdet."
        },
        {
          "niva": "metod",
          "status": "utkast",
          "text": "Skilj på vad figuren visar och vad som ännu måste verifieras."
        }
      ],
      "solution": {
        "kalla": "Ny offentlig studievägledning för vecka 40, 2026-09-27",
        "status": "utkast",
        "text": "Ett resonemang behöver behandla båda matningarna, den okända väljarställningen och hur verklig frånskiljning och spärrning ska verifieras enligt arbetsberedningen. En öppen brytare vid A säger inte vad B kan mata. Ange vilket schema eller kopplingsunderlag du behöver och en konkret fråga om den verkliga anläggningen."
      }
    },
    "EL-000631": {
      "del": "franskiljning",
      "teori": [
        "instrument"
      ],
      "resonemang": true,
      "tillampning": false,
      "cards": [
        "M1",
        "M2"
      ],
      "syfte": "välja mätfunktion och anslutning utifrån det som faktiskt ska mätas",
      "stopp": {
        "text": "Här slutar måndagens första pass. På lektionen fortsätter du med del 1: sinus. Gör V2-3 och V2-4 hemma före tisdagens lektion.",
        "href": "?del=sinus&fortsatt=1",
        "label": "På lektionen: fortsätt till del 1",
        "nasta": "Hemma: instrumentets felgräns"
      },
      "id": "EL-000631",
      "revision": 3,
      "title": "Instrumentval",
      "number": "V2-2",
      "anchor": "v2-2",
      "question": {
        "fraga": "Välj instrument/funktion för 12 V DC, 12 V AC vid 50 Hz, cirka 4 mA DC och ett löst 1 kΩ-motstånd. Beskriv anslutning.",
        "instruktion": "egen lösning med metod och motivering.",
        "scenario": "Använd instrumentkorten M1 och M2. M1 har DC-spänningsmätning. M2 har DC, true-RMS AC 40–400 Hz, Ω för frånskilt mätobjekt och säkrad mA-ingång högst 200 mA. Korten gäller endast det beskrivna utbildningsfallet."
      },
      "hints": [
        {
          "niva": "begrepp",
          "status": "utkast",
          "text": "Läs funktion, mätområde och frekvensområde i korten nedan."
        },
        {
          "niva": "metod",
          "status": "utkast",
          "text": "Spänning mäts mellan två punkter. Strömmätning kräver en avsedd seriekoppling. Resistans mäts på avgränsat spänningslöst objekt."
        }
      ],
      "solution": {
        "kalla": "Ny offentlig studievägledning för vecka 40, 2026-09-27",
        "status": "utkast",
        "text": "I detta utbildningsfall kan M1 eller M2 användas för 12 V DC med DC-spänningsfunktionen parallellt. För 12 V AC vid 50 Hz stöder M2 AC-funktionen inom 40–400 Hz. För cirka 4 mA DC stöder M2 den säkrade mA-ingången, i avsedd seriekoppling och enligt stationens instruktion. För det lösa 1 kΩ-motståndet används M2:s Ω-funktion på ett spänningslöst avgränsat objekt. Detta är ett skärmfall; gör inga mätningar hemma."
      }
    },
    "EL-000632": {
      "del": "franskiljning",
      "teori": [
        "felgrans",
        "exempel"
      ],
      "resonemang": true,
      "tillampning": false,
      "syfte": "avgöra om en liten skillnad i mätvärde är större än instrumentets angivna felgräns",
      "id": "EL-000632",
      "revision": 4,
      "title": "Osäkerhet",
      "number": "V2-3",
      "anchor": "v2-3",
      "question": {
        "fraga": "Beräkna gränsen enligt denna specifikation. Bedöm om 12,04 V avviker säkert från ett referensvärde 12,00 V om övriga osäkerheter försummas.",
        "instruktion": "egen lösning med metod och motivering.",
        "scenario": "Ett konstruerat instrument visar 12,00 V. Specifikation: ±(0,5 % av visat värde + 2 siffror). Upplösning 0,01 V."
      },
      "hints": [
        {
          "niva": "begrepp",
          "status": "utkast",
          "text": "Procentdelen gäller avläst värde. Siffror betyder antal steg av instrumentets upplösning."
        },
        {
          "niva": "metod",
          "status": "utkast",
          "text": "Räkna procentdelen och sifferdelen var för sig i volt. Addera sedan och bilda intervallet kring mätvärdet."
        }
      ],
      "solution": {
        "kalla": "Bildspel v38 och lärarguiden",
        "status": "migrerad",
        "svar": [
          {
            "berakning": "matosakerhet.grans",
            "enhet": "V",
            "storhet": "δ",
            "tolerans": {
              "abs": 0.001
            },
            "varde": 0.08
          }
        ],
        "text": "Procentdelen: 0,5/100 · 12,00 = 0,060 V.\n\nSifferdelen: 2 · 0,01 = 0,020 V.\n\nAddera delarna: δ = 0,060 + 0,020 = 0,080 V. Intervallet blir 11,92–12,08 V.\n\n12,04 V ligger inom intervallet. Med de givna förenklingarna kan avvikelsen inte hävdas säkert."
      }
    },
    "EL-000633": {
      "del": "franskiljning",
      "teori": [
        "ansvar"
      ],
      "resonemang": true,
      "tillampning": false,
      "syfte": "känna igen när uppgifter och ansvar måste klarläggas innan ett arbete kan planeras",
      "id": "EL-000633",
      "revision": 3,
      "title": "Högspänningsfall på skärm",
      "number": "V2-4",
      "anchor": "v2-4",
      "question": {
        "fraga": "Beskriv vilka uppgifter/roller som behöver finnas. Gör inga förslag på manöverordning eller generella säkerhetsavstånd.",
        "instruktion": "egen lösning med metod och motivering.",
        "scenario": "Ett 6,6 kV-ställverk har två möjliga matningar och energilagrande komponenter. Inget fastställt arbetsområde eller kopplingsprogram är tillgängligt."
      },
      "hints": [
        {
          "niva": "begrepp",
          "status": "utkast",
          "text": "Börja med vilket underlag som saknas innan en arbetsmetod kan bestämmas."
        },
        {
          "niva": "metod",
          "status": "utkast",
          "text": "Ta upp arbetsgräns, energikällor, ansvar, kompetens och hur kontroller dokumenteras."
        }
      ],
      "solution": {
        "kalla": "Ny offentlig studievägledning för vecka 40, 2026-09-27",
        "status": "utkast",
        "text": "Ett svar behöver efterfråga aktuellt schema, identifierade energikällor och lagrad energi, fastställt arbetsområde, riskbedömning och anläggningens beslutade kopplingsprogram. Ansvariga roller och nödvändig kompetens måste vara utsedda enligt verksamhetens organisation. Underlaget räcker inte för att ange en manöverordning eller säkerhetsavstånd. Läraren bedömer motiveringen."
      }
    },
    "EL-000061": {
      "del": "sinus",
      "teori": [
        "period"
      ],
      "resonemang": false,
      "tillampning": false,
      "syfte": "förutsäga hur lång en period ska vara innan du läser av en kurva",
      "id": "EL-000061",
      "revision": 5,
      "title": "Period vid 50 Hz",
      "number": "Övning 1",
      "anchor": "v40_01-q1",
      "question": {
        "fraga": "Beräkna periodtiden i sekunder och millisekunder för en signal på 50 Hz.",
        "givet": "En periodisk signal med f = 50 Hz. 1 ms = 0,001 s.",
        "samband": [
          "T = 1/f; T[ms] = 1 000 · T[s]"
        ]
      },
      "hints": [
        {
          "niva": "begrepp",
          "status": "migrerad",
          "text": "T är periodtiden i s och f frekvensen i Hz, alltså perioder per sekund."
        },
        {
          "niva": "metod",
          "status": "migrerad",
          "text": "Dela 1 med frekvensen och gör sedan om sekunder till millisekunder."
        },
        {
          "niva": "nasta-steg",
          "status": "utkast",
          "text": "1) Skriv T = 1/f. 2) Sätt in f i Hz och tryck 1 ÷ f: T i sekunder blir ett litet decimaltal. 3) Gör om till ms genom att multiplicera med 1 000 (flytta kommat tre steg åt höger). Exempel med ett annat tal: f = 125 Hz ger T = 1/125 = 0,0080 s = 8,0 ms. Rimlighet: högre frekvens ger kortare period, så vid 50 Hz ska T bli längre än så."
        }
      ],
      "solution": {
        "kalla": "Kursens facit (publikt) och bokens lösning (bok.enc)",
        "status": "migrerad",
        "svar": [
          {
            "enhet": "s",
            "storhet": "T",
            "tolerans": {
              "rel": 0.02
            },
            "varde": 0.02
          },
          {
            "enhet": "ms",
            "storhet": "T",
            "tolerans": {
              "rel": 0.02
            },
            "varde": 20
          }
        ],
        "text": "Frekvensen anger antal perioder på en sekund. För en enda period delar du därför 1 s med 50.\n\nT = 1/50 = 0,020 s.\n\nEn sekund är 1 000 ms: 0,020 · 1 000 = 20 ms.\n\nKontroll: 50 · 0,020 s = 1 s."
      }
    },
    "EL-000062": {
      "del": "sinus",
      "teori": [
        "period"
      ],
      "resonemang": false,
      "tillampning": false,
      "syfte": "ta reda på en signals frekvens från tiden mellan två upprepningar",
      "id": "EL-000062",
      "revision": 5,
      "title": "Frekvens från kurvan",
      "number": "Övning 2",
      "anchor": "v40_01-q2",
      "question": {
        "fraga": "En sinus upprepar sig var 4,0 ms. Beräkna frekvensen.",
        "givet": "T = 4,0 ms = 4,0/1 000 s, en hel period.",
        "samband": [
          "f = 1/T"
        ]
      },
      "hints": [
        {
          "niva": "begrepp",
          "status": "migrerad",
          "text": "T måste vara i sekunder för att f ska bli i Hz."
        },
        {
          "niva": "metod",
          "status": "migrerad",
          "text": "Gör om ms till s och dela sedan 1 med periodtiden."
        },
        {
          "niva": "nasta-steg",
          "status": "utkast",
          "text": "1) Gör om periodtiden till sekunder: dela ms med 1 000 (till exempel 8,0 ms = 0,0080 s). 2) Tryck 1 ÷ T, så får du f i Hz. 3) Kontrollera enheten: en period på några ms ger en frekvens på hundratals Hz. Exempel: T = 8,0 ms ger f = 1/0,0080 = 125 Hz. Kortare period ska ge högre frekvens."
        }
      ],
      "solution": {
        "kalla": "Kursens facit (publikt) och bokens lösning (bok.enc)",
        "status": "migrerad",
        "svar": [
          {
            "avrundning": "heltal",
            "enhet": "Hz",
            "storhet": "f",
            "tolerans": {
              "rel": 0.02
            },
            "varde": 250.0
          }
        ],
        "text": "Byt till sekunder innan du använder f = 1/T.\n\n4,0 ms = 4,0/1 000 = 0,0040 s.\n\nf = 1/0,0040 = 250 Hz. Kontroll: 250 perioder på 0,0040 s ger en sekund."
      }
    },
    "EL-000063": {
      "del": "sinus",
      "teori": [
        "topp",
        "rms"
      ],
      "resonemang": false,
      "tillampning": false,
      "syfte": "jämföra multimeterns effektivvärde med kurvans högsta spänning",
      "stopp": {
        "text": "Här slutar måndagens gemensamma räkneövningar i del 1. Fortsätt hemma med övning 4–10 före tisdagens lektion. Ta med frågor om det som är oklart.",
        "nasta": "Hemma: övning 4 · Effektivvärde"
      },
      "id": "EL-000063",
      "revision": 5,
      "title": "Toppvärde",
      "number": "Övning 3",
      "anchor": "v40_01-q3",
      "question": {
        "fraga": "En sinusspänning har effektivvärdet 12,0 V. Beräkna toppvärdet.",
        "givet": "Ren sinus utan likspänningsdel. U = 12,0 V RMS.",
        "samband": [
          "û = √2 · U"
        ]
      },
      "hints": [
        {
          "niva": "begrepp",
          "status": "migrerad",
          "text": "û är toppvärdet och U effektivvärdet (RMS). √2 ≈ 1,414."
        },
        {
          "niva": "metod",
          "status": "migrerad",
          "text": "Multiplicera effektivvärdet med √2. Toppvärdet ska bli större än effektivvärdet."
        },
        {
          "niva": "nasta-steg",
          "status": "utkast",
          "text": "1) Skriv û = √2 · U_{RMS}. 2) Tryck √2 på räknaren (≈ 1,414) och multiplicera med effektivvärdet. 3) Ange svaret i V med en decimal. Kontroll: toppvärdet ska bli ungefär 40 % större än effektivvärdet, aldrig mindre. Exempel: fartygets 440 V RMS har toppvärdet 1,414 · 440 ≈ 622 V."
        }
      ],
      "solution": {
        "kalla": "Kursens facit (publikt) och bokens lösning (bok.enc)",
        "status": "migrerad",
        "svar": [
          {
            "enhet": "V",
            "storhet": "û",
            "tolerans": {
              "rel": 0.02
            },
            "varde": 16.970562748477143
          }
        ],
        "text": "Vi känner effektivvärdet men söker sinusens topp. Toppen är större, så vi multiplicerar med √2.\n\nû = √2 · 12,0 ≈ 16,97 V, avrundat 17,0 V."
      }
    },
    "EL-000064": {
      "del": "sinus",
      "teori": [
        "rms"
      ],
      "resonemang": false,
      "tillampning": false,
      "syfte": "översätta kurvans toppvärde till den spänning en AC-multimeter normalt visar för en sinus",
      "id": "EL-000064",
      "revision": 5,
      "title": "Effektivvärde",
      "number": "Övning 4",
      "anchor": "v40_01-q4",
      "question": {
        "fraga": "En sinus har toppvärdet 34,0 V. Beräkna effektivvärdet.",
        "givet": "Ren sinus utan likspänningsdel, û = 34,0 V.",
        "samband": [
          "U = û/√2"
        ]
      },
      "hints": [
        {
          "niva": "begrepp",
          "status": "migrerad",
          "text": "U är effektivvärdet och û toppvärdet, båda i V."
        },
        {
          "niva": "metod",
          "status": "migrerad",
          "text": "Dela toppvärdet med √2. Avrunda inte förrän i svaret."
        },
        {
          "niva": "nasta-steg",
          "status": "utkast",
          "text": "1) Skriv U_{RMS} = û/√2. 2) Dela toppvärdet med 1,414 (samma sak som att multiplicera med 0,707). 3) Avrunda först i svaret, till en decimal. Kontroll: effektivvärdet ska bli ungefär 70 % av toppvärdet, alltså mindre. Exempel: û = 200 V ger U_{RMS} = 200/1,414 ≈ 141 V."
        }
      ],
      "solution": {
        "kalla": "Kursens facit (publikt) och bokens lösning (bok.enc)",
        "status": "migrerad",
        "svar": [
          {
            "avrundning": "1 decimaler",
            "enhet": "V",
            "storhet": "U",
            "tolerans": {
              "rel": 0.02
            },
            "varde": 24.0
          }
        ],
        "text": "Vi känner toppen. Effektivvärdet ska vara mindre, därför dividerar vi med √2.\n\nU = 34,0/√2 ≈ 24,04 V, avrundat 24,0 V."
      }
    },
    "EL-000065": {
      "del": "sinus",
      "teori": [
        "topp",
        "rms"
      ],
      "resonemang": false,
      "tillampning": false,
      "syfte": "skilja oscilloskopets topp-till-topp-värde från toppvärde och effektivvärde",
      "id": "EL-000065",
      "revision": 5,
      "title": "Topp till topp",
      "number": "Övning 5",
      "anchor": "v40_01-q5",
      "question": {
        "fraga": "Ett oscilloskop visar 20,0 V mellan sinusens positiva och negativa topp. Beräkna toppvärde och effektivvärde.",
        "givet": "Sinus utan likspänningsdel. De 20,0 V som oscilloskopet visar är topp-till-topp-värdet.",
        "samband": [
          "U_{pp} = 2û; û = U_{pp}/2",
          "U = û/√2"
        ]
      },
      "hints": [
        {
          "niva": "begrepp",
          "status": "migrerad",
          "text": "U_{pp} är avståndet mellan positiv och negativ topp, alltså dubbla toppvärdet."
        },
        {
          "niva": "metod",
          "status": "migrerad",
          "text": "Halvera först U_{pp} och räkna sedan om toppvärdet till effektivvärde."
        },
        {
          "niva": "nasta-steg",
          "status": "utkast",
          "text": "1) Halvera: û = U_{pp}/2. 2) Räkna om toppvärdet: U_{RMS} = û/√2, alltså dela med 1,414. 3) Ange båda värdena i V. Kontroll: effektivvärdet blir ungefär 35 % av det oscilloskopet visar. Exempel: U_{pp} = 70 V ger û = 35 V och U_{RMS} = 35/1,414 ≈ 24,7 V."
        }
      ],
      "solution": {
        "kalla": "Kursens facit (publikt) och bokens lösning (bok.enc)",
        "status": "migrerad",
        "svar": [
          {
            "enhet": "V",
            "storhet": "û",
            "tolerans": {
              "rel": 0.02
            },
            "varde": 10
          },
          {
            "enhet": "V",
            "storhet": "U",
            "tolerans": {
              "rel": 0.02
            },
            "varde": 7.071067811865475
          }
        ],
        "text": "Topp till topp sträcker sig över båda halvperioderna. Halvera först.\n\nû = 20,0/2 = 10,0 V.\n\nFör en sinus är U = û/√2 = 10,0/√2 ≈ 7,07 V. Kontroll: U < û < U_{pp}."
      }
    },
    "EL-000069": {
      "del": "sinus",
      "teori": [
        "rms"
      ],
      "resonemang": false,
      "tillampning": false,
      "syfte": "använda effektivvärdet för att beräkna värmeeffekten i ett motstånd",
      "id": "EL-000069",
      "revision": 5,
      "title": "Effekt i resistor",
      "number": "Övning 9",
      "anchor": "v40_01-q9",
      "question": {
        "fraga": "En sinusspänning på 12,0 V RMS ligger över 24 Ω. Beräkna medeleffekten.",
        "givet": "Resistiv last (till exempel ett värmeelement), R = 24 Ω, U = 12,0 V RMS. Resistansen är konstant.",
        "samband": [
          "P = U²/R"
        ]
      },
      "hints": [
        {
          "niva": "begrepp",
          "status": "migrerad",
          "text": "P är medeleffekten i W."
        },
        {
          "niva": "metod",
          "status": "migrerad",
          "text": "Kvadrera effektivvärdet och dela med R. Använd inte toppvärdet i den här formeln."
        },
        {
          "niva": "nasta-steg",
          "status": "utkast",
          "text": "1) Skriv P = U_{RMS}²/R. 2) Kvadrera effektivvärdet först (U · U), dela sedan med R. 3) Kontroll: räkna I = U/R och sedan P = U · I; det ska ge samma tal. Exempel: en vattenkokare på 230 V med R = 23 Ω: 230² = 52 900, 52 900/23 = 2 300 W. Enheten blir W."
        }
      ],
      "solution": {
        "kalla": "Kursens facit (publikt) och bokens lösning (bok.enc)",
        "status": "migrerad",
        "svar": [
          {
            "avrundning": "1 decimaler",
            "enhet": "W",
            "storhet": "P",
            "tolerans": {
              "rel": 0.02
            },
            "varde": 6.0
          }
        ],
        "text": "En resistor utvecklar medeleffekten P = U²/R när U är effektivvärdet.\n\nKvadrera först: 12,0² = 144. Dela sedan: P = 144/24 = 6,0 W."
      }
    },
    "EL-000066": {
      "del": "sinus",
      "teori": [
        "radianer",
        "moment"
      ],
      "resonemang": false,
      "tillampning": true,
      "syfte": "bestämma spänningen vid ett visst ögonblick i en period",
      "id": "EL-000066",
      "revision": 5,
      "title": "Momentanvärde",
      "number": "Övning 6",
      "anchor": "v40_01-q6",
      "question": {
        "fraga": "u(t) = 17,0 sin(2π · 50t) V. Beräkna spänningen vid t = 5,0 ms.",
        "givet": "û = 17,0 V, f = 50 Hz, t = 5,0 ms. Gör om t till sekunder. π ≈ 3,14159.",
        "samband": [
          "u(t) = û · sin(2πft)"
        ]
      },
      "hints": [
        {
          "niva": "begrepp",
          "status": "migrerad",
          "text": "u(t) är spänningen vid en viss tidpunkt. Vinkeln 2πft är i radianer, så räknaren ska stå i RAD."
        },
        {
          "niva": "metod",
          "status": "migrerad",
          "text": "Räkna först vinkeln, sedan sinus, och multiplicera sist med toppvärdet."
        },
        {
          "niva": "nasta-steg",
          "status": "utkast",
          "text": "1) Gör om t till sekunder: ms ÷ 1 000. 2) Räkna vinkeln 2π · f · t; ställ räknaren i RAD. 3) Ta sin av vinkeln, ett tal mellan −1 och 1. 4) Multiplicera med û. Exempel: û = 15 V, f = 60 Hz och t = 1,0 ms ger vinkeln 2π · 60 · 0,0010 ≈ 0,377 rad, sin ≈ 0,368 och u ≈ 5,5 V. Svaret kan aldrig bli större än û."
        }
      ],
      "solution": {
        "kalla": "Kursens facit (publikt) och bokens lösning (bok.enc)",
        "status": "migrerad",
        "svar": [
          {
            "avrundning": "1 decimaler",
            "enhet": "V",
            "storhet": "u(5 ms)",
            "tolerans": {
              "rel": 0.02
            },
            "varde": 17.0
          }
        ],
        "text": "Skriv tiden i sekunder: 5,0 ms = 0,0050 s. Ställ räknaren i RAD.\n\nRäkna vinkeln: 2π · 50 · 0,0050 = π/2 rad.\n\nsin(π/2) = 1. Multiplicera med amplituden: u = 17,0 · 1 = 17,0 V."
      }
    },
    "EL-000067": {
      "del": "sinus",
      "teori": [
        "radianer",
        "moment"
      ],
      "resonemang": false,
      "tillampning": true,
      "syfte": "tolka ett negativt värde som omvänd polaritet under sinusens negativa halvperiod",
      "id": "EL-000067",
      "revision": 5,
      "title": "Negativ halvvåg",
      "number": "Övning 7",
      "anchor": "v40_01-q7",
      "question": {
        "fraga": "Samma signal som i uppgift 6. Beräkna u vid t = 15,0 ms.",
        "givet": "t = 15,0 ms = 0,0150 s. Räknaren står i RAD.",
        "samband": [
          "u(t) = 17,0 · sin(2π · 50t) V"
        ]
      },
      "hints": [
        {
          "niva": "begrepp",
          "status": "migrerad",
          "text": "Tecknet på sinus avgör polariteten. Vid negativ halvvåg är momentanvärdet negativt."
        },
        {
          "niva": "metod",
          "status": "migrerad",
          "text": "Beräkna 2πft och sinus med tecken. RMS-värdet används inte som amplitud."
        },
        {
          "niva": "nasta-steg",
          "status": "utkast",
          "text": "Samma recept som i övning 6: 1) t i sekunder, 2) vinkeln 2πft med räknaren i RAD, 3) sin med tecken, 4) multiplicera med û. Är vinkeln mellan π (≈ 3,14) och 2π (≈ 6,28) rad ligger du i den negativa halvvågen och sinus blir negativ. Exempel: vinkeln 4,5 rad ger sin ≈ −0,978; med û = 15 V blir u ≈ −14,7 V. Skriv med minustecknet i svaret."
        }
      ],
      "solution": {
        "kalla": "Kursens facit (publikt) och bokens lösning (bok.enc)",
        "status": "migrerad",
        "svar": [
          {
            "avrundning": "1 decimaler",
            "enhet": "V",
            "storhet": "u(15 ms)",
            "tolerans": {
              "rel": 0.02
            },
            "varde": -17.0
          }
        ],
        "text": "Skriv tiden i sekunder: 15,0 ms = 0,0150 s. Använd RAD.\n\nVinkeln blir 2π · 50 · 0,0150 = 3π/2 rad.\n\nsin(3π/2) = −1. Alltså u = −17,0 V. Minustecknet anger den negativa halvperioden."
      }
    },
    "EL-000068": {
      "del": "sinus",
      "teori": [
        "period",
        "fas"
      ],
      "resonemang": false,
      "tillampning": true,
      "syfte": "uttrycka avståndet mellan två kurvor som en fasvinkel",
      "id": "EL-000068",
      "revision": 5,
      "title": "Fas från tidsavstånd",
      "number": "Övning 8",
      "anchor": "v40_01-q8",
      "question": {
        "fraga": "Två sinussignaler på 50 Hz är förskjutna 2,0 ms mot varandra. Beräkna fasvinkeln.",
        "givet": "f = 50 Hz och Δt = 2,0 ms. T och Δt ska ha samma tidsenhet.",
        "samband": [
          "|φ| = 360° · Δt/T; T = 1/f"
        ]
      },
      "hints": [
        {
          "niva": "begrepp",
          "status": "migrerad",
          "text": "|φ| är fasvinkelns storlek. Δt är tiden mellan motsvarande punkter på de två kurvorna."
        },
        {
          "niva": "metod",
          "status": "migrerad",
          "text": "Räkna ut T och sätt in Δt/T. För att veta vilken signal som ligger före måste du se kurvorna."
        },
        {
          "niva": "nasta-steg",
          "status": "utkast",
          "text": "1) Räkna T = 1/f, i ms om Δt är i ms. 2) Bilda kvoten Δt/T, andelen av en hel period (ett tal mellan 0 och 1). 3) |φ| = 360° · Δt/T. Exempel: 100 Hz och Δt = 1,5 ms ger T = 10 ms, 1,5/10 = 0,15 och |φ| = 54°. Rimlighet: en halv period är 180°, så en liten del av perioden ger en liten vinkel."
        }
      ],
      "solution": {
        "kalla": "Kursens facit (publikt) och bokens lösning (bok.enc)",
        "status": "migrerad",
        "svar": [
          {
            "enhet": "°",
            "storhet": "|φ|",
            "tolerans": {
              "rel": 0.02
            },
            "varde": 36
          }
        ],
        "text": "Räkna först hela periodtiden: T = 1/50 = 0,020 s = 20 ms.\n\nTidsskillnaden är 2,0/20 av en period. En hel period motsvarar 360°.\n\n|φ| = 360 · 2,0/20 = 36°. Kurvornas ordning behövs för att avgöra vilken signal som leder."
      }
    },
    "EL-000070": {
      "del": "sinus",
      "teori": [
        "medel",
        "kurvformer"
      ],
      "resonemang": true,
      "tillampning": true,
      "syfte": "avgöra varför vågform och toppvärde båda behövs när du bedömer ett mätvärde",
      "id": "EL-000070",
      "revision": 7,
      "title": "Jämförelse av vågformer",
      "number": "Övning 10",
      "anchor": "v40_01-q10",
      "question": {
        "fraga": "A är en sinus med toppvärdet 12 V. B är en symmetrisk fyrkantvåg som växlar mellan +12 V och −12 V. Jämför effektivvärde och medelvärde.",
        "givet": "Ingen av signalerna har någon likspänningsdel. Fyrkantvågen ligger lika länge på +12 V som på −12 V.",
        "samband": [
          "Sinus: U_{RMS} = û/√2",
          "Symmetrisk fyrkant: U_{RMS} = û"
        ]
      },
      "hints": [
        {
          "niva": "begrepp",
          "status": "migrerad",
          "text": "Effektivvärdet får du genom att kvadrera, ta medelvärdet och dra roten ur. Medelvärdet tar däremot hänsyn till tecknet."
        },
        {
          "niva": "metod",
          "status": "migrerad",
          "text": "Räkna effektivvärdet med rätt formel för varje vågform och jämför sedan ytorna över och under nollan för medelvärdet."
        },
        {
          "niva": "nasta-steg",
          "status": "utkast",
          "text": "Ett fullständigt svar har tre delar: 1) sinusens effektivvärde med U_{RMS} = û/√2, 2) fyrkantvågens effektivvärde med U_{RMS} = û, 3) medelvärdet för var och en, där du jämför ytan över nollan med ytan under (tecknet räknas). Avsluta med en mening om vilken vågform som ger högst effektivvärde vid samma toppvärde och varför."
        }
      ],
      "solution": {
        "kalla": "Kursens facit (publikt) och bokens lösning (bok.enc)",
        "status": "migrerad",
        "svar": [
          {
            "enhet": "V",
            "storhet": "U_{RMS}, sinus",
            "tolerans": {
              "rel": 0.02
            },
            "varde": 8.48528137423857
          },
          {
            "enhet": "V",
            "storhet": "U_{RMS}, fyrkant",
            "tolerans": {
              "rel": 0.02
            },
            "varde": 12
          },
          {
            "enhet": "V",
            "storhet": "Medelvärde, sinus",
            "tolerans": {
              "abs": 0.01
            },
            "varde": 0
          },
          {
            "enhet": "V",
            "storhet": "Medelvärde, fyrkant",
            "tolerans": {
              "abs": 0.01
            },
            "varde": 0
          }
        ],
        "text": "Sinus: dela toppen med √2, alltså 12/√2 ≈ 8,49 V RMS.\n\nFyrkant: spänningens belopp är hela tiden 12 V, alltså 12 V RMS.\n\nBåda har lika stora positiva och negativa ytor. Medelvärdet med tecken är därför 0 V för båda."
      }
    },
    "EL-000071": {
      "del": "impedans",
      "teori": [
        "xl"
      ],
      "resonemang": false,
      "tillampning": false,
      "syfte": "förutsäga hur mycket en spole motverkar växelström vid en viss frekvens",
      "id": "EL-000071",
      "revision": 6,
      "title": "Spolens reaktans",
      "number": "Övning 1",
      "anchor": "v40_02-q1",
      "question": {
        "fraga": "L = 0,10 H och f = 50 Hz. Beräkna X_{L}.",
        "givet": "Sinusformad spänning. Ideal spole, L = 0,10 H och f = 50 Hz.",
        "samband": [
          "X_{L} = 2πfL"
        ]
      },
      "hints": [
        {
          "niva": "begrepp",
          "status": "migrerad",
          "text": "X_{L} är den induktiva reaktansen i Ω, f frekvensen i Hz och L induktansen i H."
        },
        {
          "niva": "metod",
          "status": "migrerad",
          "text": "Multiplicera 2, π, f och L. Kontrollera att L är i henry."
        },
        {
          "niva": "nasta-steg",
          "status": "utkast",
          "text": "1) L i henry: mH ÷ 1 000 (50 mH = 0,050 H). 2) X_{L} = 2π · f · L: multiplicera i ordning 2 · π · f · L. 3) Enheten blir Ω. Exempel: 60 Hz och 0,20 H ger 2 · π · 60 · 0,20 ≈ 75 Ω. Rimlighet: en spole på tiondelar av en henry ger tiotals Ω vid nätfrekvens, och högre f ger större X_{L}."
        }
      ],
      "solution": {
        "kalla": "Kursens facit (publikt) och bokens lösning (bok.enc)",
        "status": "migrerad",
        "svar": [
          {
            "avrundning": "1 decimaler",
            "enhet": "Ω",
            "storhet": "X_{L}",
            "tolerans": {
              "rel": 0.02
            },
            "varde": 31.4
          }
        ],
        "text": "Induktansen är redan i henry. Använd X_{L} = 2πfL.\n\nMultiplicera hela uttrycket: 2 · π · 50 · 0,10 ≈ 31,4 Ω."
      }
    },
    "EL-000073": {
      "del": "impedans",
      "teori": [
        "z"
      ],
      "resonemang": false,
      "tillampning": false,
      "syfte": "kombinera resistans och reaktans till kretsens totala impedans",
      "id": "EL-000073",
      "revision": 7,
      "title": "RL-kretsens impedans",
      "number": "Övning 3",
      "anchor": "v40_02-q3",
      "question": {
        "fraga": "En seriekrets har R = 30 Ω och X_{L} = 40 Ω. Beräkna |Z|.",
        "givet": "RL-krets i serie med R = 30 Ω och X = X_{L} = +40 Ω.",
        "samband": [
          "|Z| = √(R² + X²)"
        ]
      },
      "hints": [
        {
          "niva": "begrepp",
          "status": "migrerad",
          "text": "|Z| är impedansen i Ω. R och X ligger vinkelrätt mot varandra i visardiagrammet."
        },
        {
          "niva": "metod",
          "status": "migrerad",
          "text": "Kvadrera R och X, lägg ihop och dra roten ur. Lägg inte ihop R och X rakt av."
        },
        {
          "niva": "nasta-steg",
          "status": "utkast",
          "text": "1) Kvadrera R och X_{L} var för sig. 2) Lägg ihop kvadraterna. 3) Dra roten ur summan: |Z| = √(R² + X_{L}²). Exempel: R = 12 Ω och X_{L} = 5 Ω ger √(144 + 25) = √169 = 13 Ω. Kontroll: |Z| ska vara större än den största av R och X_{L} men mindre än R + X_{L}."
        }
      ],
      "solution": {
        "kalla": "Kursens facit (publikt) och bokens lösning (bok.enc)",
        "status": "migrerad",
        "svar": [
          {
            "enhet": "Ω",
            "storhet": "|Z|",
            "tolerans": {
              "rel": 0.02
            },
            "varde": 50
          }
        ],
        "text": "R och X_{L} ligger vinkelrätt i impedanstriangeln. Använd Pythagoras sats.\n\nKvadrera delarna: 30² = 900 och 40² = 1 600.\n\nAddera kvadraterna och dra roten ur: |Z| = √(900 + 1 600) = 50 Ω."
      }
    },
    "EL-000074": {
      "del": "impedans",
      "teori": [
        "z",
        "strom"
      ],
      "resonemang": false,
      "tillampning": false,
      "syfte": "förutsäga strömmen i en krets med både motstånd och spole före en avläsning",
      "stopp": {
        "text": "Här slutar tisdagens gemensamma övningar i del 2. Påbörja sedan växelströmsinlämningens uppgift 1 på lektionen. Fortsätt hemma med övning 5–10, och skriv frånskiljningens inlämning under onsdagen.",
        "href": "Inlamning.html#uppgift-1",
        "label": "På lektionen: inlämningens uppgift 1",
        "nasta": "Hemma: följ exemplet inför övning 5"
      },
      "id": "EL-000074",
      "revision": 6,
      "title": "Strömmen i RL-kretsen",
      "number": "Övning 4",
      "anchor": "v40_02-q4",
      "question": {
        "fraga": "100 V RMS matar en krets med R = 30 Ω och X_{L} = 40 Ω i serie. Beräkna strömmen.",
        "givet": "RL i serie: U = 100 V, R = 30 Ω, X_{L} = 40 Ω.",
        "samband": [
          "I = U/|Z|; |Z| = √(R² + X²)"
        ]
      },
      "hints": [
        {
          "niva": "begrepp",
          "status": "migrerad",
          "text": "U och I är effektivvärden. |Z| innehåller både den resistiva och den reaktiva delen."
        },
        {
          "niva": "metod",
          "status": "migrerad",
          "text": "Räkna först ut impedansen och dela sedan U med den."
        },
        {
          "niva": "nasta-steg",
          "status": "utkast",
          "text": "1) Räkna |Z| = √(R² + X_{L}²) som i övning 13. 2) I = U_{RMS}/|Z|, båda effektivvärden. 3) Enheten blir A. Kontroll: I ska vara mindre än U/R (strömmen som om spolen inte fanns). Exempel: 230 V över R = 24 Ω och X_{L} = 10 Ω: |Z| = √(576 + 100) = 26 Ω och I = 230/26 ≈ 8,8 A."
        }
      ],
      "solution": {
        "kalla": "Kursens facit (publikt) och bokens lösning (bok.enc)",
        "status": "migrerad",
        "svar": [
          {
            "avrundning": "1 decimaler",
            "enhet": "A",
            "storhet": "I",
            "tolerans": {
              "rel": 0.02
            },
            "varde": 2.0
          }
        ],
        "text": "Beräkna först hela impedansen: |Z| = √(30² + 40²) = 50 Ω.\n\nDividera spänningen med impedansen: I = 100/50 = 2,0 A."
      }
    },
    "EL-000075": {
      "del": "impedans",
      "teori": [
        "exempel"
      ],
      "resonemang": false,
      "tillampning": false,
      "syfte": "kontrollera källspänningen när delspänningarna är fasförskjutna",
      "id": "EL-000075",
      "revision": 6,
      "title": "Spänningar i serie",
      "number": "Övning 5",
      "anchor": "v40_02-q5",
      "question": {
        "fraga": "RL-kretsen har I = 2,0 A, R = 30 Ω och X_{L} = 40 Ω. Beräkna U_{R}, U_{L} och källspänningen.",
        "givet": "RL i serie med I = 2,0 A, R = 30 Ω och X_{L} = 40 Ω.",
        "samband": [
          "U_{R} = I · R; U_{L} = I · X_{L}",
          "U = √(U_{R}² + U_{L}²)"
        ]
      },
      "hints": [
        {
          "niva": "begrepp",
          "status": "migrerad",
          "text": "U_{R} och U_{L} ligger 90° isär. Samma ström går genom båda komponenterna."
        },
        {
          "niva": "metod",
          "status": "migrerad",
          "text": "Räkna ut spänningen över varje komponent och använd sedan Pythagoras sats för källspänningen."
        },
        {
          "niva": "nasta-steg",
          "status": "utkast",
          "text": "1) U_{R} = I · R. 2) U_{L} = I · X_{L}. 3) Källspänningen med Pythagoras: U = √(U_{R}² + U_{L}²), inte U_{R} + U_{L}. 4) Kontroll: U ska bli lika med I · |Z|. Exempel: I = 0,30 A, R = 24 Ω och X_{L} = 10 Ω ger U_{R} = 7,2 V, U_{L} = 3,0 V och U = √(51,8 + 9,0) = 7,8 V."
        }
      ],
      "solution": {
        "kalla": "Kursens facit (publikt) och bokens lösning (bok.enc)",
        "status": "migrerad",
        "svar": [
          {
            "avrundning": "heltal",
            "enhet": "V",
            "storhet": "U_{R}",
            "tolerans": {
              "rel": 0.02
            },
            "varde": 60.0
          },
          {
            "avrundning": "heltal",
            "enhet": "V",
            "storhet": "U_{L}",
            "tolerans": {
              "rel": 0.02
            },
            "varde": 80.0
          },
          {
            "avrundning": "heltal",
            "enhet": "V",
            "storhet": "U",
            "tolerans": {
              "rel": 0.02
            },
            "varde": 100.0
          }
        ],
        "text": "Samma ström går genom båda komponenterna. Multiplicera strömmen med respektive motstånd mot strömmen.\n\nU_{R} = 2,0 · 30 = 60 V. U_{L} = 2,0 · 40 = 80 V.\n\nSpänningarna är fasförskjutna 90°. Källspänningen är √(60² + 80²) = 100 V, inte 60 + 80."
      }
    },
    "EL-000076": {
      "del": "impedans",
      "teori": [
        "fas"
      ],
      "resonemang": false,
      "tillampning": false,
      "syfte": "ange hur mycket strömmen är förskjuten och om den kommer före eller efter spänningen",
      "id": "EL-000076",
      "revision": 6,
      "title": "Fasvinkel i RL",
      "number": "Övning 6",
      "anchor": "v40_02-q6",
      "question": {
        "fraga": "R = 30 Ω, X_{L} = 40 Ω. Bestäm φ och ange om strömmen leder eller släpar spänningen.",
        "givet": "R = 30 Ω, X = +40 Ω. Använd arctan (tan^{−1}) med räknaren i grader (DEG).",
        "samband": [
          "φ = arctan(X/R)"
        ]
      },
      "hints": [
        {
          "niva": "begrepp",
          "status": "migrerad",
          "text": "φ är impedansvinkeln. Positiv φ betyder att spänningen ligger före strömmen, alltså att strömmen ligger efter."
        },
        {
          "niva": "metod",
          "status": "migrerad",
          "text": "Dela X med R, ta arctan och tolka tecknet."
        },
        {
          "niva": "nasta-steg",
          "status": "utkast",
          "text": "1) Ställ räknaren i DEG. 2) Dela X_{L} med R; kvoten är ett rent tal. 3) Tryck arctan (tan^{−1}, ofta SHIFT + tan). 4) Tolka tecknet: positiv φ i en RL-krets betyder att strömmen ligger efter (släpar). Exempel: X_{L} = 5 Ω och R = 12 Ω ger 5/12 ≈ 0,417 och arctan ≈ 22,6°. Rimlighet: liten X_{L} mot R ger liten vinkel, stor X_{L} mot R ger stor vinkel."
        }
      ],
      "solution": {
        "kalla": "Kursens facit (publikt) och bokens lösning (bok.enc)",
        "status": "migrerad",
        "svar": [
          {
            "enhet": "°",
            "storhet": "φ",
            "tolerans": {
              "rel": 0.02
            },
            "varde": 53.13010235415598
          },
          {
            "storhet": "Strömmen",
            "tolerans": {
              "rel": 0.02
            },
            "varde": "släpar"
          }
        ],
        "text": "Ställ räknaren i DEG. Dela först X med R: 40/30.\n\nTa arctan av kvoten: φ ≈ 53,1°.\n\nSpolens reaktans är positiv. Strömmen kommer efter spänningen: den släpar."
      }
    },
    "EL-000072": {
      "del": "impedans",
      "teori": [
        "xc"
      ],
      "resonemang": false,
      "tillampning": true,
      "syfte": "beräkna hur en kondensator påverkar växelström vid en viss frekvens",
      "id": "EL-000072",
      "revision": 6,
      "title": "Kondensatorns reaktans",
      "number": "Övning 2",
      "anchor": "v40_02-q2",
      "question": {
        "fraga": "C = 100 µF och f = 50 Hz. Beräkna X_{C}.",
        "givet": "Ideal kondensator, C = 100 µF, f = 50 Hz.",
        "samband": [
          "X_{C} = 1/(2πfC)"
        ]
      },
      "hints": [
        {
          "niva": "begrepp",
          "status": "migrerad",
          "text": "X_{C} är den kapacitiva reaktansen i Ω och C kapacitansen i F. 1 µF = 10^{−6} F."
        },
        {
          "niva": "metod",
          "status": "migrerad",
          "text": "Gör om µF till F. Räkna ut hela nämnaren innan du delar 1 med den."
        },
        {
          "niva": "nasta-steg",
          "status": "utkast",
          "text": "1) C i farad: µF · 10^{−6} (47 µF = 0,000047 F). 2) Räkna nämnaren 2 · π · f · C först och skriv ner den. 3) Tryck 1 ÷ nämnaren, så får du X_{C} i Ω. Exempel: 60 Hz och 47 µF ger nämnaren 2 · π · 60 · 0,000047 ≈ 0,0177 och X_{C} ≈ 56 Ω. Rimlighet: större C eller högre f ger mindre X_{C}."
        }
      ],
      "solution": {
        "kalla": "Kursens facit (publikt) och bokens lösning (bok.enc)",
        "status": "migrerad",
        "svar": [
          {
            "avrundning": "1 decimaler",
            "enhet": "Ω",
            "storhet": "X_{C}",
            "tolerans": {
              "rel": 0.02
            },
            "varde": 31.8
          }
        ],
        "text": "Omvandla först: 100 µF = 100/1 000 000 = 0,000100 F.\n\nRäkna nämnaren inom parentes: 2π · 50 · 0,000100 ≈ 0,031416.\n\nDividera sist: X_{C} = 1/0,031416 ≈ 31,8 Ω."
      }
    },
    "EL-000077": {
      "del": "impedans",
      "teori": [
        "rc"
      ],
      "resonemang": false,
      "tillampning": true,
      "syfte": "förutsäga ström och fas när kretsen innehåller en kondensator",
      "id": "EL-000077",
      "revision": 6,
      "title": "RC-krets",
      "number": "Övning 7",
      "anchor": "v40_02-q7",
      "question": {
        "fraga": "R = 60 Ω och X_{C} = 80 Ω i serie över 200 V RMS. Bestäm |Z|, I och φ.",
        "givet": "RC i serie: R = 60 Ω, X_{C} = 80 Ω, U = 200 V RMS. Räknaren står i grader (DEG).",
        "samband": [
          "X = −X_{C}; |Z| = √(R² + X²)",
          "I = U/|Z|; φ = arctan(X/R)"
        ]
      },
      "hints": [
        {
          "niva": "begrepp",
          "status": "migrerad",
          "text": "Kapacitiv reaktans räknas negativ, och negativ φ betyder att strömmen ligger före spänningen."
        },
        {
          "niva": "metod",
          "status": "migrerad",
          "text": "Använd X = −80 Ω. Räkna impedans, ström och vinkel i den ordningen."
        },
        {
          "niva": "nasta-steg",
          "status": "utkast",
          "text": "1) Sätt X = −X_{C} (kapacitiv reaktans är negativ). 2) |Z| = √(R² + X²); tecknet försvinner i kvadraten. 3) I = U_{RMS}/|Z|. 4) φ = arctan(X/R) med räknaren i DEG; svaret blir negativt. Exempel: R = 24 Ω, X_{C} = 10 Ω och 65 V ger |Z| = 26 Ω, I = 2,5 A och φ = arctan(−10/24) ≈ −22,6°."
        }
      ],
      "solution": {
        "kalla": "Kursens facit (publikt) och bokens lösning (bok.enc)",
        "status": "migrerad",
        "svar": [
          {
            "enhet": "Ω",
            "storhet": "|Z|",
            "tolerans": {
              "rel": 0.02
            },
            "varde": 100
          },
          {
            "enhet": "A",
            "storhet": "I",
            "tolerans": {
              "rel": 0.02
            },
            "varde": 2
          },
          {
            "enhet": "°",
            "storhet": "φ",
            "tolerans": {
              "rel": 0.02
            },
            "varde": -53.13010235415598
          }
        ],
        "text": "Kondensatorn ger negativ nettoreaktans: X = −80 Ω.\n\n|Z| = √(60² + (−80)²) = 100 Ω. I = 200/100 = 2,0 A.\n\nI DEG: φ = arctan(−80/60) ≈ −53,1°. Strömmen leder."
      }
    },
    "EL-000078": {
      "del": "impedans",
      "teori": [
        "xl",
        "xc"
      ],
      "resonemang": false,
      "tillampning": true,
      "syfte": "bedöma vad en ändrad frekvens gör med samma spole och kondensator",
      "id": "EL-000078",
      "revision": 6,
      "title": "Dubbel frekvens",
      "number": "Övning 8",
      "anchor": "v40_02-q8",
      "question": {
        "fraga": "Frekvensen ökas från 50 till 100 Hz. Hur ändras X_{L} och X_{C} när komponenterna är desamma?",
        "givet": "Bara frekvensen ändras, från 50 till 100 Hz. L och C är desamma.",
        "samband": [
          "X_{L} = 2πfL; X_{C} = 1/(2πfC)"
        ]
      },
      "hints": [
        {
          "niva": "begrepp",
          "status": "migrerad",
          "text": "X_{L} ökar med f. X_{C} minskar när f ökar, eftersom f står i nämnaren."
        },
        {
          "niva": "metod",
          "status": "migrerad",
          "text": "Byt f mot 2f i båda formlerna och jämför med de ursprungliga värdena."
        },
        {
          "niva": "nasta-steg",
          "status": "utkast",
          "text": "Ett fullständigt svar har en del för varje reaktans: 1) skriv X_{L} = 2πfL med f bytt mot 2f och säg hur X_{L} ändras (ökar eller minskar, och med vilken faktor). 2) Gör samma sak med X_{C} = 1/(2πfC), där f står i nämnaren. 3) Avsluta med en mening om varför de två går åt olika håll. Du behöver inga siffror, bara faktorn och riktningen."
        }
      ],
      "solution": {
        "kalla": "Kursens facit (publikt) och bokens lösning (bok.enc)",
        "status": "migrerad",
        "svar": [
          {
            "storhet": "X_{L}",
            "tolerans": {
              "rel": 0.02
            },
            "varde": "fördubblas"
          },
          {
            "storhet": "X_{C}",
            "tolerans": {
              "rel": 0.02
            },
            "varde": "halveras"
          }
        ],
        "text": "I X_{L} = 2πfL multipliceras med f. Dubbelt f ger dubbelt X_{L}.\n\nI X_{C} = 1/(2πfC) står f i nämnaren. Dubbelt f ger hälften så stort X_{C}."
      }
    },
    "EL-000079": {
      "del": "impedans",
      "teori": [
        "rlc"
      ],
      "resonemang": false,
      "tillampning": true,
      "syfte": "beräkna ström när en spole och en kondensator delvis motverkar varandra",
      "id": "EL-000079",
      "revision": 6,
      "title": "RLC-krets",
      "number": "Övning 9",
      "anchor": "v40_02-q9",
      "question": {
        "fraga": "R = 30 Ω, X_{L} = 50 Ω och X_{C} = 10 Ω i serie. U = 100 V RMS. Bestäm nettoreaktans, |Z| och I.",
        "givet": "RLC i serie: R = 30 Ω, X_{L} = 50 Ω, X_{C} = 10 Ω och U = 100 V RMS.",
        "samband": [
          "X = X_{L} − X_{C}",
          "|Z| = √(R² + X²); I = U/|Z|"
        ]
      },
      "hints": [
        {
          "niva": "begrepp",
          "status": "migrerad",
          "text": "X är den reaktans som blir kvar, med tecken. X_{L} och X_{C} anges som positiva tal."
        },
        {
          "niva": "metod",
          "status": "migrerad",
          "text": "Räkna ut X först och använd den – inte X_{L} ensam – i impedansformeln."
        },
        {
          "niva": "nasta-steg",
          "status": "utkast",
          "text": "1) X = X_{L} − X_{C}, med tecken (positivt betyder induktivt). 2) |Z| = √(R² + X²) med nettoreaktansen, inte X_{L}. 3) I = U_{RMS}/|Z|. Exempel: X_{L} = 25 Ω, X_{C} = 15 Ω och R = 24 Ω ger X = 10 Ω, |Z| = √(576 + 100) = 26 Ω, och 65 V ger I = 2,5 A. Rimlighet: |Z| är alltid minst lika stor som R."
        }
      ],
      "solution": {
        "kalla": "Kursens facit (publikt) och bokens lösning (bok.enc)",
        "status": "migrerad",
        "svar": [
          {
            "enhet": "Ω",
            "storhet": "X",
            "tolerans": {
              "rel": 0.02
            },
            "varde": 40
          },
          {
            "enhet": "Ω",
            "storhet": "|Z|",
            "tolerans": {
              "rel": 0.02
            },
            "varde": 50
          },
          {
            "enhet": "A",
            "storhet": "I",
            "tolerans": {
              "rel": 0.02
            },
            "varde": 2
          }
        ],
        "text": "Beräkna nettoreaktansen först: X = 50 − 10 = 40 Ω.\n\n|Z| = √(30² + 40²) = 50 Ω.\n\nI = 100/50 = 2,0 A."
      }
    },
    "EL-000080": {
      "del": "impedans",
      "teori": [
        "resonans"
      ],
      "resonemang": false,
      "tillampning": true,
      "syfte": "känna igen resonansfallet där kretsens reaktiva delar tar ut varandra",
      "id": "EL-000080",
      "revision": 7,
      "title": "Serieresonans",
      "number": "Övning 10",
      "anchor": "v40_02-q10",
      "question": {
        "fraga": "En ideal RLC-krets i serie har R = 20 Ω och X_{L} = X_{C} = 40 Ω. Den matas med 100 V RMS. Bestäm strömmen och fasvinkeln.",
        "givet": "R = 20 Ω, X_{L} = X_{C} = 40 Ω, U = 100 V RMS. Spole och kondensator är ideala.",
        "samband": [
          "X = X_{L} − X_{C}; I = U/√(R² + X²)",
          "φ = arctan(X/R)"
        ]
      },
      "hints": [
        {
          "niva": "begrepp",
          "status": "migrerad",
          "text": "Vid serieresonans tar reaktanserna ut varandra, men R begränsar fortfarande strömmen."
        },
        {
          "niva": "metod",
          "status": "migrerad",
          "text": "Sätt in skillnaden mellan reaktanserna och räkna ut I och φ. Spänningen över spolen och kondensatorn kan ändå vara stor."
        },
        {
          "niva": "nasta-steg",
          "status": "utkast",
          "text": "1) X = X_{L} − X_{C}. 2) |Z| = √(R² + X²); när X är noll blir |Z| = R. 3) I = U_{RMS}/|Z|. 4) φ = arctan(X/R). 5) Kontroll: räkna U_{L} = I · X_{L}; den kan bli större än matningen. Exempel: 230 V och R = 92 Ω vid resonans ger I = 2,5 A; med X_{L} = 60 Ω blir U_{L} = 2,5 · 60 = 150 V."
        }
      ],
      "solution": {
        "kalla": "Kursens facit (publikt) och bokens lösning (bok.enc)",
        "status": "migrerad",
        "svar": [
          {
            "avrundning": "1 decimaler",
            "enhet": "A",
            "storhet": "I",
            "tolerans": {
              "rel": 0.02
            },
            "varde": 5.0
          },
          {
            "avrundning": "heltal",
            "enhet": "°",
            "storhet": "φ",
            "tolerans": {
              "rel": 0.02
            },
            "varde": 0.0
          }
        ],
        "text": "Spolens och kondensatorns reaktanser tar ut varandra: X = 40 − 40 = 0 Ω.\n\nDå är |Z| = R = 20 Ω. I = 100/20 = 5,0 A.\n\nφ = arctan(0/20) = 0°. Kretsen är resistiv vid denna frekvens."
      }
    },
    "EL-000081": {
      "del": "effekt",
      "teori": [
        "s"
      ],
      "resonemang": false,
      "tillampning": false,
      "syfte": "beskriva matningens skenbara effekt utifrån spänning och ström",
      "id": "EL-000081",
      "revision": 5,
      "title": "Skenbar effekt",
      "number": "Övning 1",
      "anchor": "v40_03-q1",
      "question": {
        "fraga": "En enfaslast har U = 230 V och I = 4,0 A RMS. Beräkna S.",
        "givet": "Enfaslast, U = 230 V och I = 4,0 A RMS.",
        "samband": [
          "S = U · I"
        ]
      },
      "hints": [
        {
          "niva": "begrepp",
          "status": "migrerad",
          "text": "S är den skenbara effekten i VA. U och I är effektivvärden."
        },
        {
          "niva": "metod",
          "status": "migrerad",
          "text": "Multiplicera U med I och ange svaret i VA – den aktiva effekten är inte känd."
        },
        {
          "niva": "nasta-steg",
          "status": "utkast",
          "text": "1) Skriv S = U_{RMS} · I_{RMS}. 2) Multiplicera spänning och ström. 3) Skriv enheten VA, inte W, eftersom du inte vet effektfaktorn. Rimlighet: några ampere vid 230 V ger några hundra VA. Exempel: 230 V och 2,5 A ger S = 575 VA."
        }
      ],
      "solution": {
        "kalla": "Kursens facit (publikt) och bokens lösning (bok.enc)",
        "status": "migrerad",
        "svar": [
          {
            "avrundning": "heltal",
            "enhet": "VA",
            "storhet": "S",
            "tolerans": {
              "rel": 0.02
            },
            "varde": 920.0
          }
        ],
        "text": "Skenbar effekt räknas med effektivvärdena: S = U · I.\n\nS = 230 · 4,0 = 920 VA. Skriv VA, eftersom vi söker skenbar effekt."
      }
    },
    "EL-000082": {
      "del": "effekt",
      "teori": [
        "pf"
      ],
      "resonemang": false,
      "tillampning": false,
      "syfte": "skilja den aktiva effekten från den skenbara effekten",
      "id": "EL-000082",
      "revision": 5,
      "title": "Aktiv effekt",
      "number": "Övning 2",
      "anchor": "v40_03-q2",
      "question": {
        "fraga": "S = 920 VA och cos φ = 0,75. Beräkna P. Spänning och ström är sinusformade.",
        "givet": "S = 920 VA och cos φ = 0,75. Sinusformad spänning och ström.",
        "samband": [
          "P = S · cos φ"
        ]
      },
      "hints": [
        {
          "niva": "begrepp",
          "status": "migrerad",
          "text": "P är den aktiva effekten i W. Vid ren sinusform är cos φ effektfaktorn."
        },
        {
          "niva": "metod",
          "status": "migrerad",
          "text": "Multiplicera S med cos φ. P kan aldrig bli större än S."
        },
        {
          "niva": "nasta-steg",
          "status": "utkast",
          "text": "1) Skriv P = S · cos φ. 2) cos φ är ett tal mellan 0 och 1 utan enhet, så VA blir W. 3) Kontroll: P kan aldrig bli större än S; vid cos φ = 1 är P = S. Exempel: S = 575 VA och cos φ = 0,80 ger P = 575 · 0,80 = 460 W."
        }
      ],
      "solution": {
        "kalla": "Kursens facit (publikt) och bokens lösning (bok.enc)",
        "status": "migrerad",
        "svar": [
          {
            "avrundning": "heltal",
            "enhet": "W",
            "storhet": "P",
            "tolerans": {
              "rel": 0.02
            },
            "varde": 690.0
          }
        ],
        "text": "Vid sinusform är cos φ samma som effektfaktorn. Den anger andelen aktiv effekt.\n\nP = 920 · 0,75 = 690 W. Kontroll: aktiv effekt är mindre än skenbar effekt."
      }
    },
    "EL-000083": {
      "del": "effekt",
      "teori": [
        "q",
        "exempel"
      ],
      "resonemang": false,
      "tillampning": false,
      "syfte": "använda effekttriangeln för att beskriva en induktiv last",
      "id": "EL-000083",
      "revision": 5,
      "title": "Effekttriangel",
      "number": "Övning 3",
      "anchor": "v40_03-q3",
      "question": {
        "fraga": "En induktiv enfaslast har P = 600 W och Q = 800 var. Bestäm S och PF.",
        "givet": "P = 600 W, Q = +800 var. Sinusformad spänning och ström, induktiv last.",
        "samband": [
          "S = √(P² + Q²); PF = P/S"
        ]
      },
      "hints": [
        {
          "niva": "begrepp",
          "status": "migrerad",
          "text": "P mäts i W, Q i var och S i VA. PF saknar enhet."
        },
        {
          "niva": "metod",
          "status": "migrerad",
          "text": "Räkna P och Q i samma enhet (W och var, inte kW). Räkna ut S innan du räknar P/S."
        },
        {
          "niva": "nasta-steg",
          "status": "utkast",
          "text": "1) S = √(P² + Q²): kvadrera, lägg ihop, dra roten ur. 2) PF = P/S, ett tal utan enhet. 3) Rimlighet: S är större än både P och Q, och PF ligger mellan 0 och 1. Exempel: P = 2 400 W och Q = 1 000 var ger S = √(5 760 000 + 1 000 000) = 2 600 VA och PF = 2 400/2 600 ≈ 0,92."
        }
      ],
      "solution": {
        "kalla": "Kursens facit (publikt) och bokens lösning (bok.enc)",
        "status": "migrerad",
        "svar": [
          {
            "avrundning": "2 decimaler",
            "enhet": "kVA",
            "storhet": "S",
            "tolerans": {
              "rel": 0.02
            },
            "varde": 1.0
          },
          {
            "avrundning": "2 decimaler",
            "storhet": "PF",
            "tolerans": {
              "rel": 0.02
            },
            "varde": 0.6
          }
        ],
        "text": "P och Q är vinkelräta delar: S = √(600² + 800²) = 1 000 VA.\n\nOmvandla till fältets enhet: 1 000 VA = 1,00 kVA.\n\nPF = P/S = 600/1 000 = 0,60. PF saknar enhet."
      }
    },
    "EL-000084": {
      "del": "effekt",
      "teori": [
        "q"
      ],
      "resonemang": false,
      "tillampning": false,
      "syfte": "skilja den aktiva och reaktiva delen åt när skenbar effekt och effektfaktor är kända",
      "id": "EL-000084",
      "revision": 5,
      "title": "Reaktiv effekt",
      "number": "Övning 4",
      "anchor": "v40_03-q4",
      "question": {
        "fraga": "S = 2,0 kVA och cos φ = 0,80. Lasten är induktiv och sinusformad. Bestäm P och Q.",
        "givet": "S = 2,0 kVA, cos φ = 0,80. Ren sinusform.",
        "samband": [
          "P = S cos φ; sin φ = √(1 − cos²φ)",
          "Q = S sin φ"
        ]
      },
      "hints": [
        {
          "niva": "begrepp",
          "status": "migrerad",
          "text": "För en induktiv last är sin φ och Q positiva."
        },
        {
          "niva": "metod",
          "status": "migrerad",
          "text": "Med S i kVA får du P i kW och Q i kvar. Räkna först P, sedan sin φ, och multiplicera till sist S med sin φ för att få Q."
        },
        {
          "niva": "nasta-steg",
          "status": "utkast",
          "text": "1) P = S · cos φ (kVA ger kW). 2) sin φ = √(1 − cos φ · cos φ): kvadrera cos φ, dra från 1, ta roten. 3) Q = S · sin φ (kVA ger kvar). 4) Kontroll: √(P² + Q²) ska ge S igen. Exempel: S = 2,5 kVA och cos φ = 0,60 ger P = 1,5 kW, sin φ = 0,80 och Q = 2,0 kvar."
        }
      ],
      "solution": {
        "kalla": "Kursens facit (publikt) och bokens lösning (bok.enc)",
        "status": "migrerad",
        "svar": [
          {
            "enhet": "kW",
            "storhet": "P",
            "tolerans": {
              "rel": 0.02
            },
            "varde": 1.6
          },
          {
            "enhet": "kvar",
            "storhet": "Q",
            "tolerans": {
              "rel": 0.02
            },
            "varde": 1.2
          }
        ],
        "text": "S står i kVA. Därför får vi P i kW och Q i kvar.\n\nP = 2,0 · 0,80 = 1,6 kW.\n\nsin φ = √(1 − 0,80²) = 0,60. Q = 2,0 · 0,60 = 1,2 kvar."
      }
    },
    "EL-000085": {
      "del": "effekt",
      "teori": [
        "energi"
      ],
      "resonemang": false,
      "tillampning": false,
      "syfte": "beräkna aktiv energianvändning med effekt och drifttid",
      "id": "EL-000085",
      "revision": 5,
      "title": "Energin på elmätaren",
      "number": "Övning 5",
      "anchor": "v40_03-q5",
      "question": {
        "fraga": "En last har P = 1,60 kW och S = 2,0 kVA. Den går i 3 h. Beräkna den aktiva energin.",
        "givet": "P = 1,60 kW under hela tiden, 3 h. S = 2,0 kVA behövs inte för den aktiva energin.",
        "samband": [
          "Eaktiv = P · t"
        ]
      },
      "hints": [
        {
          "niva": "begrepp",
          "status": "migrerad",
          "text": "Aktiv energi anges i kWh när aktiv effekt P anges i kW och tid t i h."
        },
        {
          "niva": "metod",
          "status": "migrerad",
          "text": "Välj aktiv effekt och multiplicera med tiden. Behåll enheten kWh."
        },
        {
          "niva": "nasta-steg",
          "status": "utkast",
          "text": "1) Välj den aktiva effekten P i kW; S används inte. 2) E = P · t med t i timmar. 3) Enheten blir kWh, som på elmätaren. Är tiden i minuter: dela med 60 först. Exempel: en vattenkokare på 2,3 kW i 90 min = 1,5 h ger E = 2,3 · 1,5 = 3,45 kWh."
        }
      ],
      "solution": {
        "kalla": "Kursens facit (publikt) och bokens lösning (bok.enc)",
        "status": "migrerad",
        "svar": [
          {
            "avrundning": "2 decimaler",
            "enhet": "kWh",
            "storhet": "E",
            "tolerans": {
              "rel": 0.02
            },
            "varde": 4.8
          }
        ],
        "text": "Välj aktiv effekt P för aktiv energi. Den skenbara effekten behövs inte.\n\nE = 1,60 kW · 3 h = 4,8 kWh."
      }
    },
    "EL-000086": {
      "del": "effekt",
      "teori": [
        "strom"
      ],
      "resonemang": false,
      "tillampning": false,
      "syfte": "förutsäga matningsströmmen när effektfaktorn är lägre än ett",
      "stopp": {
        "text": "Här slutar torsdagens övningar hemma. Skriv också växelströmsinlämningens uppgift 1 och 2. Ta med frågor till fredag; då gör vi övning 7–10 och den guidade labben tillsammans.",
        "href": "Inlamning.html#uppgift-1",
        "label": "Hemma: inlämningens uppgift 1 och 2",
        "nasta": "Fredag: läs om kompensering"
      },
      "id": "EL-000086",
      "revision": 5,
      "title": "Matningsström",
      "number": "Övning 6",
      "anchor": "v40_03-q6",
      "question": {
        "fraga": "En enfaslast tar P = 1 840 W vid 230 V och PF = 0,80. Bestäm strömmen.",
        "givet": "Enfas, P = 1 840 W, U = 230 V RMS och PF = 0,80.",
        "samband": [
          "I = P/(U · PF)"
        ]
      },
      "hints": [
        {
          "niva": "begrepp",
          "status": "migrerad",
          "text": "Formeln kommer från P = U · I · PF. Med P i W och U i V får du I i A."
        },
        {
          "niva": "metod",
          "status": "migrerad",
          "text": "Räkna ut nämnaren och dela P med den."
        },
        {
          "niva": "nasta-steg",
          "status": "utkast",
          "text": "1) Räkna nämnaren U · PF först. 2) I = P/(U · PF). 3) Enheten blir A. Rimlighet: I blir större än P/U, eftersom PF är mindre än 1. Exempel: en pumpmotor på 1 380 W vid 230 V och PF = 0,80 ger nämnaren 230 · 0,80 = 184 och I = 1 380/184 = 7,5 A."
        }
      ],
      "solution": {
        "kalla": "Kursens facit (publikt) och bokens lösning (bok.enc)",
        "status": "migrerad",
        "svar": [
          {
            "avrundning": "1 decimaler",
            "enhet": "A",
            "storhet": "I",
            "tolerans": {
              "rel": 0.02
            },
            "varde": 10.0
          }
        ],
        "text": "Utgå från P = U · I · PF och dividera med U · PF för att få I.\n\nRäkna först nämnaren: 230 · 0,80 = 184.\n\nI = 1 840/184 = 10,0 A. Kontroll: 230 · 10,0 · 0,80 = 1 840 W."
      }
    },
    "EL-000087": {
      "del": "effekt",
      "teori": [
        "kompensering"
      ],
      "resonemang": false,
      "tillampning": true,
      "syfte": "beskriva vilken kapacitiv reaktiv effekt som tar ut lastens induktiva del i modellen",
      "id": "EL-000087",
      "revision": 5,
      "title": "Full kompensering",
      "number": "Övning 7",
      "anchor": "v40_03-q7",
      "question": {
        "fraga": "En last har P = 3 kW och Q = +4 kvar. Hur stor kapacitiv reaktiv effekt behövs för att Qtotal ska bli 0?",
        "givet": "Lasten har P = 3 kW och Qlast = +4 kvar. Målet är Qtotal = 0. Komponenterna är ideala.",
        "samband": [
          "Qtotal = Qlast + Qkondensator"
        ]
      },
      "hints": [
        {
          "niva": "begrepp",
          "status": "migrerad",
          "text": "Induktiv Q räknas positiv och kapacitiv negativ."
        },
        {
          "niva": "metod",
          "status": "migrerad",
          "text": "Lös ut Qkondensator och ange både tecken och storlek. Du behöver inte räkna ut kondensatorns kapacitans."
        },
        {
          "niva": "nasta-steg",
          "status": "utkast",
          "text": "1) Skriv Qtotal = Qlast + Qkondensator och sätt Qtotal = 0. 2) Lös ut Qkondensator. 3) Ange både tecken (kapacitiv är negativ) och storlek i kvar. P behövs inte i den här uppgiften. Exempel: en last med Qlast = +2,5 kvar kompenseras helt av Qkondensator = −2,5 kvar."
        }
      ],
      "solution": {
        "kalla": "Kursens facit (publikt) och bokens lösning (bok.enc)",
        "status": "migrerad",
        "svar": [
          {
            "avrundning": "heltal",
            "enhet": "kvar",
            "storhet": "Qkondensator",
            "tolerans": {
              "rel": 0.02
            },
            "varde": -4.0
          }
        ],
        "text": "Målet är Q_{total} = 0. Kondensatorn måste därför bidra med motsatt tecken.\n\nQkondensator = 0 − 4 = −4 kvar. Behovets belopp är 4 kvar."
      }
    },
    "EL-000088": {
      "del": "effekt",
      "teori": [
        "strom",
        "kompensering"
      ],
      "resonemang": false,
      "tillampning": true,
      "syfte": "jämföra hur stor ström samma aktiva effekt kräver vid två effektfaktorer",
      "id": "EL-000088",
      "revision": 5,
      "title": "Ström före och efter",
      "number": "Övning 8",
      "anchor": "v40_03-q8",
      "question": {
        "fraga": "En enfaslast har P = 1 800 W vid 230 V. PF höjs från 0,60 till 0,90. Beräkna strömmen i matningen före och efter.",
        "givet": "P = 1 800 W och U = 230 V är oförändrade. PF ökar från 0,60 till 0,90.",
        "samband": [
          "I_{1} = P/(U · PF_{1}); I_{2} = P/(U · PF_{2})"
        ]
      },
      "hints": [
        {
          "niva": "begrepp",
          "status": "migrerad",
          "text": "1 betyder före och 2 efter."
        },
        {
          "niva": "metod",
          "status": "migrerad",
          "text": "Vid samma aktiva effekt minskar strömmen när PF ökar. Använd samma P och U i båda beräkningarna och byt bara PF."
        },
        {
          "niva": "nasta-steg",
          "status": "utkast",
          "text": "1) I_{1} = P/(U · PF_{1}): räkna nämnaren först. 2) I_{2} = P/(U · PF_{2}) med samma P och U, bara PF byts. 3) Jämför: I_{2} ska bli mindre än I_{1}. Exempel: en pumpmotor på 1 380 W vid 230 V ger 1 380/(230 · 0,40) = 15,0 A vid PF 0,40 och 1 380/(230 · 0,80) = 7,5 A vid PF 0,80."
        }
      ],
      "solution": {
        "kalla": "Kursens facit (publikt) och bokens lösning (bok.enc)",
        "status": "migrerad",
        "svar": [
          {
            "avrundning": "1 decimaler",
            "enhet": "A",
            "storhet": "I_{1}",
            "tolerans": {
              "rel": 0.02
            },
            "varde": 13.0
          },
          {
            "avrundning": "2 decimaler",
            "enhet": "A",
            "storhet": "I_{2}",
            "tolerans": {
              "rel": 0.02
            },
            "varde": 8.7
          }
        ],
        "text": "Behåll samma P och U. Byt bara effektfaktorn i I = P/(U · PF).\n\nFöre: I_{1} = 1 800/(230 · 0,60) ≈ 13,0 A.\n\nEfter: I_{2} = 1 800/(230 · 0,90) ≈ 8,70 A. Kontroll: bättre PF ger mindre ström."
      }
    },
    "EL-000089": {
      "del": "effekt",
      "teori": [
        "forlust"
      ],
      "resonemang": false,
      "tillampning": true,
      "syfte": "bedöma hur en ändrad ström påverkar förlusten i samma kabel",
      "id": "EL-000089",
      "revision": 5,
      "title": "Ledningsförlust",
      "number": "Övning 9",
      "anchor": "v40_03-q9",
      "question": {
        "fraga": "Strömmen i en kabel minskar från 12 A till 8 A. Hur stor del av den tidigare förlusten I² · R är kvar?",
        "givet": "Samma kabel, alltså samma R. Strömmen går från 12 A till 8 A.",
        "samband": [
          "P_{2}/P_{1} = (I_{2}/I_{1})²",
          "Minskning i % = 100 · (1 − P_{2}/P_{1})"
        ]
      },
      "hints": [
        {
          "niva": "begrepp",
          "status": "migrerad",
          "text": "Kvoten ger den andel som återstår. Multiplicera med 100 för procent."
        },
        {
          "niva": "metod",
          "status": "migrerad",
          "text": "Kvadrera strömkvoten. Skilj på procent som återstår och procentuell minskning."
        },
        {
          "niva": "nasta-steg",
          "status": "utkast",
          "text": "Ett fullständigt svar har tre delar: 1) kvoten I_{2}/I_{1} (nya strömmen delad med den gamla), 2) kvoten i kvadrat, som är den andel av förlusten som återstår, gärna i procent, 3) minskningen i procent, 100 minus det som återstår. Kvoterna saknar enhet. Exempel: går strömmen från 16 A till 8 A är kvoten 0,5 och kvadraten 0,25, alltså 25 % kvar och 75 % mindre."
        }
      ],
      "solution": {
        "kalla": "Kursens facit (publikt) och bokens lösning (bok.enc)",
        "status": "migrerad",
        "svar": [
          {
            "enhet": "%",
            "storhet": "Andel som återstår",
            "tolerans": {
              "abs": 1
            },
            "varde": 44.44444444444444
          }
        ],
        "text": "Samma kabel betyder samma R. I kvoten mellan förlusterna försvinner R.\n\nKvadrera strömkvoten: (8/12)² ≈ 0,4444.\n\nMultiplicera med 100: cirka 44,4 % återstår. Minskningen är cirka 55,6 %, vilket är en annan fråga."
      }
    },
    "EL-000090": {
      "del": "effekt",
      "teori": [
        "overtoner"
      ],
      "resonemang": true,
      "tillampning": true,
      "syfte": "skilja verklig effektfaktor från grundtonens cos φ när övertoner finns",
      "id": "EL-000090",
      "revision": 5,
      "title": "Övertoner",
      "number": "Övning 10",
      "anchor": "v40_03-q10",
      "question": {
        "fraga": "En mätare visar P = 800 W, S = 1 000 VA och cos φ = 0,95 för grundtonen. Beräkna PF och förklara skillnaden.",
        "givet": "P = 800 W, S = 1 000 VA och grundtonens cos φ = 0,95. Strömmen kan innehålla övertoner.",
        "samband": [
          "PF = P/S"
        ]
      },
      "hints": [
        {
          "niva": "begrepp",
          "status": "migrerad",
          "text": "PF är den totala aktiva effekten delad med den totala skenbara effekten. cos φ gäller här bara grundtonen."
        },
        {
          "niva": "metod",
          "status": "migrerad",
          "text": "Räkna PF direkt ur mätvärdena och förklara varför cos φ ensam inte beskriver en förvrängd ström."
        },
        {
          "niva": "nasta-steg",
          "status": "utkast",
          "text": "1) PF = P/S med mätarens P och S; ett tal utan enhet, två decimaler. 2) Jämför med grundtonens cos φ. 3) Ett fullständigt svar förklarar två saker: vad övertonerna gör med strömmen och S, och varför de inte bidrar till P. Rimlighet: PF kan inte vara större än cos φ när strömmen är förvrängd."
        }
      ],
      "solution": {
        "kalla": "Kursens facit (publikt) och bokens lösning (bok.enc)",
        "status": "migrerad",
        "svar": [
          {
            "avrundning": "2 decimaler",
            "storhet": "PF",
            "tolerans": {
              "rel": 0.02
            },
            "varde": 0.8
          }
        ],
        "text": "Använd den totala aktiva och skenbara effekten: PF = P/S = 800/1 000 = 0,80.\n\ncos φ = 0,95 avser grundtonen. Övertoner gör att det värdet inte ensamt beskriver hela strömmen."
      }
    }
  }
};
