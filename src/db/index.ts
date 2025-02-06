import pgPromise from "pg-promise";

import { env } from "@/configs/env";

const pgp = pgPromise();

export const db = pgp({
  host: env.db.host,
  port: +env.db.port,
  database: env.db.name,
  user: env.db.user,
  password: env.db.password,
});
