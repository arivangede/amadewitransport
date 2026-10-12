import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";

/** Localised document title + description. Copy length changes with language, so scrubbed sections re-measure. */
export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [title, description]);
}
