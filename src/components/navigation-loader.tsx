"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { FootballSpinner } from "@/components/ui/football-spinner";

export function NavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Reset spinner state whenever path or query changes
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname, searchParams]);

  // Intercept click events on internal <a> links
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a");

      if (!anchor) return;

      const href = anchor.getAttribute("href");
      const targetAttr = anchor.getAttribute("target");

      // Check if it's a valid internal link pointing to a new route
      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("//") &&
        targetAttr !== "_blank" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey &&
        !e.altKey
      ) {
        const currentUrl = new URL(window.location.href);
        const targetUrl = new URL(href, window.location.href);

        // Only trigger spinner if navigating to a different pathname/search
        if (currentUrl.pathname !== targetUrl.pathname || currentUrl.search !== targetUrl.search) {
          startTransition(() => {
            setIsNavigating(true);
          });
        }
      }
    };

    document.addEventListener("click", handleAnchorClick, true);
    return () => {
      document.removeEventListener("click", handleAnchorClick, true);
    };
  }, []);

  if (!isNavigating && !isPending) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-neutral-950/80 backdrop-blur-sm transition-opacity duration-200">
      <FootballSpinner size="lg" text="Loading FC BBFF" />
    </div>
  );
}
