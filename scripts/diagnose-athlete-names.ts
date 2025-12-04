import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
  console.log("=== DIAGNOSTIC: Athlete Names ===\n");

  // Check Sarah Johnson specifically
  console.log("1. Sarah Johnson data:");
  const { data: sarah, error: sarahError } = await supabase
    .from("users")
    .select("id, email, first_name, last_name, role")
    .eq("id", "ca05429a-0f32-4280-8b71-99dc5baee0dc")
    .single();
  
  if (sarahError) console.log("   Error:", sarahError.message);
  else console.log("  ", JSON.stringify(sarah, null, 2));

  // Check athletes with missing names
  console.log("\n2. All athletes and their name data:");
  const { data: athletes, error: athletesError } = await supabase
    .from("users")
    .select("id, email, first_name, last_name, role")
    .eq("role", "athlete")
    .limit(10);
  
  if (athletesError) console.log("   Error:", athletesError.message);
  else {
    console.log("   Found", athletes?.length || 0, "athletes");
    athletes?.forEach(a => console.log("  ", a.email?.slice(0,25), "| first:", a.first_name || "(NULL)", "| last:", a.last_name || "(NULL)"));
  }

  // Check athlete_public_profiles display_name status
  console.log("\n3. Athlete public profiles display_name:");
  const { data: profiles, error: profilesError } = await supabase
    .from("athlete_public_profiles")
    .select("user_id, display_name")
    .limit(10);
  
  if (profilesError) console.log("   Error:", profilesError.message);
  else {
    console.log("   Found", profiles?.length || 0, "profiles");
    profiles?.forEach(p => console.log("  ", p.user_id?.slice(0,8), "|", p.display_name || "(NULL)"));
  }

  // Check agency_athlete_matches
  console.log("\n4. Athletes in agency_athlete_matches:");
  const { data: matches, error: matchesError } = await supabase
    .from("agency_athlete_matches")
    .select("athlete_id, agency_id, match_score")
    .limit(5);
  
  if (matchesError) console.log("   Error:", matchesError.message);
  else {
    console.log("   Found", matches?.length || 0, "matches");
    if (matches && matches.length > 0) {
      for (const match of matches) {
        const { data: user } = await supabase
          .from("users")
          .select("first_name, last_name, email")
          .eq("id", match.athlete_id)
          .single();
        console.log("   Match:", match.athlete_id?.slice(0,8), "| Score:", match.match_score, "| Name:", user?.first_name, user?.last_name);
      }
    }
  }
}

diagnose().catch(console.error);
