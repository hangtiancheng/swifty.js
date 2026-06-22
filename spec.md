如果将 [@lark.js/mvc](packages/lark-mvc) 对比 React/Vue3

则 [@lark.js/doc](packages/lark-doc) 对标的是 Docusaurus/VitePress, 提供开箱即用的文档站点体验

同时支持 Vite、Webpack、Rspack / Rsbuild

支持用户传递 docs 目录, @lark.js/doc 会递归的扫描 docs 目录, 生成对应的文件路由

对于文件路由, 用户可以选择使用 @lark.js/mvc 路由的 hash 模式或者 history 模式

用户也可以传递 baseUrl, 作为生成的文件路由的公共前缀

解析 markdown 可以使用专业的 markdown AST parse 库

样式方案不支持用户自定义, 全部使用 tailwindcss 和 daisyui (如果需要)
