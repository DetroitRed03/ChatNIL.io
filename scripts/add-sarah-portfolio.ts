import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function addPortfolio() {
  console.log('🎨 Adding sample portfolio for Sarah Johnson...\n');

  // Sample portfolio items
  const portfolioItems = [
    {
      id: crypto.randomUUID(),
      type: 'image',
      url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211',
      thumbnailUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400',
      description: 'Game-winning shot against rival team',
      sponsored: false,
      metrics: {
        views: 15420,
        likes: 3245,
        comments: 189
      },
      is_featured: true,
      is_public: true,
      display_order: 0,
      created_at: new Date('2024-01-15').toISOString()
    },
    {
      id: crypto.randomUUID(),
      type: 'video',
      url: 'https://images.unsplash.com/photo-1519861531473-9200262188bf',
      thumbnailUrl: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=400',
      description: 'Training highlights - Speed and agility work',
      sponsored: false,
      metrics: {
        views: 8732,
        likes: 1876,
        comments: 94
      },
      is_featured: false,
      is_public: true,
      display_order: 1,
      created_at: new Date('2024-01-20').toISOString()
    },
    {
      id: crypto.randomUUID(),
      type: 'reel',
      url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b',
      thumbnailUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400',
      description: 'Partnership with Nike - New basketball shoes showcase',
      sponsored: true,
      brand: 'Nike',
      metrics: {
        views: 32540,
        likes: 7821,
        comments: 412
      },
      is_featured: true,
      is_public: true,
      display_order: 2,
      created_at: new Date('2024-02-01').toISOString()
    },
    {
      id: crypto.randomUUID(),
      type: 'image',
      url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc',
      thumbnailUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400',
      description: 'Championship celebration with team',
      sponsored: false,
      metrics: {
        views: 21340,
        likes: 5432,
        comments: 287
      },
      is_featured: false,
      is_public: true,
      display_order: 3,
      created_at: new Date('2024-02-15').toISOString()
    },
    {
      id: crypto.randomUUID(),
      type: 'reel',
      url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018',
      thumbnailUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400',
      description: 'Gatorade partnership - Recovery routine',
      sponsored: true,
      brand: 'Gatorade',
      metrics: {
        views: 28910,
        likes: 6234,
        comments: 321
      },
      is_featured: false,
      is_public: true,
      display_order: 4,
      created_at: new Date('2024-03-01').toISOString()
    },
    {
      id: crypto.randomUUID(),
      type: 'story',
      url: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e',
      thumbnailUrl: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=400',
      description: 'Behind the scenes - Tournament day prep',
      sponsored: false,
      metrics: {
        views: 12450,
        likes: 2890,
        comments: 156
      },
      is_featured: false,
      is_public: true,
      display_order: 5,
      created_at: new Date('2024-03-10').toISOString()
    }
  ];

  // Update Sarah's profile
  const { error } = await supabase
    .from('athlete_profiles')
    .update({ content_samples: portfolioItems })
    .eq('username', 'sarah-johnson');

  if (error) {
    console.error('❌ Error adding portfolio:', error.message);
    return;
  }

  console.log(`✅ Added ${portfolioItems.length} portfolio items to Sarah Johnson's profile`);
  console.log('\n📊 Portfolio breakdown:');
  console.log(`   - ${portfolioItems.filter(i => i.is_featured).length} featured items`);
  console.log(`   - ${portfolioItems.filter(i => i.sponsored).length} sponsored posts`);
  console.log(`   - ${portfolioItems.filter(i => i.type === 'image').length} photos`);
  console.log(`   - ${portfolioItems.filter(i => i.type === 'video').length} videos`);
  console.log(`   - ${portfolioItems.filter(i => i.type === 'reel').length} reels`);
  console.log(`   - ${portfolioItems.filter(i => i.type === 'story').length} stories`);
  console.log('\n🌐 View at: http://localhost:3000/athletes/sarah-johnson');
}

addPortfolio();
