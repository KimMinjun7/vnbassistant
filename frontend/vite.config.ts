import path from "path"
import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const backendUrl = env.BACKEND_URL || "http://localhost:8000"

  return {
    plugins: [react()],
    base: env.VITE_BASE_PATH || "/",
    define: {
      "process.env.NODE_ENV": JSON.stringify(mode),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    optimizeDeps: {
      include: [
        "recharts", "lucide-react", "react", "react-dom",
        "react-grid-layout", "react-draggable", "react-resizable",
      ],
    },
    server: {
      port: 3000,
      proxy: {
        "/api": {
          target: backendUrl,
          changeOrigin: true,
        },
      },
    },
  }
})
