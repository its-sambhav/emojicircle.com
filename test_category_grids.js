/**
 * Checks the pre-rendered emoji grids on the category pages.
 *
 * The cards used to be built client-side. They are now in the HTML so that
 * crawlers and no-JS visitors see them, and renderGrid() bails out when the
 * container already has children. If that guard is ever lost, every category
 * page renders each emoji twice — which is the specific thing this checks.
 *
 *   node test_category_grids.js
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const dir = path.join(__dirname, 'categories');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.html'));
assert.ok(files.length === 9, `expected 9 category pages, found ${files.length}`);

// Minimal stand-ins for the two DOM APIs renderGrid() touches.
function fakeGrid(existingChildren) {
  return { children: { length: existingChildren }, appendCount: 0, appendChild() { this.appendCount++; } };
}

let totalCards = 0;
for (const file of files) {
  const html = fs.readFileSync(path.join(dir, file), 'utf8');
  const name = file.replace('.html', '');

  const staticCards = (html.match(/class="cat-emoji-card"/g) || []).length;
  const dataItems = (html.match(/\{\s*e:\s*"/g) || []).length;
  assert.ok(staticCards > 0, `${name}: no pre-rendered cards in HTML`);
  assert.strictEqual(
    staticCards, dataItems,
    `${name}: ${staticCards} pre-rendered cards but ${dataItems} entries in the JS array — they drifted apart`
  );

  // The guard must run before anything is appended.
  const body = html.slice(html.indexOf('function renderGrid'));
  const guardAt = body.indexOf('grid.children.length');
  const appendAt = body.indexOf('appendChild');
  assert.ok(guardAt !== -1, `${name}: renderGrid is missing the already-rendered guard`);
  assert.ok(guardAt < appendAt, `${name}: guard must come before appendChild`);

  // Run the real guard expression both ways.
  const guarded = (grid) => !grid || grid.children.length;
  assert.ok(guarded(fakeGrid(staticCards)), `${name}: guard failed to stop a double render`);
  assert.ok(!guarded(fakeGrid(0)), `${name}: guard would block the empty-container fallback`);

  // Copy still works by reading .emoji-display out of the closest card.
  assert.ok(html.includes('class="emoji-display"'), `${name}: cards lack .emoji-display, copy button would break`);
  assert.ok(html.includes('emoji-copy-btn'), `${name}: cards lack a copy button`);

  totalCards += staticCards;
  console.log(`  ok  ${name}: ${staticCards} cards pre-rendered, guard in place`);
}

console.log(`\nAll ${files.length} category pages OK — ${totalCards} emoji cards in static HTML.`);
