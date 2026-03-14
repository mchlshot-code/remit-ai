import { NextResponse } from 'next/server';
import { createAlert } from '../../../modules/alerts/alert-service';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const userId = "stub-user-id"; // Retrieve securely

        const alert = await createAlert(userId, body);

        return NextResponse.json({ success: true, alert });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
