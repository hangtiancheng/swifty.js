import type { Context, Next } from "koa";
import { logger } from "../utils/logger.js";

export async function errorMiddleware(ctx: Context, next: Next): Promise<void> {
  try {
    await next();
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: "Internal Server Error",
      message: error.message,
    };
    logger.error(error, "Unhandled error");
  }
}
