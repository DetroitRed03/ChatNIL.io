import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

async function checkAthleteProfile() {
  console.log("🔍 Checking athlete_profiles table...\n");

  // Check athlete_profiles table
  const { data: profiles, error } = await supabase
    .from("athlete_profiles")
    .select("*")
    .limit(1);

  if (error) {
    console.log("❌ Error:", error.message);
    return;
  }

  if (profiles && profiles.length > 0) {
    console.log("✅ athlete_profiles columns:", Object.keys(profiles[0]).sort());
    console.log("\n📊 Sample data:");
    console.log(JSON.stringify(profiles[0], null, 2));
  } else {
    console.log("⚠️  No data in athlete_profiles table");
  }

  // Also check if Sarah Johnson has an athlete profile
  console.log("\n\n🔍 Looking for Sarah Johnson's profile...\n");

  // First get Sarah's user ID
  const { data: users } = await supabase
    .from("users")
    .select("id, email, first_name, last_name")
    .eq("email", "sarah.johnson@university.edu")
    .single();

  if (users) {
    console.log("✅ Found user:", users);

    const { data: athleteProfile } = await supabase
      .from("athlete_profiles")
      .select("*")
      .eq("user_id", users.id)
      .single();

    if (athleteProfile) {
      console.log("\n✅ Found athlete profile:");
      console.log(JSON.stringify(athleteProfile, null, 2));
    } else {
      console.log("\n❌ No athlete profile found for Sarah");
    }
  }
}

checkAthleteProfile();
