import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getPaymentSettings } from '@/lib/data.actions';
import { getGoogleAccessToken } from '@/lib/actions/payment';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        
        // Google Cloud Pub/Sub sends data in body.message.data (base64 encoded)
        if (!body || !body.message || !body.message.data) {
            return NextResponse.json({ error: 'Invalid Pub/Sub message format' }, { status: 400 });
        }

        const encodedData = body.message.data;
        const decodedData = Buffer.from(encodedData, 'base64').toString('utf8');
        const rtdnData = JSON.parse(decodedData);

        if (!rtdnData.subscriptionNotification) {
            // Not a subscription notification (could be a test notification)
            return NextResponse.json({ success: true, message: 'Ignored non-subscription event' });
        }

        const notification = rtdnData.subscriptionNotification;
        const notificationType = notification.notificationType;
        const purchaseToken = notification.purchaseToken;
        const subscriptionId = notification.subscriptionId;

        // notificationType 2 = SUBSCRIPTION_RENEWED
        // notificationType 4 = SUBSCRIPTION_PURCHASED
        // notificationType 7 = SUBSCRIPTION_RESTARTED
        
        if (!purchaseToken) {
            return NextResponse.json({ success: true, message: 'No purchase token' });
        }

        const db = await getDb();
        
        // Find the user who owns this purchaseToken (sessionId)
        const existingTx = await db.collection('purchases').findOne({ sessionId: purchaseToken });
        if (!existingTx || !existingTx.userId) {
            // We don't have this token in our DB. Ignore or handle later.
            return NextResponse.json({ success: true, message: 'Purchase token not found in database' });
        }

        const userId = existingTx.userId;

        // Only process renewals or restarts
        if (notificationType === 2 || notificationType === 7) {
            const paySettings = await getPaymentSettings() as any;
            if (!paySettings) return NextResponse.json({ success: false });

            // We need to fetch the new expiry date from Google
            const packageName = rtdnData.packageName || paySettings.googlePlayPackageName;
            const email = paySettings.googlePlayServiceAccountEmail;
            const privateKey = paySettings.googlePlayServiceAccountPrivateKey;

            if (packageName && email && privateKey) {
                // Import the internal auth function
                const token = await getGoogleAccessToken(email, privateKey);
                
                const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/subscriptions/${subscriptionId}/tokens/${purchaseToken}`;
                const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
                
                if (res.ok) {
                    const data = await res.json();
                    // paymentState 1 = Payment received
                    // paymentState 2 = Free trial
                    if ((data.paymentState === 1 || data.paymentState === 2) && data.expiryTimeMillis) {
                        const newExpiry = new Date(parseInt(data.expiryTimeMillis));
                        await db.collection('users').updateOne(
                            { _id: userId as any },
                            { $set: { isVip: true, vipExpiry: newExpiry } }
                        );
                    }
                }
            }
        } else if (notificationType === 3) {
            // SUBSCRIPTION_CANCELED (doesn't mean expired, just won't renew, they still have access until expiryTimeMillis)
        } else if (notificationType === 12 || notificationType === 13) {
            // SUBSCRIPTION_REVOKED or EXPIRED
            await db.collection('users').updateOne(
                { _id: userId as any },
                { $set: { isVip: false } }
            );
        }

        // Always return 200 OK so Google Pub/Sub doesn't retry
        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('RTDN Webhook Error:', error);
        // Return 200 even on error to prevent Pub/Sub from spamming if it's a code issue,
        // or return 500 if you want retries. 200 is safer for unhandled edge cases.
        return NextResponse.json({ success: false, error: error.message }, { status: 200 });
    }
}
