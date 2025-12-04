import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

async function checkAllProfiles() {
  console.log("🔍 Checking all athlete profiles...\n");

  const { data: profiles } = await supabase
    .from("athlete_profiles")
    .select("user_id, sport, position, height_inches, weight_lbs, jersey_number");

  console.log(`Found ${profiles?.length || 0} athlete profiles\n`);

  if (!profiles || profiles.length === 0) {
    console.log("❌ No profiles found");
    return;
  }

  let missingData = 0;
  profiles.forEach((p, i) => {
    const missing = [];
    if (!p.height_inches) missing.push("height");
    if (!p.weight_lbs) missing.push("weight");
    if (p.jersey_number === null || p.jersey_number === undefined) missing.push("jersey");

    if (missing.length > 0) {
      console.log(`⚠️  Profile ${i + 1} (${p.sport} - ${p.position}): Missing ${missing.join(", ")}`);
      missingData++;
    } else {
      console.log(`✅ Profile ${i + 1} (${p.sport} - ${p.position}): Complete`);
    }
  });

  if (missingData === 0) {
    console.log("\n✅ All profiles have height, weight, and jersey number!");
  } else {
    console.log(`\n⚠️  ${missingData}/${profiles.length} profiles are missing some data`);
  }
}

checkAllProfiles();
