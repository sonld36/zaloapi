import { ContextBase } from "./context";
import * as toughCookie from 'tough-cookie';


export const isBun = typeof Bun !== "undefined";

export function makeURL(
    ctx: ContextBase,
    baseURL: string,
    params: Record<string, any> = {},
    apiVersion: boolean = true,
) {
    let url = new URL(baseURL);
    for (let key in params) {
        if (params.hasOwnProperty(key)) {
            url.searchParams.append(key, params[key]);
        }
    }

    if (apiVersion) {
        if (!url.searchParams.has("zpw_ver")) url.searchParams.set("zpw_ver", ctx.API_VERSION.toString());
        if (!url.searchParams.has("zpw_type")) url.searchParams.set("zpw_type", ctx.API_TYPE.toString());
    }

    return url.toString();
}

export async function request(ctx: ContextBase, url: string, options?: RequestInit, raw = false) {
    if (!ctx.cookie) ctx.cookie = new toughCookie.CookieJar();
    const origin = new URL(url).origin;

    const defaultHeaders = await getDefaultHeaders(ctx, origin) as any;
    if (!raw) {
        if (options) {
            options.headers = Object.assign(defaultHeaders, options.headers || {});
        } else options = { headers: defaultHeaders };
    }

    const _options = {
        ...(options ?? {}),
        // @ts-ignore
        ...(isBun ? { proxy: ctx.options.agent } : { agent: ctx.options.agent }),
    };

    const response = await ctx.options.polyfill(url, _options);
    if (response.headers.has("set-cookie") && !raw) {
        for (const cookie of response.headers.getSetCookie()) {
            const parsed = toughCookie.Cookie.parse(cookie);
            try {
                if (parsed) await ctx.cookie.setCookie(parsed, origin);
            } catch {}
        }
    }

    const redirectURL = response.headers.get("location");
    if (redirectURL) {
        const redirectOptions = { ...options };
        redirectOptions.method = "GET";
        // @ts-ignore
        if (!raw) redirectOptions.headers["Referer"] = "https://id.zalo.me/";
        return await request(ctx, redirectURL, redirectOptions);
    }

    return response;
}


export async function getDefaultHeaders(ctx: ContextBase, origin: string = "https://chat.zalo.me") {
    if (!ctx.cookie) {
        console.log("Cookie is not available");
        return null;
    }
    
    if (!ctx.userAgent) {
        console.log("User agent is not available");
        return null;
    }
    

    return {
        Accept: "application/json, text/plain, */*",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "en-US,en;q=0.9",
        "content-type": "application/x-www-form-urlencoded",
        Cookie: await ctx.cookie.getCookieString(origin),
        Origin: "https://chat.zalo.me",
        Referer: "https://chat.zalo.me/",
        "User-Agent": ctx.userAgent,
    };
}