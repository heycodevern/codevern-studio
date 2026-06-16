import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';


const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { email, password, role, businessName, ownerId } = await req.json();

    // 1. Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // 2. Insert into profiles table
    if (authData.user) {
      await supabaseAdmin
        .from('profiles')
        .insert({
          id: authData.user.id,
          business_name: businessName,
          niche: 'Staff',
          timezone: 'UTC',
          role: role,
          owner_id: ownerId
        });
    }

    return NextResponse.json({ success: true, user: authData.user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
