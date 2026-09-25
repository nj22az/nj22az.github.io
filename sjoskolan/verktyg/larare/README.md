# Lösenordsskyddade lärarsidor

Lärarsidorna publiceras krypterade. Den publicerade filen innehåller bara chiffertext och ett lösenordsformulär, så innehållet går inte att läsa utan lösenordet, varken på webbplatsen eller i repositoryt. Lösenordet sparas i webbläsarens sessionStorage tills fliken stängs, så att läraren kan gå mellan lärarsidorna.

Skyddade sidor:

- `vecka-40/aktuell/Lararstod.html`
- `vecka-41/aktuell/Simulerade_stationer_larare.html`
- `gemensamt/Riggar.html`

Kryptering: AES-GCM 256 bit med nyckel från PBKDF2-SHA-256, 600 000 varv och slumpat salt per sida.

## Redigera en sida

Klartexten ska aldrig läggas i repositoryt. Arbeta i en mapp utanför det.

```sh
export LARARLOSEN='…'
node sjoskolan/verktyg/larare/las.mjs unlock sjoskolan/gemensamt/Riggar.html ~/larare/Riggar.html
# redigera ~/larare/Riggar.html
node sjoskolan/verktyg/larare/las.mjs lock ~/larare/Riggar.html sjoskolan/gemensamt/Riggar.html
```

## Ny lärarsida

Skriv sidan som vanlig HTML utanför repositoryt och lås den med `lock` till sin plats i repositoryt. Lägg till den i listan ovan.

## Byt lösenord

```sh
LARARLOSEN_GAMMALT='gammalt' LARARLOSEN='nytt' node sjoskolan/verktyg/larare/las.mjs rekey sjoskolan/vecka-40/aktuell/Lararstod.html sjoskolan/vecka-41/aktuell/Simulerade_stationer_larare.html sjoskolan/gemensamt/Riggar.html
```

## Begränsningar

Skyddet håller innehållet borta från elever som inte har lösenordet. Äldre, okrypterade versioner av sidorna finns kvar i repositoryts historik fram till 25 september 2026. Simulatorerna räknar fortfarande ut sina svar i webbläsaren, så en elev som läser deras JavaScript kan hitta svaren där.
