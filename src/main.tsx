import { ViteReactSSG } from "vite-react-ssg";
import { routes } from "./routes";
import "./index.css";

export const createRoot = ViteReactSSG({ routes });

if (typeof window !== "undefined" && import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // The application remains fully usable when service workers are unavailable.
    });
  });
}
