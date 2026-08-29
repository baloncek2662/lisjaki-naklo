import { ViteReactSSG } from "vite-react-ssg";
import { routes } from "./routes";
import "./index.css";

export const createRoot = ViteReactSSG({ routes });

if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration("/");
      await registration?.unregister();

      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames
            .filter((name) => name.startsWith("lisjaki-turnir-"))
            .map((name) => caches.delete(name)),
        );
      }
    } catch {
      // Cleanup is best-effort; the application does not rely on a service worker.
    }
  });
}
