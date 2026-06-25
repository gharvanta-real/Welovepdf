import { lazy, ComponentType } from "react";

/**
 * A wrapper around React.lazy that catches chunk loading/dynamic import errors,
 * cleans the session retry flag, and reloads the page once to retrieve the latest assets.
 * This prevents crashes when the application is updated and users have older sessions.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): ReturnType<typeof lazy<T>> {
  return lazy(async () => {
    try {
      const component = await importFn();
      sessionStorage.removeItem("chunk-load-retry");
      return component;
    } catch (error) {
      console.error("Failed to load chunk, attempting retry reload...", error);
      
      const hasReloaded = sessionStorage.getItem("chunk-load-retry");
      if (!hasReloaded) {
        sessionStorage.setItem("chunk-load-retry", "true");
        window.location.reload();
      } else {
        console.error("Chunk load retry failed already. Not reloading to prevent infinite loops.");
        throw error;
      }
      
      // Return a dummy component that renders nothing while the browser is reloading
      return { default: (() => null) as unknown as T };
    }
  });
}
