const interests = [
  "Surfing",
  "Tennis",
  "Singing",
  "Running",
  "Climbing",
  "Language Exchange",
  "Board Games",
  "Coffee"
];

const businesses = ["Ocean Club", "Northside Tennis", "Laneway Coffee"];
const events = ["Welcome Picnic", "Climbing Night", "Board Game Social"];

export default function HomePage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
  const connectionStatus = supabaseUrl ? "Configured for local Supabase" : "Missing Supabase URL";

  return (
    <main style={{ padding: 32 }}>
      <h1>Buzz Admin</h1>
      <p>Environment: {process.env.NEXT_PUBLIC_APP_ENV ?? "local"}</p>
      <p>Supabase URL: {supabaseUrl}</p>
      <p>Connection status: {connectionStatus}</p>
      <section>
        <h2>Seeded interests</h2>
        <ul>
          {interests.map((interest) => (
            <li key={interest}>{interest}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Sample businesses</h2>
        <ul>
          {businesses.map((business) => (
            <li key={business}>{business}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Sample events</h2>
        <ul>
          {events.map((event) => (
            <li key={event}>{event}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
