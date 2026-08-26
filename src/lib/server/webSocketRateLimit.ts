const wsUpgradeAttempts = new Map(); // IP -> { count, resetTime }
const WS_RATE_LIMIT_WINDOW = 5_000; // 5 seconds
const WS_RATE_LIMIT_MAX = 10;

export function isWsUpgradeRateLimited(ip: string) {
    const now = Date.now();
    const record = wsUpgradeAttempts.get(ip);

    if (!record || now > record.resetTime) {
        wsUpgradeAttempts.set(ip, { count: 1, resetTime: now + WS_RATE_LIMIT_WINDOW });
        return false;
    }

    record.count++;
    return record.count > WS_RATE_LIMIT_MAX;
}