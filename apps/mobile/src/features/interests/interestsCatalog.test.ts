import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import test from "node:test";

const onboardingInterestsSource = readFileSync(
  "src/features/onboarding/onboardingInterests.ts",
  "utf8",
);
const mobileOperationsSource = readFileSync(
  "graphql/operations.graphql",
  "utf8",
);
const seedSqlSource = readFileSync("../../supabase/seed.sql", "utf8");
const migrationSources = readdirSync("../../supabase/migrations")
  .filter((fileName) => fileName.endsWith(".sql"))
  .map((fileName) =>
    readFileSync(`../../supabase/migrations/${fileName}`, "utf8"),
  );

const expectedInterestSlugs = [
  "golf",
  "knitting",
  "chess",
  "walking",
  "hackathons",
  "book-clubs",
  "wine-clubs",
  "pottery-classes",
  "rock-climbing",
  "soccer",
  "archery",
  "basketball",
  "netball",
  "volleyball",
  "ultimate-frisbee",
  "touch-rugby",
  "pickleball",
  "yoga",
  "photography-walks",
  "trivia-nights",
  "gardening",
];

test("starter interest catalog is seeded in Supabase and available as mobile fallback", () => {
  for (const slug of expectedInterestSlugs) {
    assert.match(seedSqlSource, new RegExp(`'${slug}'`));
    assert.match(onboardingInterestsSource, new RegExp(`slug: "${slug}"`));
  }
});

test("expanded starter interest catalog is applied through an idempotent migration", () => {
  const interestCatalogMigration = migrationSources.find((source) =>
    expectedInterestSlugs.every((slug) => source.includes(`'${slug}'`)),
  );

  assert.ok(interestCatalogMigration);
  assert.match(
    interestCatalogMigration,
    /insert into public\.interests \(name, slug, category\)/,
  );
  assert.match(interestCatalogMigration, /on conflict \(slug\) do nothing/);
});

test("mobile GraphQL query requests enough interests for the expanded starter catalog", () => {
  assert.match(mobileOperationsSource, /interestsCollection\(first: 50\)/);
});
