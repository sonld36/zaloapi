"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const zalo_1 = require("./zalo");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(express_1.default.json());
app.post("/login", (req, res) => {
    const zalo = new zalo_1.Zalo();
    zalo.login(req.body);
    res.send("Express + TypeScript Server");
});
app.listen(port, () => {
    console.log(`[server]: My Server is running at http://localhost:${port}`);
});
