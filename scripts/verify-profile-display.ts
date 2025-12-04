import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

async function verifyProfileDisplay() {
  console.log("🔍 Verifying profile display data...\n");

  // Get Sarah's user ID
  const { data: user } = await supabase
    .from("users")
    .select("id, email, first_name, last_name")
    .eq("email", "sarah.johnson@test.com")
    .single();

  if (!user) {
    console.log("❌ Sarah not found");
    return;
  }

  console.log("✅ Found user:", user);
  console.log("\n📊 Checking athlete profile data...\n");

  // Get athlete profile
  const { data: athleteProfile } = await supabase
    .from("athlete_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!athleteProfile) {
    console.log("❌ No athlete profile found");
    return;
  }

  // Check critical fields
  const criticalFields = {
    "Height (inches)": athleteProfile.height_inches,
    "Weight (lbs)": athleteProfile.weight_lbs,
    "Jersey Number": athleteProfile.jersey_number,
    "Sport": athleteProfile.sport,
    "Position": athleteProfile.position,
    "School": athleteProfile.school,
    "Graduation Year": athleteProfile.graduation_year,
    "Major": athleteProfile.major,
    "GPA": athleteProfile.gpa,
    "Bio": athleteProfile.bio,
    "Achievements": athleteProfile.achievements?.length || 0,
    "Profile Photo": athleteProfile.profile_photo_url ? "✓" : "✗",
    "Cover Photo": athleteProfile.cover_photo_url ? "✓" : "✗",
  };

  console.log("📋 Critical Profile Fields:");
  console.log("─".repeat(50));

  let missingCount = 0;
  for (const [field, value] of Object.entries(criticalFields)) {
    const status = value ? "✅" : "❌";
    console.log(`${status} ${field}: ${value || "MISSING"}`);
    if (!value) missingCount++;
  }

  console.log("─".repeat(50));
  console.log(`\n📊 Summary: ${Object.keys(criticalFields).length - missingCount}/${Object.keys(criticalFields).length} fields populated\n`);

  if (missingCount > 0) {
    console.log("⚠️  Some fields are missing. These should be populated during onboarding.");
  } else {
    console.log("✅ All critical fields are populated!");
  }

  // Test the profile URL
  console.log(`\n🔗 Profile URL: /profile/${user.id}`);
  console.log("\nThe profile page should now display:");
  console.log(`  - Height: ${Math.floor(athleteProfile.height_inches / 12)}'${athleteProfile.height_inches % 12}"`);
  console.log(`  - Weight: ${athleteProfile.weight_lbs} lbs`);
  console.log(`  - Jersey: #${athleteProfile.jersey_number}`);
}

verifyProfileDisplay();
