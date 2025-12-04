import { getUpcomingEvents } from '../lib/dashboard-data';

async function testEvents() {
  const events = await getUpcomingEvents('ca05429a-0f32-4280-8b71-99dc5baee0dc');
  
  console.log('\nUpcoming Events for Sarah:');
  console.log(JSON.stringify(events, null, 2));
  console.log(`\nTotal events: ${events.length}`);
}

testEvents();
