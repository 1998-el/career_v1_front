import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { first_name, last_name, email, password, password_confirmation } = body;

    if (!first_name || !last_name || !email || !password || !password_confirmation) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password !== password_confirmation) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    const backendUrl = process.env.BACKEND_URL;

    const apiResponse = await fetch(`${backendUrl}/api/auth/register/step1`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ first_name, last_name, email, password, password_confirmation }),
    });

    console.log('=== Backend Response Details ===');
    console.log('Backend Status:', apiResponse.status, apiResponse.statusText);
    console.log('Backend URL:', `${backendUrl}/api/auth/register/step1`);
    console.log('Backend Headers:', Object.fromEntries(apiResponse.headers.entries()));

    if (!apiResponse.ok) {
      const text = await apiResponse.text();
      console.log('Backend Error Response Body:', text);
      try {
        const errorData = JSON.parse(text);
        console.error('Backend Error Data:', JSON.stringify(errorData, null, 2));
        return NextResponse.json(errorData, { status: apiResponse.status });
      } catch {
        console.error('Backend error response not JSON:', text);
        return NextResponse.json(
          { error: 'Backend returned an unexpected error format', details: text, status: apiResponse.status },
          { status: 500 }
        );
      }
    }

    const data = await apiResponse.json();
    console.log('Backend Success Response Body:', JSON.stringify(data, null, 2));
    return NextResponse.json(data, { status: apiResponse.status });

  } catch (error) {
    console.error('Registration step 1 error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

