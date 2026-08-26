import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts", "src/main.ts"],
	format: ["esm"],
	target: "node22",
	dts: {
		// tsup's dts worker injects `baseUrl`, which TypeScript 6 deprecates.
		compilerOptions: { ignoreDeprecations: "6.0" },
	},
	sourcemap: true,
	clean: true,
});
