import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  return createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      fetch: (url: any, opts: any) => fetch(url, { ...opts, cache: 'no-store' as any }),
    }
  }
);
}

export async function GET(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    console.log('📁 GET /api/portfolio - User ID:', userId);

    // Fetch athlete's content_samples from athlete_profiles
    const { data: profile, error } = await supabaseAdmin
      .from('athlete_profiles')
      .select('content_samples')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('❌ Error fetching portfolio:', error);
      return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 });
    }

    console.log('✅ Portfolio fetched successfully');
    return NextResponse.json({
      items: profile?.content_samples || []
    });
  } catch (error: any) {
    console.error('💥 Portfolio GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    const body = await request.json();
    const { userId, item } = body;

    if (!userId || !item) {
      return NextResponse.json({ error: 'userId and item are required' }, { status: 400 });
    }

    console.log('➕ POST /api/portfolio - Adding item for user:', userId);

    // Fetch current content_samples from athlete_profiles
    const { data: profile, error: fetchError } = await supabaseAdmin
      .from('athlete_profiles')
      .select('content_samples')
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching profile:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    // Add new item with enhanced fields
    const currentItems = profile?.content_samples || [];
    const newItem = {
      ...item,
      id: crypto.randomUUID(),
      display_order: currentItems.length, // Add to end
      is_featured: item.is_featured || false,
      is_public: item.is_public !== undefined ? item.is_public : true,
      created_at: new Date().toISOString()
    };
    const updatedItems = [...currentItems, newItem];

    // Update content_samples in athlete_profiles
    const { error: updateError } = await supabaseAdmin
      .from('athlete_profiles')
      .update({ content_samples: updatedItems })
      .eq('user_id', userId);

    if (updateError) {
      console.error('❌ Error updating portfolio:', updateError);
      return NextResponse.json({ error: 'Failed to add portfolio item' }, { status: 500 });
    }

    console.log('✅ Portfolio item added successfully');
    return NextResponse.json({
      item: newItem,
      items: updatedItems
    });
  } catch (error: any) {
    console.error('💥 Portfolio POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    const body = await request.json();
    const { userId, itemId, updates } = body;

    if (!userId || !itemId || !updates) {
      return NextResponse.json({ error: 'userId, itemId, and updates are required' }, { status: 400 });
    }

    console.log('✏️ PUT /api/portfolio - Updating item:', itemId);

    // Fetch current content_samples from athlete_profiles
    const { data: profile, error: fetchError } = await supabaseAdmin
      .from('athlete_profiles')
      .select('content_samples')
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching profile:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    // Update item
    const currentItems = profile?.content_samples || [];
    const itemIndex = currentItems.findIndex((item: any) => item.id === itemId);

    if (itemIndex === -1) {
      return NextResponse.json({ error: 'Portfolio item not found' }, { status: 404 });
    }

    const updatedItems = [...currentItems];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };

    // Update content_samples in athlete_profiles
    const { error: updateError } = await supabaseAdmin
      .from('athlete_profiles')
      .update({ content_samples: updatedItems })
      .eq('user_id', userId);

    if (updateError) {
      console.error('❌ Error updating portfolio:', updateError);
      return NextResponse.json({ error: 'Failed to update portfolio item' }, { status: 500 });
    }

    console.log('✅ Portfolio item updated successfully');
    return NextResponse.json({
      item: updatedItems[itemIndex],
      items: updatedItems
    });
  } catch (error: any) {
    console.error('💥 Portfolio PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const itemId = searchParams.get('itemId');

    if (!userId || !itemId) {
      return NextResponse.json({ error: 'userId and itemId are required' }, { status: 400 });
    }

    console.log('🗑️ DELETE /api/portfolio - Removing item:', itemId);

    // Fetch current content_samples from athlete_profiles
    const { data: profile, error: fetchError } = await supabaseAdmin
      .from('athlete_profiles')
      .select('content_samples')
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching profile:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    // Remove item and reorder
    const currentItems = profile?.content_samples || [];
    const updatedItems = currentItems
      .filter((item: any) => item.id !== itemId)
      .map((item: any, index: number) => ({
        ...item,
        display_order: index // Reindex after deletion
      }));

    if (currentItems.length === updatedItems.length) {
      return NextResponse.json({ error: 'Portfolio item not found' }, { status: 404 });
    }

    // Update content_samples in athlete_profiles
    const { error: updateError } = await supabaseAdmin
      .from('athlete_profiles')
      .update({ content_samples: updatedItems })
      .eq('user_id', userId);

    if (updateError) {
      console.error('❌ Error deleting portfolio item:', updateError);
      return NextResponse.json({ error: 'Failed to delete portfolio item' }, { status: 500 });
    }

    console.log('✅ Portfolio item deleted successfully');
    return NextResponse.json({
      success: true,
      items: updatedItems
    });
  } catch (error: any) {
    console.error('💥 Portfolio DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    const body = await request.json();
    const { userId, items } = body;

    if (!userId || !items) {
      return NextResponse.json({ error: 'userId and items are required' }, { status: 400 });
    }

    console.log('🔄 PATCH /api/portfolio - Reordering items for user:', userId);

    // Update items with new order
    const reorderedItems = items.map((item: any, index: number) => ({
      ...item,
      display_order: index
    }));

    // Update content_samples in athlete_profiles
    const { error: updateError } = await supabaseAdmin
      .from('athlete_profiles')
      .update({ content_samples: reorderedItems })
      .eq('user_id', userId);

    if (updateError) {
      console.error('❌ Error reordering portfolio:', updateError);
      return NextResponse.json({ error: 'Failed to reorder portfolio items' }, { status: 500 });
    }

    console.log('✅ Portfolio items reordered successfully');
    return NextResponse.json({
      success: true,
      items: reorderedItems
    });
  } catch (error: any) {
    console.error('💥 Portfolio PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
