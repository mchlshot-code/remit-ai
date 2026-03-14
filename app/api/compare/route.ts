import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        await request.json(); // Stub: Compare rates algorithm payload
        return NextResponse.json({ success: true, comparison: [] });
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
    }
}
