import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { verifyAndExecutePurchaseAction } from '@/lib/actions';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const apiKey = request.headers.get('x-api-key') || request.nextUrl.searchParams.get('apiKey');
        if (!apiKey) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = await getDb();
        const mobileSetting = await db.collection('settings').findOne({ _id: 'mobile' as any });
        if (!mobileSetting || !mobileSetting.apiKey || mobileSetting.apiKey !== apiKey) {
            return NextResponse.json({ error: 'Unauthorized - Invalid API Key' }, { status: 401 });
        }

        // Verify Firebase ID Token for security
        const authorization = request.headers.get('authorization') || '';
        if (!authorization.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized - Missing Bearer Token' }, { status: 401 });
        }
        const idToken = authorization.slice(7).trim();
        const generalSettings = await db.collection('settings').findOne({ _id: 'general' as any });
        const firebaseApiKey = generalSettings?.firebaseApiKey || '';
        
        const lookupResponse = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(firebaseApiKey)}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken }),
                cache: 'no-store',
            }
        );
        
        if (!lookupResponse.ok) {
            return NextResponse.json({ error: 'Unauthorized - Invalid Bearer Token' }, { status: 401 });
        }
        
        const lookupData = await lookupResponse.json();
        const verifiedUid = lookupData?.users?.[0]?.localId;

        const body = await request.json();
        const { userId, packId, gateway, sessionId } = body;

        if (!userId || !packId || !gateway || !sessionId) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }
        
        if (verifiedUid !== userId) {
            return NextResponse.json({ error: 'Unauthorized - UID mismatch' }, { status: 403 });
        }

        const result = await verifyAndExecutePurchaseAction(userId, packId, gateway, sessionId);

        if (result.success) {
            return NextResponse.json({ success: true, message: result.message || 'Purchase verified and awarded' });
        } else {
            return NextResponse.json({ success: false, error: result.error || 'Verification failed' }, { status: 400 });
        }
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
