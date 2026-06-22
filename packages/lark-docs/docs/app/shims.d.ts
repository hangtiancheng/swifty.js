// CSS module type declarations
declare module "*.css" {
  const content: string;
  export default content;
}

// HTML template module declarations (Lark templates - compiled to functions)
declare module "*.html" {
  // const template: (
  //   data: unknown,
  //   viewId: string,
  //   refData: unknown,
  // ) => string;
  // export default template;
  const content: string;
  export default content;
}

// Auto-generated routes module (produced by vite.config.ts into node_modules/@lark.js/docs/generated/)
// declare module "@lark.js/docs/generated" {
//   /** Route map: URL path → viewId */
//   export const routes: Record<string, string>;

//   /** Site metadata including title, nav, sidebar, search index */
//   export const docsConfig: {
//     title: string;
//     description: string;
//     lang: string;
//     nav: Array<{ text: string; link: string }>;
//     sidebar: Record<
//       string,
//       Array<{
//         text: string;
//         link?: string;
//         collapsed?: boolean;
//         items?: Array<{ text: string; link: string }>;
//       }>
//     >;
//     searchIndex: Array<{
//       title: string;
//       link: string;
//       headings: string[];
//       excerpt: string;
//     }>;
//   };
// }
