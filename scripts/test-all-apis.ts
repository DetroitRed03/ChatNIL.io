async function testAPIs() {
  console.log('🔍 Testing All Feature APIs...\n');

  const userId = 'ca05429a-0f32-4280-8b71-99dc5baee0dc'; // Sarah's ID

  // 1. Campaign Discovery
  console.log('1️⃣ Campaign Discovery:');
  try {
    const res1 = await fetch(`http://localhost:3000/api/matchmaking/athlete/campaigns?userId=${userId}`);
    const data1 = await res1.json();
    if (data1.error) {
      console.log('   ❌', data1.error);
    } else {
      console.log('   ✅', data1.campaigns?.length || 0, 'campaigns found');
    }
  } catch (err: any) {
    console.log('   ❌', err.message);
  }
  console.log('');

  // 2. NIL Deal Tracking
  console.log('2️⃣ NIL Deal Tracking:');
  try {
    const res2 = await fetch(`http://localhost:3000/api/nil-deals?userId=${userId}`);
    const data2 = await res2.json();
    if (data2.error) {
      console.log('   ❌', data2.error);
    } else {
      console.log('   ✅', data2.deals?.length || 0, 'deals found');
    }
  } catch (err: any) {
    console.log('   ❌', err.message);
  }
  console.log('');

  // 3. Matchmaking System
  console.log('3️⃣ Matchmaking System:');
  try {
    const res3 = await fetch(`http://localhost:3000/api/matches?userId=${userId}`);
    const data3 = await res3.json();
    if (data3.error) {
      console.log('   ❌', data3.error);
    } else {
      console.log('   ✅', data3.matches?.length || 0, 'matches found');
    }
  } catch (err: any) {
    console.log('   ❌', err.message);
  }
  console.log('');

  // 4. Compliance Checking
  console.log('4️⃣ Compliance Checking:');
  try {
    const res4 = await fetch('http://localhost:3000/api/compliance/check?state=CA');
    const data4 = await res4.json();
    if (data4.error) {
      console.log('   ❌', data4.error);
    } else {
      console.log('   ✅ State:', data4.state_name);
      console.log('   ✅ NIL Allowed:', data4.allows_nil);
    }
  } catch (err: any) {
    console.log('   ❌', err.message);
  }

  console.log('\n🎉 API Testing Complete!');
}

testAPIs();
