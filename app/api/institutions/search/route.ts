import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ institutions: [] });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    // Search institutions by name
    const { data: institutions, error } = await supabase
      .from('institutions')
      .select('id, name, state')
      .ilike('name', `%${query}%`)
      .limit(10);

    if (error) {
      console.error('Error searching institutions:', error);
      return NextResponse.json({ institutions: [] });
    }

    return NextResponse.json({ institutions: institutions || [] });
  } catch (error) {
    console.error('Institution search error:', error);
    return NextResponse.json({ institutions: [] });
  }
}
