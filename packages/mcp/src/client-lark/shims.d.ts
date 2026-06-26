import type { ViewTemplate, VDomTemplate } from "@lark.js/mvc";

// CSS module type declarations
declare module "*.css" {
  const content: string;
  export default content;
}

// HTML template module declarations (Lark templates - compiled to functions by rollup plugin)
declare module "*.html" {
  const template: ViewTemplate | VDomTemplate;
  export default template;
}
