import { isIP } from "node:net";
import type { IncomingMessage } from "node:http";

// Client -> Cloudflare -> nginx reverse proxy, we get the second IP entry from the right (the one Cloudflare reports)
export function getClientIp(req: IncomingMessage) {
	const parts = String(req.headers["x-forwarded-for"] ?? "").split(",");
	const ip = (parts[parts.length - 2] ?? "").trim().replace(/^::ffff:/i, ""); // Second one here
	return isIP(ip) ? ip : (req.socket.remoteAddress ?? "unknown");
}