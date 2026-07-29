# EmojiCircle — Phase 4 proposal & open items

Written 2026-07-29, after shipping Phases 1–3. Phases 1–3 are done and verified;
this file covers what comes next and what still needs a decision from you.

---

## Phase 4 pilot plan — approved approach, 10 hub pages

Approved: intent-clustered hub pages, not 3,900 per-emoji pages, gated on a
hand-written 10-page pilot. **Nothing is written yet.** This is the plan for
review; sources come from you before drafting.

Ground rules for every page below:

- No statistic ships without a citable source. Where I've flagged `TODO(source)`
  the page still works without the number — the claim gets cut, not guessed.
- Each page is a `/guides/<slug>` URL, extensionless, self-referencing canonical,
  in the sitemap, with `FAQPage` schema built from the visible Q&A only.
- Each links to the relevant category page and to at least two others in the set.
- "Non-generic" below means: the specific thing on this page that Emojipedia,
  EmojiTerra and emojikeyboard.org do not have. If that column is ever weak, the
  page shouldn't ship.

| # | Page | Primary target query | What makes it non-generic |
|---|---|---|---|
| 1 | Every heart emoji and what each colour means | "heart emoji meanings" | A single comparison table of all ~20 hearts with colour, Unicode name, connotation, and the common misread (💚 jealousy vs friendship, 🖤 grief vs aesthetic). Incumbents scatter these across 20 separate pages — the comparison *is* the value. |
| 2 | Why the same emoji looks different on iPhone, Android and WhatsApp | "why do emojis look different on android" | Explains the render pipeline: one code point, per-vendor font. Uses the site's own cross-platform screenshots of ~10 emojis with the biggest visual divergence. **Needs original screenshots — I can't produce these.** |
| 3 | What 🙏 actually means: prayer, thank you, or high five | "what does the folded hands emoji mean" | The Indian reading (namaste / thanks) is under-represented in English results, and the "high five" myth is widespread. Names the Unicode name, the Japanese origin, and the three live readings without declaring one correct. |
| 4 | Emoji meanings in Hindi — इमोजी का मतलब | "emoji meaning in hindi" | Real Hindi, not machine translation. `/emoji-search` already has seed content for this that only became visible in Phase 3. Highest-differentiation page in the set. **Needs a fluent Hindi review pass before publishing.** |
| 5 | Hand gesture emojis and what they mean in different countries | "hand gesture emoji meanings" | The cross-cultural angle: 👌 🤌 👍 🤙 carry different and occasionally offensive meanings by region. Genuinely useful and almost entirely uncovered. `TODO(source)` for any "offensive in country X" claim — cite or cut. |
| 6 | Emojis that don't mean what you think | "emoji hidden meanings" | Curated set where the common use has drifted from the Unicode name (🥺 💀 🫠 🧢 🌽). Frames each as name vs actual use. Highest share and link potential in the set. |
| 7 | How to type emojis on Windows, Mac, Android and iPhone | "how to type emoji on laptop" | Pure how-to with the actual keystrokes (Win+`.`, Ctrl+Cmd+Space). Ranks on clarity and freshness, not authority — the realistic early win. Genuinely sequential, so this one gets real `HowTo` schema. |
| 8 | Emoji etiquette at work: what 👍 signals to your manager | "is thumbs up emoji rude" | The generational read of 👍 as dismissive is a live, frequently-searched question. India-specific workplace framing is uncontested. Opinion-shaped, so no statistics needed — which makes it fast to ship. |
| 9 | Every skin tone modifier and how to use them | "emoji skin tone meaning" | Explains Fitzpatrick modifiers mechanically — why some emojis take them, why groups often don't, why the modifier sometimes fails to apply. A mechanism page, not a list. |
| 10 | New emojis coming in Emoji 17.0 and 18.0 | "new emojis 2026" | Recurring seasonal demand and the existing blog post already covers the ground — this is the *evergreen hub* version, updated per release, that the blog post links into. **Must be checked against the current Unicode release status before publishing; do not restate the blog post's dates without re-verifying.** |

### Sequencing

Ship 3 first — #1, #6, #7. They need no external sources, no screenshots, and
no language review, so they test the format fastest. Wait 6–8 weeks, read
Search Console impressions, and only then commit to the remaining 7. If the
first three earn nothing, the answer to scaling this was always no.

### What I need from you before drafting

- #2: cross-platform screenshots
- #4: a fluent Hindi reviewer
- #5: sources for any regional-offensiveness claim
- #10: confirmation of current Unicode release status

## Open items that need you

1. **Which X handle is real?** The repo disagrees with itself and I am not
   guessing again:
   - `x.com/emojicircle4u` — was in the sitewide JS header
   - `twitter.com/emojicircle` — was on the contact page

   I standardised on `emojicircle4u` to stop the contradiction, but that was a
   judgement call, not knowledge. It is now in `Organization.sameAs` on
   `index.html` and `pages/rules/about.html`, and in both footers. Tell me
   which is right and it's a one-line change.

2. **Pinterest.** `pin.it/6mgY7seJK` is a short link, so it is deliberately
   **not** in any `sameAs` array — short links redirect and aren't stable
   entity identifiers. It's kept as a footer link because it works for humans.
   Send the full `pinterest.com/<profile>` URL and it goes into `sameAs`.

3. **Confirm the redirects deployed.** I pushed 44 forced `.html` ->
   extensionless 301 rules, but the sandbox lost network before I could verify
   them live. Please check:

   ```
   curl -sI https://emojicircle.com/games/emoji-quiz.html | head -3
   curl -sI https://emojicircle.com/google585d8a6ecd08e358.html | head -3
   ```

   Expected: the first returns `301` with `location: /games/emoji-quiz`; the
   second must still return **200**, because Search Console fetches that exact
   path and `build-redirects.py` deliberately excludes it. If the verification
   file 301s, GSC verification breaks.

4. **Then request re-indexing.** Both URL forms are currently in Google's
   index. The 301s tell Google which one wins, but that consolidation takes
   weeks. Resubmit the sitemap after confirming the redirects fire.

## Known issues I deliberately did not fix

- **Two game pages have a stray `</div>`**: `emoji-hollywood-quiz.html` (1) and
  `emoji-rock-paper-scissors.html` (2). Both pre-date this work — I verified
  the imbalance is identical before and after my changes. Browsers auto-correct
  it and I had no way to visually test layout here, so I left them rather than
  risk breaking two working game pages. Worth fixing next time someone has a
  browser open.

- **`emoji-search` and the Globe still require JavaScript** for their core
  interaction. That's correct and expected for both — the requirement was that
  *content* pages work without JS, and category pages and blog posts now do.
  The Globe now has ~1,500 chars of static description so it's no longer
  invisible to non-JS crawlers.

---

## Maintenance

Regenerate the sitemap after adding or renaming any page:

```
python3 build-sitemap.py
```

It reads each page's canonical tag, so the sitemap cannot drift from the
canonicals. Run the grid regression test after touching the category pages:

```
node test_category_grids.js
```
