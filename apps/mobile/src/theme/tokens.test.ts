import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const tokensSource = readFileSync("src/theme/tokens.ts", "utf8");

test("themes expose semantic light and dark design tokens", () => {
  assert.match(tokensSource, /mode: "light"/);
  assert.match(tokensSource, /mode: "dark"/);
  assert.match(tokensSource, /background:/);
  assert.match(tokensSource, /surface:/);
  assert.match(tokensSource, /text:/);
  assert.match(tokensSource, /accent:/);
});

test("theme includes typography, spacing, borders, radii, and shadows", () => {
  assert.match(tokensSource, /fontFamilies/);
  assert.match(tokensSource, /fontSizes/);
  assert.match(tokensSource, /spacing/);
  assert.match(tokensSource, /radii/);
  assert.match(tokensSource, /borderWidths/);
  assert.match(tokensSource, /shadows/);
  assert.match(tokensSource, /elevation: 5/);
  assert.match(tokensSource, /elevation: 6/);
});
