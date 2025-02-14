import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { Credentials, Zalo } from "./zalo";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post("/login", async (req: Request<Credentials>, res: Response) => {
  const zalo: Zalo = new Zalo();
  // const api = await zalo.login(req.body);

  // const user  = await api.findUser("0329444369");
  // const uid = user.uid;
  // api.sendMessage("Hello world", uid);

  const apiQr = await zalo.loginQr();

  const user = await apiQr.findUser("0942695796");
  const uid = user.uid;
  apiQr.sendMessage("Hello Dj Chip", uid);
  
  res.send("Express + TypeScript Server");
});

app.listen(port, () => {
  console.log(`[server]: My 2 Server is running at http://localhost:${port}`);
});