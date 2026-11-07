export const DEMO_MODE_MUTATION_MESSAGE = 'Please change DEMO_MODE=true to DEMO_MODE=false in .env file.';

export function isDemoMode(): boolean {
    return process.env.DEMO_MODE?.trim().toLowerCase() === 'true';
}

export function getDemoModeMutationError() {
    if (!isDemoMode()) return null;
    return {
        success: false as const,
        error: DEMO_MODE_MUTATION_MESSAGE,
        message: DEMO_MODE_MUTATION_MESSAGE,
    };
}

export function obfuscateEmail(email: string | undefined | null): string {
    if (!email) return '';
    if (!isDemoMode()) return email;
    const parts = email.split('@');
    if (parts.length !== 2) return email;
    const name = parts[0];
    const domain = parts[1];
    if (name.length <= 1) return `*@${domain}`;
    const visibleChars = 1;
    const masked = name.substring(0, visibleChars) + '*'.repeat(Math.max(name.length - visibleChars, 4));
    return `${masked}@${domain}`;
}
