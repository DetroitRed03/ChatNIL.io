import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function findAvailableAthleteAndCreateMatch() {
  const nikeAgencyId = "3f270e9b-cc2b-48a0-b82e-52fdf1094879";

  // Get Nike's saved athlete IDs
  const { data: saved } = await supabase
    .from("agency_athlete_lists")
    .select("athlete_id")
    .eq("agency_id", nikeAgencyId);

  const savedIds = saved?.map(s => s.athlete_id) || [];
  console.log("Nike saved athlete IDs:", savedIds);

  // Get all athletes from public.users
  const { data: allAthletes } = await supabase
    .from("users")
    .select("id, email, first_name, last_name, role")
    .eq("role", "athlete");

  console.log("\n=== All athletes in public.users ===");
  allAthletes?.forEach(a => console.log(`- ${a.id}: ${a.first_name} ${a.last_name} (${a.email})`));

  // Get auth users to check FK constraint
  const { data: authUsers } = await supabase.auth.admin.listUsers();

  // Find athletes that:
  // 1. Are in auth.users (FK requirement)
  // 2. Are NOT in Nike's saved roster
  console.log("\n=== Athletes available for match (in auth.users, NOT saved) ===");
  const availableForMatch = allAthletes?.filter(athlete => {
    const inAuth = authUsers?.users?.find(u => u.id === athlete.id);
    const isSaved = savedIds.includes(athlete.id);
    const isAvailable = inAuth && !isSaved;
    if (isAvailable) {
      console.log(`✅ ${athlete.id}: ${athlete.first_name} ${athlete.last_name} (${athlete.email})`);
    }
    return isAvailable;
  });

  if (availableForMatch && availableForMatch.length > 0) {
    console.log("\n=== Using first available athlete for match ===");
    const athlete = availableForMatch[0];
    console.log(`Selected: ${athlete.first_name} ${athlete.last_name} (${athlete.id})`);

    // Insert match
    const { data: insertResult, error: insertErr } = await supabase
      .from("agency_athlete_matches")
      .insert({
        agency_id: nikeAgencyId,
        athlete_id: athlete.id,
        match_score: 85,
        tier: "high",
        status: "suggested",
        match_reasons: ["Strong social media presence", "Target demographic alignment", "Regional market fit"],
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select();

    console.log("\nInsert result:", insertResult);
    if (insertErr) {
      console.log("Insert error:", insertErr);
    }

    // Verify
    const { data: nikeMatches } = await supabase
      .from("agency_athlete_matches")
      .select("*")
      .eq("agency_id", nikeAgencyId);

    console.log("\n=== Nike matches after insert ===");
    console.log(JSON.stringify(nikeMatches, null, 2));
  } else {
    console.log("\n❌ No available athletes found that are in auth.users but NOT saved");
    console.log("\nWe need to either:");
    console.log("1. Create a new athlete in auth.users");
    console.log("2. Use the test.athlete@example.com user (b63b82c5-8551-40e4-ba3c-c3223932e0ad)");

    // Check if test.athlete exists and isn't saved
    const testAthleteId = "b63b82c5-8551-40e4-ba3c-c3223932e0ad";
    const testInAuth = authUsers?.users?.find(u => u.id === testAthleteId);
    const testIsSaved = savedIds.includes(testAthleteId);

    console.log(`\ntest.athlete in auth.users: ${testInAuth ? "YES" : "NO"}`);
    console.log(`test.athlete is saved: ${testIsSaved ? "YES" : "NO"}`);

    if (testInAuth && !testIsSaved) {
      console.log("\n✅ Using test.athlete for match...");
      const { data: insertResult, error: insertErr } = await supabase
        .from("agency_athlete_matches")
        .insert({
          agency_id: nikeAgencyId,
          athlete_id: testAthleteId,
          match_score: 78,
          tier: "high",
          status: "suggested",
          match_reasons: ["Active test account", "Good engagement metrics", "Regional fit"],
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select();

      console.log("\nInsert result:", insertResult);
      if (insertErr) {
        console.log("Insert error:", insertErr);
      }

      // Verify
      const { data: nikeMatches } = await supabase
        .from("agency_athlete_matches")
        .select("*")
        .eq("agency_id", nikeAgencyId);

      console.log("\n=== Nike matches after insert ===");
      console.log(JSON.stringify(nikeMatches, null, 2));
    }
  }
}

findAvailableAthleteAndCreateMatch().catch(console.error);
