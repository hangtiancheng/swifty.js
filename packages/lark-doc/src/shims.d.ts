/**
 * Type shim for Vite's ?raw SVG imports.
 *
 * Vite resolves `*.svg?raw` to a plain string containing the SVG markup.
 * TypeScript needs this declaration to accept the import shape.
 */
declare module "*.svg?raw" {
  const content: string;
  export default content;
}

declare module "*.css" {
  const content: string;
  export default content;
}
