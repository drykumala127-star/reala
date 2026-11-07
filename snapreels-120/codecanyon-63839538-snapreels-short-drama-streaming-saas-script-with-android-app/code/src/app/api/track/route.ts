import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { seriesId, episodeId, event } = body;

        // event can be 'view', 'like', etc.
        // If seriesId is provided and event is 'view', increment series view count
        if (seriesId && event === 'view') {
            const db = await getDb();
            await db.collection('series').updateOne(
                { _id: ObjectId.isValid(seriesId) ? new ObjectId(seriesId) : seriesId as any },
                { $inc: { views: 1 } as any }
            );
            
            // Optionally update episode views if episodeId is provided
            if (episodeId) {
                await db.collection('episodes').updateOne(
                    { _id: ObjectId.isValid(episodeId) ? new ObjectId(episodeId) : episodeId as any },
                    { $inc: { views: 1 } as any }
                );
            }
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
