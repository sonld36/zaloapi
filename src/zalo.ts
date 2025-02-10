import * as toughCookie from 'tough-cookie';
import { ContextBase, createContext, Options } from './context';
import { login } from '../apis/login';

export type Cookie = {
    domain: string;
    expirationDate: number;
    hostOnly: boolean;
    httpOnly: boolean;
    name: string;
    path: string;
    sameSite: string;
    secure: boolean;
    session: boolean;
    storeId: string;
    value: string;
};

export type Credentials = {
    imei: string;
    cookie: Cookie[] | toughCookie.SerializedCookie[] | { url: string; cookies: Cookie[] };
    userAgent: string;
    language?: string;
};


export class Zalo {
    constructor(private options: Partial<Options> = {}) {}

    public async login(credentials: Credentials) {
        const ctx = createContext(this.options.apiType, this.options.apiVersion);
        Object.assign(ctx.options, this.options);
        return this.loginCookie(ctx, credentials);
    }

    private async loginCookie(ctx: ContextBase, credentials: Credentials) {
        ctx.imei = credentials.imei;
        ctx.cookie = this.parseCookies(credentials.cookie);
        ctx.userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36"
        ctx.language = credentials.language || "vi";


        const loginData = await login(ctx, true)
        console.log(loginData);
        
    }

    private parseCookies(cookie: Credentials["cookie"]): toughCookie.CookieJar {
        const cookieArr = Array.isArray(cookie) ? cookie : cookie.cookies;

        cookieArr.forEach((e, i) => {
            if (typeof e.domain == "string" && e.domain.startsWith(".")) cookieArr[i].domain = e.domain.slice(1);
        });

        const jar = new toughCookie.CookieJar();

        for(const each of cookieArr) {
            try {
                jar.setCookieSync(
                    toughCookie.Cookie.fromJSON({
                        ...each,
                        key: (each as toughCookie.SerializedCookie).key || each.name
                    }) ?? "",
                    "https://chat.zalo.me",
                )
            } catch {
                console.log("encounter error");
                
            }
        }

        return jar;
    }
}