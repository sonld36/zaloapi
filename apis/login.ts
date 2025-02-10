import { ContextBase } from "../src/context";
import { makeURL, request } from "../src/utils";

export async function login(ctx: ContextBase, encryptParams: boolean) {
    const response = await request(
        ctx,
        makeURL(ctx, "https://wpa.chat.zalo.me/api/login/getLoginInfo", {
            // ...encryptedParams.params,
            nretry: 0,
        }),
    );

    const data = await response.json();
    console.log(data);
    
    
}