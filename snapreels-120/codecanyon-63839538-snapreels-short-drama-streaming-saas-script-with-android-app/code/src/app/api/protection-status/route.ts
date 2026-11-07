export const dynamic = 'force-dynamic';
﻿import { NextResponse } from 'next/server';
import { getPluginsSettings } from '@/lib/data.actions';

export async function GET() {
    try {
        const settings = await getPluginsSettings();
        return NextResponse.json({ enabled: settings?.videoProtectionEnabled !== false });
    } catch (e) {
        return NextResponse.json({ enabled: true });
    }
}
