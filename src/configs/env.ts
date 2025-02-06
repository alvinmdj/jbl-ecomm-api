import "dotenv/config";

export const env = {
  port: process.env.PORT || 4000,
  db: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || "jbl_ecomm_db",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "password",
  },
};
