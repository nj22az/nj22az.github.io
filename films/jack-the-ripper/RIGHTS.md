# Rights: what the film is made of, and whether it may be sold

The owner, 13 November 2026: "this video will be published and sold, I hold the rights to the music too"; of Meshy:
"I am on Professional it says I can use it commercially".

This is a record of a licence check made on 13 November 2026 against each vendor's own terms, each answer re-read
by a second, independent checker who opened the cited pages (142 of 144 quoted passages were found as quoted; two
pages refused the request). **It is a factual reading of public terms, not legal advice.** Terms change: where one
matters, keep a dated copy of the page.

## Summary

| Ingredient | May it be in a film that is sold | What to do |
|---|---|---|
| The song, the recording, the logo drawing | The owner's own | Nothing |
| Meshy models, rigs, stock clips | Yes on a paid plan, no credit needed | Keep the invoice; back up the files (below) |
| Remotion 4.0.300 (the edit) | Yes, free for an individual | Nothing, unless an organisation of 4 or more runs the project |
| Typefaces in the picture | Yes, no credit needed | Nothing |
| Blender, potrace, FFmpeg, x264 (GPL tools) | Yes: the licence does not reach their output | Do not ship the tools with the film |
| Speech model, dictionary, librosa (timing only) | Yes | Nothing |
| H.264 / AAC file format | Yes; no royalty for a title of 12 minutes or less | See "Format" |
| Fog, grain, wisp pictures; the scream | Made by code in this folder | Nothing |
| The dance, the title card, the subject | No licence needed | Keep to the conditions under "Resemblances" |
| The sailor mascot as a brand | The owner's own drawing; **one real caution** | See "The mascot" |

## Meshy

- Terms of Service, "Last Updated: September 19, 2026", section 3.2: "Customers on a paid Meshy plan ... own their
  Customer Output" (<https://www.meshy.ai/terms-of-use>). Help centre: "attribution is only required for models
  generated on the free plan". No Meshy term restricts selling a film that shows the assets; Meshy's own pages name
  films as a use.
- The rigs and library animation clips are "Service Assets", licensed royalty-free "solely to the extent
  incorporated into and necessary for Customer to use and otherwise exploit the Customer Output". Used on the rigged
  characters in the film: covered. Do not pass the clips on as motion files of their own.
- Rights stay after a subscription ends: "You'll retain the rights to the models you created while you were a
  subscriber" (help centre article 9992023). Rights follow the plan held when the asset was made: **keep the invoice
  or billing page showing the paid plan on 12 and 13 November 2026.**
- All 144 Meshy tasks for the film were made through Meshy's API by its command-line tool, which Meshy offers to paid
  plans only. The prompts are in the task files: generic Victorian and cabaret descriptions, text only, no reference
  image, no studio, brand, character or person named. A cabaret windmill made at the start is not in the film.
- **The files.** Meshy deletes API output three days after it is made (Terms 2.5), so its copies go on about 15 to 16
  November 2026, and API assets do not appear in the Meshy workspace. The only copies are the 61 GLB files
  (2.7 GB) and task records in the cloud session's scratch folder, which does not last. **They must be copied to the
  owner's own storage.** Keep the originals unaltered as the record of where the models came from (Terms 2.4 forbid
  removing AI identifiers; none was found in the files).
- Meshy gives no warranty that output does not resemble someone else's work, and the customer answers for it. The
  characters were asked for in generic terms; compare them once against well-known designs before release.
- Do not publish the models to Meshy's Community page (that puts them under CC0). Optional: opt out of training by
  email to Meshy's support address.

## Remotion

- The licence shipped with 4.0.300 lists "an individual" among those who may use it free, "non-commercially or
  commercially for the purpose of creating videos and images"
  (<https://raw.githubusercontent.com/remotion-dev/remotion/v4.0.300/LICENSE.md>). FAQ: "Can I make money under the
  Free License? Yes."
- A company licence is needed only if a for-profit organisation of four or more runs the project. Selling the MP4 is
  not selling Remotion. If the project's source were ever sold, the buyer needs to qualify for a licence of their own.

## Typefaces

- Pirata One, IM Fell English, IM Fell English SC, Limelight: SIL Open Font License 1.1. The licence's own FAQ lists
  "video titling" as permitted, "No additional license or permission is required", and no acknowledgement is required
  (<https://openfontlicense.org/ofl-faq/>).
- DejaVu Serif Bold (the pub sign, painted in Blender): Bitstream Vera licence with DejaVu's changes in the public
  domain; its conditions concern copies of the font, not lettering in a picture.
- Only if font files are passed on do the licences ask anything. `stage.py` packs the DejaVu file into the stage's
  `.blend`, and the `@fontsource` files sit in `node_modules`: neither is in the repository or the film. Keep it so, or
  include the licence texts.

## Tools

- GPL tools (Blender 4.2, potrace, FFmpeg with x264, and the `cmudict` Python package): the GPL covers the program,
  not what it makes. Blender's manual: "The GPL only applies to the Blender application and not the artwork you create
  with it." The rendered pictures, the traced logo and the MP4 carry no condition.
- faster-whisper and the Whisper model (MIT), CTranslate2 (MIT), librosa (ISC), the CMU dictionary (BSD) were used
  only to find when words are sung. Nothing of theirs is in the film or the repository.
- **No AI lip-sync, voice or picture model has touched the film.**

## Format (H.264 and AAC)

- The AVC patent pool's public terms (Via LA, page updated 1 November 2026) list content sold title by title of
  "12 minutes or less" at "$0.00"; AAC: "no patent license fees due for the distribution of bit-streams".
- Sold through a platform that hosts, delivers and takes payment, this is the platform's matter. Sold as a direct
  download from the owner's own site, he is the seller and the rate for a 2-minute title is zero. Putting it inside a
  paid subscription of his own would need a fresh look.

## Resemblances

- **The dance.** *The Skeleton Dance* (1929) is in the US public domain since 1 January 2025; Germany may still protect
  it. It does not matter: the film's dance is new, pose by pose, and copies no frame or figure; ideas and single dance
  steps are not protected. Keep "Disney", "Silly Symphony" and "Disney-style" out of the film and all sales text.
- **The title card.** It carries none of the features those studios have registered: no mouse, no rabbit in rings, no
  shield, no script sign-off, none of their names, lettering or music. What would be too close: a character's head
  bursting out of a bright orange or yellow starburst (the 1932 Mickey title, still in US copyright), or a tunnel of
  coloured rings. The card is sepia with the owner's own mark and name. Do not recolour it that way.
- **The subject.** Jack the Ripper, Whitechapel and 1888 are history. The victims' names are not on screen or in any
  sales text ("Polly" is a working name in these notes only); keep it so. A live US trade mark JACK THE RIPPER
  (Reg. 5860200) covers music and music-video production services: use the words as the title of this one work, not as
  an artist, channel, label or series name. "The Black Lantern" is a sign on a fictional pub; do not use it as a
  product or studio name.
- **Platforms.** It is a cartoon about a murderer. On YouTube set the audience to "not made for kids", use no family
  wording, say in the description that it is animated fiction, and keep blood out of the thumbnail and title; consider
  the age restriction. On Vimeo rate it "Mature" if in doubt. Read the content rules of any store used.

## The mascot

The one finding that is more than housekeeping, and it is about the studio's mark, not this film alone.

- The sailor is the owner's own drawing. Copyright in the 1929 Popeye has lapsed in the US (2025) and in Segar's
  drawings in the UK and EU (2009), so copyright is the smaller question.
- Trade marks are the larger one. Hearst holds POPEYE word marks, picture marks in the EU, and has US picture-mark
  applications pending for films (serials 99701293 and 99701320, both under Office action on 13 October 2026) and
  allowed for toys (99738602). Because the sailor is used as a brand, the ordinary test applies: would buyers think the
  films come from, or are licensed by, the Popeye people.
- **Shared** with Popeye: a 1930s rubber-hose cartoon sailor, a cap, an oversized flexed arm, an anchor.
  **Different**: a full beard, both eyes open, a striped shirt, the anchor held in the hand, no pipe, no tattoos, and
  the owner's own studio name round the figure.
- **Never add**: a pipe, a wink or squint, forearm tattoos, spinach, or any Popeye or Bluto wording.
- **Do**: keep dated originals showing the owner drew it; and before building the brand further on films for sale, have
  a trade mark professional run a clearance search (US, and the EU and UK if sold there). No register was searched for
  the studio's own name, to keep the owner's name out of outside requests.

## Lip-sync tools, should one be wanted

Checked in advance, because the film is sold. Usable commercially: Rhubarb Lip Sync (MIT, "the resulting lip sync data
belongs to you alone"), WhisperX with its default English aligner (BSD and MIT/Apache; choose the silero voice
detector), Montreal Forced Aligner with the English (US) ARPA model (CC BY 4.0, needs a credit line; **not** the
"English MFA" model, whose training data is non-commercial), NVIDIA Audio2Face-3D (needs an NVIDIA graphics card).
Not usable: Wav2Lip and everything that loads its checkpoints, SyncTalk, ScanTalk, EmoTalk (non-commercial).
Unclear, so avoid: SadTalker, EchoMimic, JoyVASA, LatentSync, MuseTalk, and the pretrained weights of Demucs (the voice
separator; its maintainer says "The license of the weights is not clear"). The owner's own isolated vocal track from
the recording session, if he has one, needs no separator at all.

## Still for the owner

1. Keep the Meshy invoice for November 2026.
2. Choose where the 2.7 GB of Meshy files and the Blender cast and stage files are to be kept; they exist only in the
   cloud session.
3. Where and how the film is sold (a platform, or his own site), and under which title and artist name.
4. The clearance search on the mascot.
