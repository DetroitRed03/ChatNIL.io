import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyNikeDashboard() {
  const testAthleteId = "b63b82c5-8551-40e4-ba3c-c3223932e0ad";
  const nikeAgencyId = "3f270e9b-cc2b-48a0-b82e-52fdf1094879";

  // Check and update test athlete name
  const { data: current } = await supabase
    .from("users")
    .select("*")
    .eq("id", testAthleteId)
    .single();

  console.log("Current test athlete data:", current);

  // Update with a proper name if needed
  const needsUpdate = current && (current.first_name === "Test" || current.first_name === null);
  if (needsUpdate) {
    const { error: updateErr } = await supabase
      .from("users")
      .update({
        first_name: "Alex",
        last_name: "Rivera",
        username: "alex-rivera"
      })
      .eq("id", testAthleteId);

    if (updateErr) {
      console.log("Update error:", updateErr);
    } else {
      console.log("Updated test athlete to Alex Rivera");
    }
  }

  // Now verify the full state
  console.log("\n=== FINAL VERIFICATION ===");

  // Get saved athletes (should be 3)
  const { data: saved } = await supabase
    .from("agency_athlete_lists")
    .select("athlete_id")
    .eq("agency_id", nikeAgencyId);

  const savedIds = saved?.map(s => s.athlete_id) || [];

  // Get user details for saved athletes
  const { data: savedUsers } = await supabase
    .from("users")
    .select("id, first_name, last_name")
    .in("id", savedIds);

  console.log("\n=== Nike SAVED Athletes (Active Roster) ===");
  savedUsers?.forEach(u => {
    console.log(`- ${u.first_name} ${u.last_name} (${u.id})`);
  });

  // Get ALL matches for Nike
  const { data: allMatches } = await supabase
    .from("agency_athlete_matches")
    .select("athlete_id, match_score, tier")
    .eq("agency_id", nikeAgencyId);

  console.log("\n=== ALL Nike Matches (before filtering) ===");
  console.log(allMatches);

  // Get matches EXCLUDING saved athletes (simulating what the API does)
  let filteredMatches = allMatches || [];
  if (savedIds.length > 0) {
    filteredMatches = filteredMatches.filter(m => {
      const isSaved = savedIds.includes(m.athlete_id);
      return !isSaved;
    });
  }

  // Get user details for filtered matches
  const matchAthleteIds = filteredMatches.map(m => m.athlete_id);
  const { data: matchUsers } = await supabase
    .from("users")
    .select("id, first_name, last_name")
    .in("id", matchAthleteIds);

  console.log("\n=== Nike MATCHES (Live Updates - excludes saved) ===");
  filteredMatches.forEach(m => {
    const user = matchUsers?.find(u => u.id === m.athlete_id);
    console.log(`- ${user?.first_name || "Unknown"} ${user?.last_name || ""} (${m.athlete_id}) - Score: ${m.match_score}, Tier: ${m.tier}`);
  });

  // Check for overlap
  const overlap = allMatches?.filter(m => savedIds.includes(m.athlete_id)) || [];

  console.log("\n=== SUMMARY ===");
  console.log(`Saved athletes: ${savedIds.length}`);
  console.log(`Total matches: ${allMatches?.length || 0}`);
  console.log(`Filtered matches (excludes saved): ${filteredMatches.length}`);
  console.log(`OVERLAP (matches that are also saved): ${overlap.length} (should be 0 after filtering)`);

  if (filteredMatches.length > 0 && overlap.length === 0) {
    console.log("\n✅ SUCCESS: Live Match Updates will now show DIFFERENT athletes than Active Roster!");
  } else if (filteredMatches.length === 0) {
    console.log("\n⚠️ No matches to show in Live Updates widget (but no overlap either)");
  } else {
    console.log("\n❌ PROBLEM: There's still overlap between saved roster and matches");
  }
}

verifyNikeDashboard().catch(console.error);
