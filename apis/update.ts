import { compare } from "semver";
import { ContextBase } from "../src/context";
import { isBun, logger } from "../src/utils";

const VERSION = "2.0.0-beta.8";
const NPM_REGISTRY = "https://registry.npmjs.org/zca-js";

export async function checkUpdate(ctx: ContextBase) {
    if (!ctx.options.checkUpdate) return;

    const _options = {
        ...(isBun ? { proxy: ctx.options.agent } : { agent: ctx.options.agent }),
    };
    const response = await ctx.options.polyfill(NPM_REGISTRY, _options as RequestInit).catch(() => null);
    if (!response || !response.ok) return;

    const data = await response.json().catch(() => null);
    if (!data) return;

    const latestVersion = data["dist-tags"].latest;
    if (compare(VERSION, latestVersion) === -1) {
        logger(ctx).info(`A new version of zca-js is available: ${latestVersion}`);
    } else {
        logger(ctx).info("zca-js is up to date");
    }
}
