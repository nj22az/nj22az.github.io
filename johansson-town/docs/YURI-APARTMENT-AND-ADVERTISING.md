# Yuri’s apartment and advertising screen

Yuri’s home now loads the owner-supplied Seinfeld apartment on entry. The existing exterior and saved home identity are retained. The model has no furnished bedroom: her sleep and animated cover use the broad living-room sofa. Breakfast, waking and departure use measured clear positions. Polygon boundaries exclude the neighbouring corridor; furniture colliders leave the study, kitchen and bathroom connected. The breakfast table was moved 25 cm to clear the study passage.

Reproduce the 3.6 MB runtime model with `python tools/pack-yuri-apartment.py /path/to/seinfeld_apartment.glb`. The script requires NumPy and Pillow, verifies the upload hash, preserves author metadata, converts legacy diffuse maps and merges compatible materials.

A square video billboard faces the shopping lane above Sakura Konbini. It plays the supplied five-second clip silently, inline, without stretching. One clip loops; multiple entries in `ADVERTISING_CLIPS` in `src/world/advertising-billboard.js` shuffle without immediate repeats across cycles. Add local video files, poster paths and aspect ratios there.

Video loading begins only within 32 metres while the screen faces the camera and intersects its view. Playback pauses indoors, while paused, off-screen, behind the board, or in a hidden tab. The poster remains available if playback is blocked; a later pointer/key action retries autoplay. Failed clips are skipped without repeated requests.

Validation: 13 focused apartment, loading, household routine and billboard checks pass; production build passes. Full suite: 151/158 pass. The seven failures also reproduce on unchanged main (`410a0dc`): full-town doorway checks, residential grid clearance, harbour fallback, two Inakaya schedule cases, office test loading, and old voice subtitles. Local browser preview was blocked by the remote browser’s network policy.
