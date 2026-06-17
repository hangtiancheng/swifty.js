import * as fs from "node:fs/promises";
import type {
  CallExpression,
  Expression,
  KeyValueProperty,
  Module,
  ObjectExpression,
  Property,
} from "@swc/core";
import type { MethodInfo } from "../model/method-info.js";
import type { ViewFileInfo } from "../model/view-file-info.js";
import { parseEventMethodName } from "../model/method-info.js";
import { log, logError } from "../logger.js";

type ParseFn = typeof import("@swc/core").parse;
let parser: ParseFn | null = null;
let parserLoadAttempted = false;

async function getParser(): Promise<ParseFn | null> {
  if (!parserLoadAttempted) {
    parserLoadAttempted = true;
    log("Loading @swc/core parser");
    try {
      const swc = await import("@swc/core");
      parser = swc.parse;
      log("@swc/core parser loaded");
    } catch (error: unknown) {
      logError("Failed to load @swc/core", error);
    }
  }
  return parser;
}

export async function analyzeViewFile(filePath: string): Promise<ViewFileInfo | null> {
  let content: string;
  try {
    content = await fs.readFile(filePath, "utf-8");
  } catch (e) {
    logError(`Failed to read view file: ${filePath}`, e);
    return null;
  }

  return analyzeViewContent(content, filePath);
}

async function analyzeViewContent(content: string, filePath: string): Promise<ViewFileInfo | null> {
  const parse = await getParser();
  if (parse === null) {
    return null;
  }
  const isTs = filePath.endsWith(".ts");

  let module: Module;
  try {
    module = await parse(content, {
      syntax: isTs ? "typescript" : "ecmascript",
      target: "es2022",
    });
  } catch (e) {
    logError(`Failed to parse view file: ${filePath}`, e);
    return null;
  }

  const methods: MethodInfo[] = [];

  // Find View.extend({...}) or defineView({...}) call
  const objectExpr = findViewObjectExpression(module);
  if (objectExpr === null) {
    return null;
  }

  // Extract methods from the object expression
  for (const prop of objectExpr.properties) {
    if (prop.type === "SpreadElement") {
      continue;
    }
    const methodInfo = extractMethodFromProperty(prop);
    if (methodInfo !== null) {
      methods.push(methodInfo);
    }
  }

  let stat;
  try {
    stat = await fs.stat(filePath);
  } catch (e) {
    logError(`Failed to stat view file: ${filePath}`, e);
    return null;
  }

  return {
    filePath,
    methods,
    mtime: stat.mtimeMs,
  };
}

function findViewObjectExpression(module: Module): ObjectExpression | null {
  for (const item of module.body) {
    let expr: Expression | null = null;

    if (item.type === "ExportDefaultExpression") {
      expr = item.expression;
    } else if (
      item.type === "ExpressionStatement" &&
      item.expression.type === "AssignmentExpression"
    ) {
      expr = item.expression.right;
    }

    if (expr === null) {
      continue;
    }

    const result = extractObjectFromExpr(expr);
    if (result !== null) {
      return result;
    }
  }

  // Also check variable declarations with export
  for (const item of module.body) {
    if (item.type === "VariableDeclaration") {
      for (const decl of item.declarations) {
        if (decl.init !== undefined && decl.init !== null) {
          const result = extractObjectFromExpr(decl.init);
          if (result !== null) {
            return result;
          }
        }
      }
    }
  }

  return null;
}

function extractObjectFromExpr(expr: Expression): ObjectExpression | null {
  if (expr.type !== "CallExpression") {
    return null;
  }

  const call = expr as CallExpression;

  if (isExtendOrDefineViewCall(call) && call.arguments.length > 0) {
    const firstArg = call.arguments[0];
    if (firstArg !== undefined && firstArg.expression.type === "ObjectExpression") {
      return firstArg.expression;
    }
  }

  return null;
}

function isExtendOrDefineViewCall(call: CallExpression): boolean {
  // defineView({...})
  if (call.callee.type === "Identifier" && call.callee.value === "defineView") {
    return true;
  }

  // View.extend({...}) or SomeName.extend({...})
  if (
    call.callee.type === "MemberExpression" &&
    call.callee.property.type === "Identifier" &&
    call.callee.property.value === "extend"
  ) {
    return true;
  }

  return false;
}

function extractMethodFromProperty(prop: Property): MethodInfo | null {
  if (prop.type === "KeyValueProperty") {
    const kvProp = prop as KeyValueProperty;
    const key = getPropertyKeyString(kvProp.key);
    if (key === null) {
      return null;
    }

    // Check if value is a function
    if (
      kvProp.value.type === "FunctionExpression" ||
      kvProp.value.type === "ArrowFunctionExpression"
    ) {
      return createMethodInfo(key, kvProp.key.span);
    }
    return null;
  }

  if (prop.type === "MethodProperty") {
    const key = getPropertyKeyString(prop.key);
    if (key === null) {
      return null;
    }
    return createMethodInfo(key, prop.key.span);
  }

  return null;
}

function getPropertyKeyString(key: KeyValueProperty["key"]): string | null {
  if (key.type === "Identifier") {
    return key.value;
  }
  if (key.type === "StringLiteral") {
    return key.value;
  }
  if (key.type === "Computed" && key.expression.type === "StringLiteral") {
    return key.expression.value;
  }
  return null;
}

function createMethodInfo(rawName: string, span: { start: number }): MethodInfo {
  const { eventType } = parseEventMethodName(rawName);
  return {
    name: rawName,
    eventType,
    byteOffset: span.start,
  };
}
