import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL;

    const apiResponse = await fetch(`${backendUrl}/api/user`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    if (!apiResponse.ok) {
      const text = await apiResponse.text();
      try {
        const errorData = JSON.parse(text);
        return NextResponse.json(errorData, { status: apiResponse.status });
      } catch {
        console.error('Backend error response not JSON:', text);
        return NextResponse.json(
          { error: text, status: apiResponse.status },
          { status: apiResponse.status }
        );
      }
    }

    const data = await apiResponse.json();
    return NextResponse.json(data, { status: apiResponse.status });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}