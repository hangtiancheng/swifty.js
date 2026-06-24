import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { checkbox } from "@inquirer/prompts";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Shared env keys consumed by the client-side bundle. */
export interface ClientEnv {
  NODE_ENV: string;
  SERVER_URL: string;
  AMAP_JS_KEY: string;
  AMAP_WEB_KEY: string;
  MY_ENV: string;
  app: string;
  SELECTED_ROUTES: string;
}

export interface ResolveSelectedRoutesOptions {
  mode?: string;
  interactive?: boolean;
}

export interface RouteChoice {
  name: string;
  value: string;
  checked?: boolean;
}

export interface RouteSelectionContext {
  isAllRoutes: boolean;
  selectedRoutes: string[];
  routeFlags: Record<string, boolean>;
}

export interface HtmlAssetsOptions {
  scripts?: string[];
  styles?: string[];
}

export interface WriteHtmlFileOptions {
  outDir: string;
  scripts?: string[];
  styles?: string[];
}

export const packageRoot: string = __dirname;
export const srcRoot: string = path.resolve(packageRoot, "src");
export const publicRoot: string = path.resolve(packageRoot, "public");
export const htmlTemplatePath: string = path.resolve(packageRoot, "index.html");

export const routeChoices: RouteChoice[] = [
  { name: "All Routes", value: "*", checked: true },
  { name: "Dashboard", value: "dashboard" },
  { name: "Main (fe24)", value: "main" },
  { name: "Robot Grid", value: "main/grid" },
  { name: "Map", value: "map" },
  { name: "Order", value: "order" },
  { name: "Order Detail", value: "order/detail" },
];

export const allRoutes: string[] = routeChoices
  .filter((item) => item.value !== "*")
  .map((item) => item.value);

export const defaultDevRoutes: string[] = routeChoices.map((item) => item.value);

export function loadProjectEnv(mode: string = "development"): void {
  const files = [".env", `.env.${mode}`];

  for (const file of files) {
    const envPath = path.resolve(packageRoot, file);
    if (fs.existsSync(envPath)) {
      dotenv.config({
        path: envPath,
        override: false,
      });
    }
  }
}

export async function resolveSelectedRoutes({
  mode = "development",
  interactive = false,
}: ResolveSelectedRoutesOptions = {}): Promise<RouteSelectionContext> {
  if (mode === "development") {
    return createRouteSelectionContext(allRoutes);
  }
  loadProjectEnv(mode);

  const fromEnv = parseSelectedRoutes(process.env.SELECTED_ROUTES);
  if (fromEnv.length > 0) {
    return createRouteSelectionContext(fromEnv);
  }

  if (interactive) {
    try {
      const answers = await checkbox({
        message: "Select routes to compile:",
        choices: routeChoices,
        required: true,
      });

      return createRouteSelectionContext(answers);
    } catch {
      return createRouteSelectionContext(defaultDevRoutes);
    }
  }

  return createRouteSelectionContext(allRoutes);
}

export function parseSelectedRoutes(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function createRouteSelectionContext(selectedRoutes: string[]): RouteSelectionContext {
  const isAllRoutes = selectedRoutes.includes("*");
  const normalizedRoutes = isAllRoutes
    ? allRoutes
    : selectedRoutes.filter((item) => allRoutes.includes(item));
  const routeFlags = Object.fromEntries(
    allRoutes.map((route) => [toRouteFlag(route), normalizedRoutes.includes(route)]),
  );

  return {
    isAllRoutes,
    selectedRoutes: normalizedRoutes,
    routeFlags,
  };
}

export function createConditionalVars(
  routeFlags: Record<string, boolean>,
): Record<string, string | boolean> {
  return {
    MY_ENV: process.env.MY_ENV || "prod",
    app: process.env.app || "1",
    ...routeFlags,
  };
}

export function createClientEnv(mode: string, routeFlags: Record<string, boolean>): ClientEnv {
  const clientEnv: Partial<ClientEnv> & Record<string, string> = {
    NODE_ENV: mode,
    SELECTED_ROUTES: Object.entries(routeFlags)
      .filter(([, enabled]) => enabled)
      .map(([key]) =>
        key
          .replace(/^ROUTE_/, "")
          .toLowerCase()
          .replaceAll("_", "/"),
      )
      .join(","),
  };

  for (const [key, value] of Object.entries(process.env)) {
    clientEnv[key] = value || "";
  }

  clientEnv.SERVER_URL = clientEnv.SERVER_URL || "http://localhost:3000";
  clientEnv.AMAP_JS_KEY = clientEnv.AMAP_JS_KEY || "";
  clientEnv.AMAP_WEB_KEY = clientEnv.AMAP_WEB_KEY || "";
  clientEnv.MY_ENV = clientEnv.MY_ENV || "prod";
  clientEnv.app = clientEnv.app || "1";

  return clientEnv as ClientEnv;
}

export function toProcessEnvDefineMap(envObject: ClientEnv): Record<string, string> {
  return Object.fromEntries(
    Object.entries(envObject).map(([key, value]) => [`process.env.${key}`, JSON.stringify(value)]),
  );
}

export async function copyPublicAssets(outDir: string): Promise<void> {
  if (!fs.existsSync(publicRoot)) {
    return;
  }

  await fsp.mkdir(outDir, { recursive: true });
  await fsp.cp(publicRoot, outDir, { recursive: true });
}

export async function createHtmlDocument(options: HtmlAssetsOptions = {}): Promise<string> {
  const { scripts = [], styles = [] } = options;
  let template = await fsp.readFile(htmlTemplatePath, "utf8");
  template = template.replace("/vite.svg", "/favicon.ico");

  const styleTags = styles.map((href) => `    <link rel="stylesheet" href="${href}" />`).join("\n");
  const scriptTags = scripts
    .map((src) => `    <script type="module" src="${src}"></script>`)
    .join("\n");

  if (styleTags) {
    template = template.replace("</head>", `${styleTags}\n  </head>`);
  }

  if (scriptTags) {
    template = template.replace("</body>", `${scriptTags}\n  </body>`);
  }

  return template;
}

export async function writeHtmlFile({
  outDir,
  scripts = [],
  styles = [],
}: WriteHtmlFileOptions): Promise<void> {
  const html = await createHtmlDocument({ scripts, styles });
  await fsp.mkdir(outDir, { recursive: true });
  await fsp.writeFile(path.resolve(outDir, "index.html"), html, "utf8");
}

export function toRouteFlag(route: string): string {
  return `ROUTE_${route.toUpperCase().replaceAll("/", "_")}`;
}
