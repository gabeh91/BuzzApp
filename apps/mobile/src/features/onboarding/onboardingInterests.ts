import type { BuzzHomeQuery } from "@graphql/generated";
import type { BuzzInterest } from "@/features/interests/interestFlow";

export const fallbackInterests: BuzzInterest[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Surfing",
    slug: "surfing",
    category: "sport",
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    name: "Tennis",
    slug: "tennis",
    category: "sport",
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    name: "Singing",
    slug: "singing",
    category: "music",
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    name: "Running",
    slug: "running",
    category: "fitness",
  },
  {
    id: "00000000-0000-0000-0000-000000000005",
    name: "Climbing",
    slug: "climbing",
    category: "fitness",
  },
  {
    id: "00000000-0000-0000-0000-000000000006",
    name: "Language Exchange",
    slug: "language-exchange",
    category: "learning",
  },
  {
    id: "00000000-0000-0000-0000-000000000007",
    name: "Board Games",
    slug: "board-games",
    category: "social",
  },
  {
    id: "00000000-0000-0000-0000-000000000008",
    name: "Coffee",
    slug: "coffee",
    category: "food",
  },
  {
    id: "00000000-0000-0000-0000-000000000009",
    name: "Cooking Classes",
    slug: "cooking-classes",
    category: "food",
  },
  {
    id: "00000000-0000-0000-0000-000000000010",
    name: "Gym / Fitness",
    slug: "gym-fitness",
    category: "fitness",
  },
  {
    id: "00000000-0000-0000-0000-000000000011",
    name: "Golf",
    slug: "golf",
    category: "sport",
  },
  {
    id: "00000000-0000-0000-0000-000000000012",
    name: "Knitting",
    slug: "knitting",
    category: "creative",
  },
  {
    id: "00000000-0000-0000-0000-000000000013",
    name: "Chess",
    slug: "chess",
    category: "social",
  },
  {
    id: "00000000-0000-0000-0000-000000000014",
    name: "Walking",
    slug: "walking",
    category: "fitness",
  },
  {
    id: "00000000-0000-0000-0000-000000000015",
    name: "Hackathons",
    slug: "hackathons",
    category: "learning",
  },
  {
    id: "00000000-0000-0000-0000-000000000016",
    name: "Book Clubs",
    slug: "book-clubs",
    category: "social",
  },
  {
    id: "00000000-0000-0000-0000-000000000017",
    name: "Wine Clubs",
    slug: "wine-clubs",
    category: "food",
  },
  {
    id: "00000000-0000-0000-0000-000000000018",
    name: "Pottery Classes",
    slug: "pottery-classes",
    category: "creative",
  },
  {
    id: "00000000-0000-0000-0000-000000000019",
    name: "Rock Climbing",
    slug: "rock-climbing",
    category: "fitness",
  },
  {
    id: "00000000-0000-0000-0000-000000000020",
    name: "Soccer",
    slug: "soccer",
    category: "sport",
  },
  {
    id: "00000000-0000-0000-0000-000000000021",
    name: "Archery",
    slug: "archery",
    category: "sport",
  },
  {
    id: "00000000-0000-0000-0000-000000000022",
    name: "Basketball",
    slug: "basketball",
    category: "sport",
  },
  {
    id: "00000000-0000-0000-0000-000000000023",
    name: "Netball",
    slug: "netball",
    category: "sport",
  },
  {
    id: "00000000-0000-0000-0000-000000000024",
    name: "Volleyball",
    slug: "volleyball",
    category: "sport",
  },
  {
    id: "00000000-0000-0000-0000-000000000025",
    name: "Ultimate Frisbee",
    slug: "ultimate-frisbee",
    category: "sport",
  },
  {
    id: "00000000-0000-0000-0000-000000000026",
    name: "Touch Rugby",
    slug: "touch-rugby",
    category: "sport",
  },
  {
    id: "00000000-0000-0000-0000-000000000027",
    name: "Pickleball",
    slug: "pickleball",
    category: "sport",
  },
  {
    id: "00000000-0000-0000-0000-000000000028",
    name: "Yoga",
    slug: "yoga",
    category: "fitness",
  },
  {
    id: "00000000-0000-0000-0000-000000000029",
    name: "Photography Walks",
    slug: "photography-walks",
    category: "creative",
  },
  {
    id: "00000000-0000-0000-0000-000000000030",
    name: "Trivia Nights",
    slug: "trivia-nights",
    category: "social",
  },
  {
    id: "00000000-0000-0000-0000-000000000031",
    name: "Gardening",
    slug: "gardening",
    category: "lifestyle",
  },
];

const isBuzzInterest = (value: unknown): value is BuzzInterest => {
  const interest = value as Partial<BuzzInterest>;

  return Boolean(
    interest.id && interest.name && interest.slug && interest.category,
  );
};

export const getInterestsFromGraphql = (
  data: BuzzHomeQuery | undefined,
): BuzzInterest[] => {
  return (
    data?.interestsCollection?.edges
      .map((edge) => edge.node)
      .filter(isBuzzInterest) ?? fallbackInterests
  );
};
