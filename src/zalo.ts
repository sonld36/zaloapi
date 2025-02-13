import * as toughCookie from 'tough-cookie';
import { ContextBase, ContextSession, createContext, isContextSession, Options } from './context';
import { getServerInfo, login } from '../apis/login';
import { logger, makeURL } from './utils';
import { Listener } from '../apis/listen';
import { sendMessageFactory } from '../apis/sendMessage';
import { getAllFriendsFactory } from '../apis/getAllFriends';
import { getAllGroupsFactory } from '../apis/getAllGroups';
import { getGroupInfoFactory } from '../apis/getGroupInfo';
import { findUserFactory } from '../apis/findUser';
import { loginQR, LoginQRCallback } from '../apis/getQRCodeLogin';

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
    cookie: Cookie[] | toughCookie.SerializedCookie[] | { url: string; cookies: Cookie[] } | string;
    userAgent: string;
    language?: string;
};


export class Zalo {
    private enableEncryptParam = true;

    constructor(private options: Partial<Options> = {}) {}

    public async login(credentials: Credentials) {
        const ctx = createContext(this.options.apiType, this.options.apiVersion);
        Object.assign(ctx.options, this.options);
        return this.loginCookie(ctx, credentials);
    }

    private async loginCookie(ctx: ContextBase, credentials: Credentials) {
        ctx.imei = credentials.imei;
        ctx.cookie = credentials.cookie as any;
        ctx.userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36"
        ctx.language = credentials.language || "vi";


        const loginData = await login(ctx, true)
        const serverInfo = await getServerInfo(ctx, this.enableEncryptParam);

        if (!loginData || !serverInfo) throw new Error("Đăng nhập thất bại");
        ctx.secretKey = loginData.data.zpw_enk;
        ctx.uid = loginData.data.uid;

        ctx.settings = serverInfo.setttings || serverInfo.settings;

        ctx.extraVer = serverInfo.extra_ver;

        if (!isContextSession(ctx)) throw new Error("Khởi tạo ngữ cảnh thát bại.");

        logger(ctx).info("Logged in as", loginData.data.uid);

        return new API(
            ctx,
            loginData.data.zpw_service_map_v3,
            makeURL(ctx, loginData.data.zpw_ws[0], {
                t: Date.now(),
            }),
        );
        
    }


    // private parseCookies(cookie: Credentials["cookie"]): toughCookie.CookieJar {
    //     const cookieArr = Array.isArray(cookie) ? cookie : cookie.cookies;

    //     cookieArr.forEach((e, i) => {
    //         if (typeof e.domain == "string" && e.domain.startsWith(".")) cookieArr[i].domain = e.domain.slice(1);
    //     });

    //     const jar = new toughCookie.CookieJar();

    //     for(const each of cookieArr) {
    //         try {
    //             jar.setCookie(
    //                 toughCookie.Cookie.fromJSON({
    //                     ...each,
    //                     key: (each as toughCookie.SerializedCookie).key || each.name
    //                 }) ?? "",
    //                 "https://wpa.chat.zalo.me",
    //             )
    //         } catch {
    //             console.log("encounter error");
                
    //         }
    //     }

    //     return jar;
    // }


    public async loginQr(
        options?: { userAgent?: string; language?: string; qrPath?: string },
        callback?: LoginQRCallback,
    ) {
        if(!options) options = {};
        if(!options.userAgent) options.userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0";
        if(!options.language) options.language = "vi";

        const ctx = createContext(this.options.apiType, this.options.apiVersion);
        Object.assign(ctx.options, this.options);

        const loginQrResult = await loginQR(
            ctx,
            options as { userAgent: string; language: string; qrPath?: string },
            callback,
        );

        console.log(loginQrResult);
        
    }
}

export class API {
    public listener: Listener;
    public zpwServiceMap: Record<string, string[]>;
    public sendMessage: ReturnType<typeof sendMessageFactory>;
    public getAllFriends: ReturnType<typeof getAllFriendsFactory>;
    public getAllGroups: ReturnType<typeof getAllGroupsFactory>;
    public getGroupInfo: ReturnType<typeof getGroupInfoFactory>;
    public findUser: ReturnType<typeof findUserFactory>;
    

    constructor(ctx: ContextSession, zpwServiceMap: Record<string, string[]>, wsUrl: string) {
        this.zpwServiceMap = zpwServiceMap;
        this.listener = new Listener(ctx, wsUrl);
        this.sendMessage = sendMessageFactory(ctx, this);
        this.getAllFriends = getAllFriendsFactory(ctx, this);
        this.getAllGroups = getAllGroupsFactory(ctx, this);
        this.getGroupInfo = getGroupInfoFactory(ctx, this);
        this.findUser = findUserFactory(ctx, this);
    }
}