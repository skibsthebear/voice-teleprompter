import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { resolve } from "path"

export default defineConfig({
  plugins: [react()],
  base: '/voice-teleprompter/',
  server: {
    open: true,
  },
  resolve: {
    alias: {
      bulma: resolve(__dirname, "node_modules/bulma/bulma.sass"),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
        silenceDeprecations: [
          "import",
          "global-builtin",
          "color-functions",
        ],
      },
      sass: {
        quietDeps: true,
        silenceDeprecations: [
          "import",
          "global-builtin",
          "color-functions",
        ],
      },
    },
  },
})
