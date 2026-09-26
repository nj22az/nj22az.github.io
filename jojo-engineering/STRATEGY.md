# JoJo Engineering: YouTube operating system

The plan for taking the JoJo Engineering channel from zero to the YouTube Partner Program, and past it to income that doesn't depend on ad revenue.

> **Numbers to verify.** YouTube changes its thresholds and policies. The figures below are the ones I know of. Check **YouTube Studio → Earn** before you plan around them.

---

## 1. Where you start

| | Assessment |
|---|---|
| **Niche** | Marine and industrial electrics, taught by someone who has worked on ships and teaches the subject. Narrow, underserved and high-trust. Few channels explain 440 V / 60 Hz IT systems, insulation monitoring, generators and shore power properly. |
| **Audience** | (1) Marine engineering and ETO cadets preparing for exams: the Philippines, India, Indonesia, Ukraine, Poland, the Baltics and the Nordics. (2) Working seafarers and electricians moving into marine or offshore work. (3) Electrical apprentices anywhere who need "why", not just "how". (4) Boat, van and off-grid hobbyists. |
| **Competitors** | *Big animated explainers* (such as The Engineering Mindset): polished but generic, with no ship context. *Electrician personalities* (such as Electrician U, ElectroBOOM): building-wiring or entertainment. *Marine engineering channels*: mostly machinery, rarely electrics, often slide narration. **The gap:** electrics explained from inside the engine room, with a memorable character. |
| **Resources** | A full course's worth of material (theory, worked examples, safety procedure, labs), which is years of content. A working Shorts renderer in this repo (`shorts/`). Real ship experience and access to equipment. One person's time, so everything below is batched. |
| **Goal** | YPP first (ads, memberships, Super Thanks), then diversified income: training licences, digital products, sponsorships. |

**The strategic call:** use Shorts for discovery and long-form for watch hours and money. A niche this specific will not reach 10 M Shorts views in 90 days on purpose. It can reach 4,000 watch hours through search-driven long-form videos, which Shorts feed.

---

## 2. Monetization thresholds

| Tier | Requirements | What it unlocks |
|---|---|---|
| **Expanded YPP** (not in every country) | 500 subscribers, 3 public uploads in 90 days, **and** 3,000 public watch hours in 12 months **or** 3 M public Shorts views in 90 days | Memberships, Super Thanks, Super Chat, Shopping |
| **Full YPP** | 1,000 subscribers **and** 4,000 public long-form watch hours in 12 months **or** 10 M public Shorts views in 90 days | Ad revenue (long-form and Shorts feed share) |

What matters in practice:
- **Shorts views do not count toward watch hours.** Only long-form counts.
- **4,000 hours = 240,000 minutes.** A 10-minute video with a 4-minute average view duration needs 60,000 views in total. That is realistic over 12 months with 25–30 search-targeted long videos.
- **The "inauthentic / reused content" review** is the real risk for this format. Templated, mass-produced videos with no human voice are what YouTube rejects at review. Protection:
  1. **Your own voice-over** on every Short (render with `--no-talk` and record over the music; details below).
  2. Regular real footage: switchboards, meters, the engine room (with permission and no sensitive details).
  3. Varied formats (section 5), not 100 identical Shorts.
  4. Long-form videos where you are clearly the teacher.

---

## 3. Channel positioning

**One line:** *Electrics explained from inside the engine room.*

**Promise to the viewer:** in under a minute you understand *why*, not just the formula, and you get one safety habit that could save your life.

**Identity:**
- **Name:** JoJo Engineering. **Handle:** try `@JoJoEngineering`, then `@JoJoEng`.
- **Character:** the pixel-art ship's electrician (yellow hard hat, red beard, navy coverall, multimeter). Use him in every thumbnail, the banner, the avatar and end screens. He is the brand, and you are his voice.
- **Look:** a pixel-art ship bridge, a dark hook banner, a white board and one colour per meaning (blue = value, orange = warning, red = what we're solving for or what's wrong, green = the answer).
- **Tone:** calm, exact, a little dry. Safety is never a joke; everything else can be.

**Banner text:** *Marine & industrial electrics · New Shorts Mon–Fri · Deep dives every other Thursday*

**About text (first 150 characters matter):**
> Electrics explained from inside the engine room: AC, three-phase, generators, IT systems, fault-finding and electrical safety, taught by a working marine electrical teacher. New Shorts every weekday.

---

## 4. Content pillars

Every video belongs to one pillar. Rotate them so the channel reads as a system, not a random feed.

| Pillar | Share | What it is | Examples (✔ = already rendered) |
|---|---|---|---|
| **1. Why it works** | 35 % | The idea behind a formula, in one visual | ✔ Why 230 V peaks at 325 V · ✔ Why √3 · ✔ Double current, 4× heat · ✔ 50 vs 60 Hz · ✔ Kirchhoff |
| **2. Don't do this** | 25 % | A common mistake, what happens, the habit that prevents it | ✔ Lead left in the A jack · ✔ 0 V doesn't mean dead · Megger on electronics · Earthing the wrong side |
| **3. Ship systems** | 25 % | How the electrical plant on a ship works | ✔ Insulation alarm on an IT system · ✔ kVA vs kW generators · Shore power · Preferential tripping · Blackout recovery |
| **4. Fault-finding** | 15 % | A symptom, the measurements and the conclusion, told as a story | ✔ Latching circuit · Motor won't start · Breaker trips at start · Readings that don't add up |

The course material covers all four pillars. Mine it in this order: the topics with the strongest "wait, what?" first (they drive shares), then exam-critical topics (they drive search and saves).

---

## 5. Video formats

| Format | Length | Structure | Frequency |
|---|---|---|---|
| **Pixel explainer Short** (the renderer) | 35–50 s | Hook question → 3 beats → stamp takeaway → line that loops back to the hook | 3 per week |
| **Quiz Short** | 20–30 s | "What does the meter show?" → 3 s countdown → answer → why | 1 per week (from week 3) |
| **Real-world Short** | 20–40 s | Phone footage of real equipment + your voice + the teacher as an overlay | 1 per week (from week 5) |
| **Deep dive** (long-form) | 8–15 min | Search-titled. Built from 3–5 related Shorts, expanded with worked examples, a whiteboard and footage | Every other week, weekly from month 4 |
| **Exam walkthrough** (long-form) | 15–25 min | Solve 5 exam-style problems step by step. Very high watch time from students | Monthly |
| **Live study session** | 45–60 min | Q&A before exam seasons | From 500 subscribers |

**Long-form titles are search queries, not teasers.** For example: *How a Ship's IT Electrical System Works (Insulation Monitoring Explained)*, *Megger Insulation Testing: Step by Step*, *Three-Phase Power Explained for Marine Engineers*, *Power Factor and Generators Explained (kW vs kVA)*.

---

## 6. Upload strategy

| Phase | Weeks | Shorts / week | Long-form | Focus |
|---|---|---|---|---|
| **Launch** | 1–4 | 5 (Mon–Fri) | 1 every other week | Publish the 10 rendered Shorts plus 10 new ones. Learn what gets "viewed vs. swiped". |
| **Find the winners** | 5–12 | 5 | 1 every other week | Double down on the top 20 % topics. First exam walkthrough. |
| **Search engine** | 13–26 | 4 | 1 per week | Long-form carries the watch hours. Every long video gets 2–3 feeder Shorts linked to it. |
| **Scale** | 27–52 | 4 | 1 per week + 1 live per month | Playlists per exam topic, collaborations, first product. |

**Publish time:** 14:00 UTC (afternoon in Europe, evening in India, night in the Philippines). Test ±3 h after week 8.

**Linking:** use the *Related video* field on each Short to point at the matching long-form video, the most effective Shorts → watch-hours bridge. Add a pinned comment with the same link.

---

## 7. Growth systems

1. **Topic bank:** one list of 100 topics, each tagged with pillar, source chapter, search volume (YouTube search autocomplete) and status. The course's chapters give the first 100.
2. **Batch production:** script 5 Shorts in one sitting, record 5 voice-overs in one sitting, render overnight (`render.cjs`), schedule a week in one go.
3. **Series:** "Why √?" (the root series), "Don't Do This", "Engine Room Mysteries". Series build binge chains and playlists.
4. **Comment loop:** end some Shorts with a question ("What would you measure next?"). Reply to every comment for the first 90 days, and turn the best questions into the next Short (reply-with-video).
5. **Cross-posting:** the same MP4 goes to TikTok, Instagram Reels and LinkedIn (maritime professionals are active there). Remove the YouTube-specific #shorts.
6. **Communities:** share the long-form videos (not the Shorts) where they answer a real question: r/marineengineering, r/ElectricalEngineering, r/electricians, seafarer Facebook groups and maritime academy forums. Answer first, link second.
7. **Collaborations:** maritime academies and cadet channels. Offer a free "exam topic" video for their students.
8. **Email list from day 1:** a free formula sheet PDF in exchange for an email address. That list is the audience you own when the algorithm changes.

---

## 8. Retention framework

The renderer already enforces the first four rules in `shorts/check.mjs`.

| Rule | Why | How |
|---|---|---|
| **Hook in frame 1** | The swipe decision takes about 1 second | The question is on screen from 0.0 s, and the first line starts by 0.5 s |
| **One idea** | Shorts that teach two things lose on both | Hook → one mechanism → one takeaway |
| **Readable at 15 characters per second** | Most viewers watch muted | Burned-in speech bubble, large type, with a check-script limit |
| **Under 60 s** (target 35–50 s) | Completion rate matters more than length | `check.mjs` fails over 60 s |
| **Visual change every 3–5 s** | Stops the scroll reflex | New beat, a curve drawing, a stamp, the teacher pointing |
| **Payoff at 70–80 %** | Viewers who wait get rewarded, the rest keep watching | The stamp with the formula or rule |
| **Loop ending** | Rewatches count as views and signal quality | The last line echoes the hook ("…next time you see 230 V, think 325.") |

**Targets and what to do about them**

| Metric (YouTube Studio) | Target | If below target |
|---|---|---|
| Shorts: *viewed vs. swiped away* | ≥ 70 % | Rewrite the hook: more concrete, a number, a mistake |
| Shorts: *average % viewed* | ≥ 85 % | Cut the slowest beat, tighten lines |
| Long-form: CTR | ≥ 5 % | New thumbnail: the teacher, 3 words, one number |
| Long-form: 30-second retention | ≥ 70 % | Show the result first, explain after |
| Long-form: average view duration | ≥ 40 % | Chapters, more visual changes, remove repetition |

---

## 9. Monetization plan

**Stage 1: YPP (months 1–12).** Watch-hour route. 30 long-form videos × about 2,000 views × about 4 min ≈ 4,000 h. Subscribers follow: at a typical 1–2 subscribers per 100 Shorts views, 50–100 k Shorts views gives the 1,000.

**Stage 2: income that doesn't depend on ads (start before YPP):**

| Stream | When | Estimated potential |
|---|---|---|
| **Formula sheet and exam question packs** (PDF) | Month 2 | Small but immediate. Also builds the email list |
| **Affiliate links:** multimeters, insulation testers, clamp meters, tools | Month 2 | Grows with the "Don't do this" and tool videos |
| **Training licence for shipping companies and academies:** your Shorts and deep dives as onboarding material, plus lab simulators | Month 6 | **The biggest line.** One company or academy contract can exceed a year of ad revenue |
| **Channel memberships:** early access, monthly live Q&A, worked solutions | At expanded YPP | Steady and recurring |
| **Sponsorships:** test equipment makers, maritime training providers, crewing agencies | 5–10 k subscribers | Niche B2B audiences pay above average |
| **Ad revenue** | At full YPP | Engineering and industrial long-form earns well. Shorts earn little: treat them as marketing |

---

## 10. Weekly execution schedule

About 8–10 hours a week, batched.

| Day | Block | Task | Time |
|---|---|---|---|
| **Mon** | Plan | Choose 5 topics from the bank, write 5 Short scripts in `shorts/episodes/`, run `check.mjs` | 1.5 h |
| **Tue** | Record | Record 5 voice-overs in one session. Render overnight | 1 h |
| **Wed** | Publish | Review the renders, upload, schedule Mon–Fri at 14:00 UTC, add Related video links | 1 h |
| **Thu** | Long-form | Record the deep dive (every other week) or film a real-world Short | 2 h |
| **Fri** | Edit | Edit the long-form, thumbnail, chapters, description with links | 2 h |
| **Sat** | Community | Reply to comments, one community post (poll or quiz), share one video in one community | 45 min |
| **Sun** | Review | 30 min in Studio: which Short beat 70 % viewed? Put 2 topics in the bank as follow-ups | 30 min |

---

## 11. Milestones

| Checkpoint | Subscribers | Shorts views (total) | Watch hours | Long-form published |
|---|---|---|---|---|
| Day 30 | 100 | 20 k | 50 | 2 |
| Day 90 | 500 | 150 k | 600 | 6 |
| Day 180 | 1,200 | 500 k | 2,000 | 16 |
| Day 365 | 3,000+ | 1.5 M | 4,000+ | 30+ |

If you are more than 50 % behind at day 90, change the **hook style and topics** first, not the frequency.

---

## 12. The first 30 days

| Week | Mon | Tue | Wed | Thu | Fri |
|---|---|---|---|---|---|
| 1 | ✔ RMS 325 V | ✔ Amp jack | ✔ Double current | ✔ Insulation alarm | ✔ Test before touch |
| 2 | ✔ Root three | ✔ Latching circuit | ✔ kVA vs kW | ✔ Kirchhoff | ✔ 50 vs 60 Hz |
| 3 | Ohm's law in one picture | Series vs parallel | *Quiz:* what does the meter read? | Shore power connection | Megger on electronics |
| 4 | Star vs delta | Transformer ratio | *Quiz:* which breaker trips? | Preferential tripping | Motor won't start |

**Long-form:** week 2, *How a Ship's IT Electrical System Works*. Week 4, *Three-Phase Power Explained for Marine Engineers*.

**Before the first upload:**
- [ ] Create the channel, handle, avatar (the teacher's head) and banner (the teacher on the bridge)
- [ ] About text, links (email list), channel keywords
- [ ] Default upload settings: English, category *Education*, the standard description footer
- [ ] Playlists: *Why It Works*, *Don't Do This*, *Ship Systems*, *Fault-Finding*
- [ ] Record the voice-overs for the first 10 Shorts
- [ ] Safety disclaimer in the default description: *"Educational content. Follow your company's procedures and local regulations; work on electrical equipment only if you are qualified and authorised."*

---

## 13. Risks

| Risk | Mitigation |
|---|---|
| Rejected at YPP review as templated content | Your own voice, real footage, varied formats, long-form with you as the teacher |
| A safety claim is wrong or misread | One safety rule per video, stated plainly; disclaimer; correct in a pinned comment and re-upload if needed |
| Burnout | Batching, a bank of 20 finished Shorts ahead, fixed weekly time blocks |
| Material overlaps with courses you teach under other agreements | Write the scripts fresh in English, use new example numbers, and check any employer or school agreements before licensing |
