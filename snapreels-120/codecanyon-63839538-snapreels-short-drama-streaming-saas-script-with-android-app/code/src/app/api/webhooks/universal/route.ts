import { NextRequest, NextResponse } from 'next/server';
import { verifyAndExecutePurchaseAction } from '@/lib/actions/payment';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const forceGateway = url.searchParams.get('gateway');
        
        let body: any = {};
        const contentType = request.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
            body = await request.json();
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
            const text = await request.text();
            const searchParams = new URLSearchParams(text);
            body = Object.fromEntries(searchParams.entries());
        }

        let gateway = forceGateway;
        let userId = '';
        let packId = '';
        let sessionId = '';

        // 1. STRIPE
        if (body.type?.startsWith('checkout.session.')) {
            gateway = 'stripe';
            sessionId = body.data?.object?.id;
            userId = body.data?.object?.client_reference_id || body.data?.object?.metadata?.userId;
            packId = body.data?.object?.metadata?.packId;
        }
        // 2. PAYPAL
        else if (body.resource_type === 'checkout-order') {
            gateway = 'paypal';
            sessionId = body.resource?.id;
            try {
                const custom = JSON.parse(body.resource?.purchase_units?.[0]?.custom_id || '{}');
                userId = custom.userId;
                packId = custom.packId;
            } catch {}
        }
        // 3. RAZORPAY
        else if (body.event?.startsWith('payment_link.') || body.event?.startsWith('order.')) {
            gateway = 'razorpay';
            const entity = body.payload?.payment_link?.entity || body.payload?.order?.entity;
            sessionId = entity?.id;
            userId = entity?.notes?.userId;
            packId = entity?.notes?.packId;
        }
        // 4. FLUTTERWAVE
        else if (body.event === 'charge.completed' || body.txRef || body.tx_ref) {
            gateway = 'flutterwave';
            sessionId = body.data?.tx_ref || body.txRef || body.tx_ref;
            userId = body.data?.meta?.userId;
            packId = body.data?.meta?.packId;
        }
        // 5. CASHFREE
        else if (body.data?.order?.order_id) {
            gateway = 'cashfree';
            sessionId = body.data.order.order_id;
            userId = body.data.order.order_tags?.userId;
            packId = body.data.order.order_tags?.packId;
        }
        // 6. PAYU
        else if (body.txnid && body.udf1) {
            gateway = 'payu';
            sessionId = body.txnid;
            userId = body.udf1;
            packId = body.udf2;
        }

        if (gateway && sessionId && userId && packId) {
            // Securely verify via API check!
            const result = await verifyAndExecutePurchaseAction(userId, packId, gateway, sessionId);
            return NextResponse.json({ success: true, processed: result.success });
        }

        return NextResponse.json({ success: true, message: 'Webhook received but ignored or missing data' });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 200 }); // Always 200 to prevent retries
    }
}
