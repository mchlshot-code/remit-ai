import { NextResponse } from 'next/server';
import { createAlert } from '../../../modules/alerts/alert-service';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const userId = "stub-user-id"; // Retrieve securely

        const alert = await createAlert(userId, body);

        return NextResponse.json({ success: true, alert });
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
    }
}
