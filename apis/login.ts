import { ContextBase } from "../src/context";
import { decryptResp, makeURL, ParamsEncryptor, request } from "../src/utils";
import cryptojs from 'crypto-js';

export async function login(ctx: ContextBase, encryptParams: boolean) {
    const encryptedParams = await getEncryptParam(ctx, encryptParams, "getlogininfo");
    try {
        const response = await request(
            ctx,
            makeURL(ctx, "https://wpa.chat.zalo.me/api/login/getLoginInfo", {
                ...encryptedParams.params,
                nretry: 0,
            }),
        );
    
        const data = await response.json();
        if (encryptedParams.enk) {
            const decryptedData = decryptResp(encryptedParams.enk, data.data);
            return decryptedData != null && typeof decryptedData != "string" ? decryptedData : null;
        }
    
        return null;
    } catch (error) {
        console.log(error);
        throw new Error("Failed to login: " + error);
    }
}

export async function getServerInfo(ctx: ContextBase, encryptParams: boolean) {
    const encryptedParams = await getEncryptParam(ctx, encryptParams, "getserverinfo");

    try {
        const response = await request(
            ctx,
            makeURL(
                ctx,
                "https://wpa.chat.zalo.me/api/login/getServerInfo",
                {
                    imei: ctx.imei,
                    type: ctx.API_TYPE,
                    client_version: ctx.API_VERSION,
                    computer_name: "Web",
                    signkey: encryptedParams.params.signkey,
                },
                false,
            ),
        );
        if (!response.ok) throw new Error("Failed to fetch server info: " + response.statusText);
        const data = await response.json();

        if (data.data == null) throw new Error("Failed to fetch server info: " + data.error_message);
        return data.data;
    } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch server info: " + error);
    }
}

export function getSignKey(type: string, params: Record<string, any>) {
    let n = [];
    for (let s in params) {
        if (params.hasOwnProperty(s)) {
            n.push(s);
        }
    }

    n.sort();
    let a = "zsecure" + type;
    for (let s = 0; s < n.length; s++) a += params[n[s]];
    return cryptojs.MD5(a);
}

async function getEncryptParam(ctx: ContextBase, encryptParams: boolean, type: string) {
    const params = {} as Record<string, any>;
    const data = {
        computer_name: "Web",
        imei: ctx.imei!,
        language: ctx.language!,
        ts: Date.now(),
    };
    const encryptedData = await _encryptParam(ctx, data, encryptParams);

    if (encryptedData == null) Object.assign(params, data);
    else {
        const { encrypted_params, encrypted_data } = encryptedData;
        Object.assign(params, encrypted_params);
        params.params = encrypted_data;
    }

    params.type = ctx.API_TYPE;
    params.client_version = ctx.API_VERSION;
    params.signkey =
        type == "getserverinfo"
            ? getSignKey(type, {
                  imei: ctx.imei,
                  type: ctx.API_TYPE,
                  client_version: ctx.API_VERSION,
                  computer_name: "Web",
              })
            : getSignKey(type, params);

    return {
        params,
        enk: encryptedData ? encryptedData.enk : null,
    };
}

async function _encryptParam(ctx: ContextBase, data: Record<string, any>, encryptParams: boolean) {
    if (encryptParams) {
        const encryptor = new ParamsEncryptor({
            type: ctx.API_TYPE,
            imei: data.imei,
            firstLaunchTime: Date.now(),
        });
        try {
            const stringifiedData = JSON.stringify(data);
            const encryptedKey = encryptor.getEncryptKey();
            const encodedData = ParamsEncryptor.encodeAES(encryptedKey, stringifiedData, "base64", false);
            const params = encryptor.getParams();

            return params
                ? {
                      encrypted_data: encodedData,
                      encrypted_params: params,
                      enk: encryptedKey,
                  }
                : null;
        } catch (error) {
            throw new Error("Failed to encrypt params: " + error);
        }
    }
    return null;
}