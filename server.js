import { handler } from "./build/handler.js";
import { httpServer } from "./src/lib/server/playSocketLogic.ts";

// Node's "on request" fires only for normal requests, not WS upgrade requests that carry the upgrade header
httpServer.on("request", handler); // All requests are passed to SvelteKit (via the handler created by adapter-node for this purpose)