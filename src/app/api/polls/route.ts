import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { createPollSchema } from '@/lib/validations/poll-schema';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
    
    // Get the current user
    const { data, error: authError } = await supabase.auth.getUser();
    
    console.log('Auth data:', data);
    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'Authentication error: ' + authError.message },
        { status: 401 }
      );
    }
    
    if (!data.user) {
      console.error('No user found in session');
      return NextResponse.json(
        { error: 'You must be logged in to create a poll' },
        { status: 401 }
      );
    }
    
    // Parse and validate the request body
    const body = await request.json();
    const validationResult = createPollSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid poll data', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const { title, options, end_date } = validationResult.data;
    
    // Create the poll
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert({
        title,
        created_by: data.user.id,
        end_date: end_date || null,
      })
      .select()
      .single();
    
    if (pollError) {
      console.error('Error creating poll:', pollError);
      return NextResponse.json(
        { error: 'Failed to create poll' },
        { status: 500 }
      );
    }
    
    // Create poll options
    const pollOptionsData = options.map((option, index) => ({
      poll_id: poll.id,
      text: option,
      position: index,
    }));
    
    const { data: createdOptions, error: optionsError } = await supabase
      .from('poll_options')
      .insert(pollOptionsData)
      .select();
    
    if (optionsError) {
      console.error('Error creating poll options:', optionsError);
      return NextResponse.json(
        { error: 'Failed to create poll options' },
        { status: 500 }
      );
    }
    
    // Create analytics entry
    await supabase
      .from('poll_analytics')
      .insert({
        poll_id: poll.id,
        views: 0,
        shares: 0,
      });
    
    return NextResponse.json({
      poll: {
        ...poll,
        options: createdOptions,
      },
    });
  } catch (error) {
    console.error('Error in poll creation:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    );
    
    const { data: polls, error } = await supabase
      .from('polls')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching polls:', error);
      return NextResponse.json(
        { error: 'Failed to fetch polls' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ polls });
  } catch (error) {
    console.error('Error fetching polls:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}