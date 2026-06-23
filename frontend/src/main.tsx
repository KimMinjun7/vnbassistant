import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { HashRouter as BrowserRouter } from "react-router-dom"
import { ThemeProvider } from "@/components/theme-provider"
import App from "./App"
import "./styles/globals.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider attribute="class" forcedTheme="light">
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
)
