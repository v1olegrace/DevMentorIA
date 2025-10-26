import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "../dist-frontend",
    base: "./",
    minify: 'terser',
    cssCodeSplit: false, // Gerar um único arquivo CSS
    // Enable polyfill with error handling for modulepreload
    modulePreload: {
      polyfill: true,
      resolveDependencies: (_url, deps) => deps,
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
        passes: 2,
      },
      mangle: {
        safari10: true,
      },
    },
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, "popup.html"),
        options: path.resolve(__dirname, "options.html"),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "chunks/[name]-[hash].js",
        assetFileNames: "[name].[ext]",
        // Don't inline assets
        inlineDynamicImports: false,
      },
    },
    chunkSizeWarningLimit: 300,
    reportCompressedSize: true,
    sourcemap: false,
  },
}));
