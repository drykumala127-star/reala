import { getMobileSettings } from '@/lib/data.actions';
import { NextResponse } from 'next/server';

export async function GET() {
    const settings = await getMobileSettings();
    const packageName = settings?.androidPackageName;
    const sha256Legacy = settings?.androidSha256Fingerprint;
    const sha256Array = settings?.androidSha256Fingerprints || (sha256Legacy ? [sha256Legacy] : []);

    // Filter out empty strings
    const validSha256 = sha256Array.filter(sha => sha && sha.trim() !== "");

    // If they provided SHA256 in settings, generate the real assetlinks
    if (packageName && validSha256.length > 0) {
        return NextResponse.json([{
            relation: ["delegate_permission/common.handle_all_urls"],
            target: {
                namespace: "android_app",
                package_name: packageName,
                sha256_cert_fingerprints: validSha256
            }
        }]);
    }

    // Default empty array if not configured (won't break anything, just won't verify)
    return NextResponse.json([]);
}
