import { env } from "@/configs/env.js";
import { buildServer } from "@/utils/server.js";

async function gracefulShutdown({
  app,
}: {
  app: Awaited<ReturnType<typeof buildServer>>;
}) {
  await app.close();
}

async function main() {
  const app = await buildServer();

  try {
    await app.listen({ port: +env.port });
    console.log(`Server is running on http://localhost:${env.port}`);

    const signals = ["SIGINT", "SIGTERM"];

    for (const signal of signals) {
      process.on(signal, () => {
        gracefulShutdown({
          app,
        });
      });
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
