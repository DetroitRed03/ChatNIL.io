import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testNotificationFlow() {
  // Nike's user ID from agencies table (confirmed)
  const NIKE_USER_ID = '3f270e9b-cc2b-48a0-b82e-52fdf1094879';

  console.log('=== TESTING NOTIFICATION FLOW ===\n');

  // 1. Create a test notification for Nike
  const { data: notif, error: notifError } = await supabase
    .from('notifications')
    .insert({
      user_id: NIKE_USER_ID,
      type: 'invite_accepted',
      title: 'Invite Accepted!',
      message: 'Verrell Brice Jr. has accepted your invite to Nike Basketball Showcase',
      data: {
        campaign_id: 'test-123',
        campaign_name: 'Nike Basketball Showcase',
        athlete_id: 'ca05429a-0f32-4280-8b71-99dc5baee0dc',
        athlete_name: 'Verrell Brice Jr.'
      },
      read: false
    })
    .select()
    .single();

  if (notifError) {
    console.log('❌ Failed to create notification:', notifError.message);
  } else {
    console.log('✅ Notification created successfully!');
    console.log('  ID:', notif.id);
    console.log('  Title:', notif.title);
    console.log('  Message:', notif.message);
  }

  // 2. List all notifications for Nike
  const { data: allNotifs } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', NIKE_USER_ID)
    .order('created_at', { ascending: false });

  console.log('\n=== NIKE NOTIFICATIONS ===');
  console.log('Total:', allNotifs?.length || 0);
  allNotifs?.forEach(n => {
    console.log('- [' + (n.read ? 'READ' : 'UNREAD') + ']', n.title, '|', n.created_at);
  });
}

testNotificationFlow().catch(console.error);
