import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { Credentials, Zalo } from "./zalo";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post("/login", (req: Request<Credentials>, res: Response) => {
  const zalo: Zalo = new Zalo();
  zalo.login(req.body);
  res.send("Express + TypeScript Server");
});

app.listen(port, () => {
  console.log(`[server]: My 2 Server is running at http://localhost:${port}`);
});