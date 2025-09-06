import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, birth_date } = body;

    if (!user_id || !birth_date) {
      return NextResponse.json(
        { error: 'User ID and birth date are required' },
        { status: 400 }
      );
    }

    const backendUrl = process.env.BACKEND_URL;

    const cookies = request.cookies;
    const cookieHeader = cookies.getAll().map(cookie => `${cookie.name}=${cookie.value}`).join('; ');

    const apiResponse = await fetch(`${backendUrl}/api/auth/register/step3/complete-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cookie': cookieHeader,
      },
      body: JSON.stringify(body),
    });

    if (!apiResponse.ok) {
      const text = await apiResponse.text();
      try {
        const errorData = JSON.parse(text);
        return NextResponse.json(errorData, { status: apiResponse.status });
      } catch {
        console.error('Backend error response not JSON:', text);
        return NextResponse.json(
          { error: 'Backend returned an unexpected error format', status: apiResponse.status },
          { status: 500 }
        );
      }
    }

    const data = await apiResponse.json();

    const response = NextResponse.json(data, { status: apiResponse.status });

    const backendCookies = apiResponse.headers.get('set-cookie');
    if (backendCookies) {
      const cookieArray = backendCookies.split(',');
      cookieArray.forEach(cookie => {
        const [nameValue] = cookie.split(';');
        const [name, value] = nameValue.split('=');
        if (name && value) {
          response.cookies.set(name.trim(), value.trim(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
          });
        }
      });
    }

    return response;

  } catch (error) {
    console.error('Profile completion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
