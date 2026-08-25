import { z } from "zod";

/** Formats an unknown thrown value as a concise human-readable message. */
export function describeError(error: unknown): string {
  if (error instanceof z.ZodError) {
    return z.prettifyError(error);
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
