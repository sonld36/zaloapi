"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Zalo = void 0;
const toughCookie = __importStar(require("tough-cookie"));
const context_1 = require("./context");
class Zalo {
    constructor(options = {}) {
        this.options = options;
    }
    login(credentials) {
        return __awaiter(this, void 0, void 0, function* () {
            const ctx = (0, context_1.createContext)(this.options.apiType, this.options.apiVersion);
            Object.assign(ctx.options, this.options);
            return this.loginCookie(ctx, credentials);
        });
    }
    loginCookie(ctx, credentials) {
        ctx.imei = credentials.imei;
        ctx.cookie = this.parseCookies(credentials.cookie);
        ctx.userAgent = credentials.userAgent;
        ctx.language = credentials.language || "vi";
        console.log(ctx);
    }
    parseCookies(cookie) {
        var _a;
        const cookieArr = Array.isArray(cookie) ? cookie : cookie.cookies;
        cookieArr.forEach((e, i) => {
            if (typeof e.domain == "string" && e.domain.startsWith("."))
                cookieArr[i].domain = e.domain.slice(1);
        });
        const jar = new toughCookie.CookieJar();
        for (const each of cookieArr) {
            try {
                jar.setCookieSync((_a = toughCookie.Cookie.fromJSON(Object.assign(Object.assign({}, each), { key: each.key || each.name }))) !== null && _a !== void 0 ? _a : "", "https://chat.zalo.me");
            }
            catch (_b) {
                console.log("encounter error");
            }
        }
        return jar;
    }
}
exports.Zalo = Zalo;
