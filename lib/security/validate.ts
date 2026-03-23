import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Standard API validation wrapper
 * Ensures requests match a Zod schema and returns unified error responses
 */
export async function validateRequest<T>(
    req: NextRequest, 
    schema: z.ZodType<T>
): Promise<{ data?: T; error?: NextResponse }> {
    try {
        const body = await req.json();
        const data = schema.parse(body);
        return { data };
    } catch (e) {
        if (e instanceof z.ZodError) {
            return {
                error: NextResponse.json(
                    { error: 'Validation failed', details: e.issues },
                    { status: 400 }
                )
            };
        }
        return {
            error: NextResponse.json(
                { error: 'Invalid request body' },
                { status: 400 }
            )
        };
    }
}
