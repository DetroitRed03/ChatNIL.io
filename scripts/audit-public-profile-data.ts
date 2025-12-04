import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

async function auditPublicProfileData() {
  console.log("🔍 Auditing Public Profile Data for Sarah Johnson...\n");

  // Get Sarah's user ID
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("email", "sarah.johnson@test.com")
    .single();

  if (!user) {
    console.log("❌ Sarah not found");
    return;
  }

  console.log("📋 USER TABLE DATA:");
  console.log("─".repeat(80));
  console.log(`ID: ${user.id}`);
  console.log(`Name: ${user.first_name} ${user.last_name}`);
  console.log(`Email: ${user.email}`);
  console.log(`Role: ${user.role}`);
  console.log(`School: ${user.school_name}`);
  console.log(`Major: ${user.major}`);
  console.log(`GPA: ${user.gpa}`);
  console.log(`Graduation Year: ${user.graduation_year}`);
  console.log(`Phone: ${user.phone}`);
  console.log(`Date of Birth: ${user.date_of_birth}`);
  console.log(`Profile Photo: ${user.profile_photo}`);
  console.log("");

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

  console.log("🏃 ATHLETE PROFILE TABLE DATA:");
  console.log("─".repeat(80));
  console.log(`Sport: ${athleteProfile.sport}`);
  console.log(`Position: ${athleteProfile.position}`);
  console.log(`School: ${athleteProfile.school}`);
  console.log(`Year: ${athleteProfile.year}`);
  console.log(`Height: ${athleteProfile.height_inches} inches (${Math.floor(athleteProfile.height_inches / 12)}'${athleteProfile.height_inches % 12}")`);
  console.log(`Weight: ${athleteProfile.weight_lbs} lbs`);
  console.log(`Jersey Number: #${athleteProfile.jersey_number}`);
  console.log(`Graduation Year: ${athleteProfile.graduation_year}`);
  console.log(`Major: ${athleteProfile.major}`);
  console.log(`GPA: ${athleteProfile.gpa}`);
  console.log(`Bio: ${athleteProfile.bio}`);
  console.log(`Profile Photo: ${athleteProfile.profile_photo_url}`);
  console.log(`Cover Photo: ${athleteProfile.cover_photo_url}`);
  console.log(`Estimated FMV: $${athleteProfile.estimated_fmv?.toLocaleString()}`);
  console.log(`Profile Completion: ${athleteProfile.profile_completion_score}%`);
  console.log(`Profile Tier: ${athleteProfile.profile_completion_tier}`);
  console.log("");
  console.log(`Achievements (${athleteProfile.achievements?.length || 0}):`);
  athleteProfile.achievements?.forEach((a: string, i: number) => {
    console.log(`  ${i + 1}. ${a}`);
  });
  console.log("");
  console.log(`Secondary Sports (${athleteProfile.secondary_sports?.length || 0}):`);
  athleteProfile.secondary_sports?.forEach((s: any) => {
    console.log(`  - ${s.sport} (${s.position})`);
  });
  console.log("");
  console.log(`NIL Interests (${athleteProfile.nil_interests?.length || 0}):`);
  console.log(`  ${athleteProfile.nil_interests?.join(", ")}`);
  console.log("");
  console.log(`NIL Goals (${athleteProfile.nil_goals?.length || 0}):`);
  athleteProfile.nil_goals?.forEach((g: string) => {
    console.log(`  - ${g}`);
  });
  console.log("");
  console.log(`Content Samples: ${athleteProfile.content_samples?.length || 0} items`);

  // Get social media stats
  const { data: socialStats } = await supabase
    .from("social_media_stats")
    .select("*")
    .eq("user_id", user.id);

  console.log("");
  console.log("📱 SOCIAL MEDIA STATS:");
  console.log("─".repeat(80));
  if (socialStats && socialStats.length > 0) {
    socialStats.forEach((stat) => {
      console.log(`${stat.platform.toUpperCase()}:`);
      console.log(`  Handle: ${stat.handle}`);
      console.log(`  Followers: ${stat.followers?.toLocaleString()}`);
      console.log(`  Engagement Rate: ${stat.engagement_rate}%`);
      console.log(`  Verified: ${stat.verified}`);
      console.log("");
    });
  } else {
    console.log("No social media stats found");
  }

  console.log("\n🔗 Public Profile URL: http://localhost:3000/profile/" + user.id);
  console.log("\n✅ All this data should be visible on the public profile page!");
}

auditPublicProfileData();
