import { useLayoutEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ScrollTrigger } from "@/lib/gsap";
import { Cursor } from "./Cursor";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { Preloader } from "./Preloader";
import { SmoothScroll } from "./SmoothScroll";
import { useLenis, useScrollTo } from "./smooth-scroll";

/** Shell shared by every public page: smooth scroll, cursor, header and footer. */
export function LandingLayout() {
  return (
    <SmoothScroll>
      <div className="landing min-h-screen overflow-x-clip">
        <Preloader />
        <Cursor />
        <Navbar />
        <RouteScroll />
        <main>
          <Outlet />
        </main>
        <Footer />
      </div>
    </SmoothScroll>
  );
}

/** New page → start at the top; `/#section` → land on that section once the page has measured itself. */
function RouteScroll() {
  const { pathname, hash } = useLocation();
  const lenis = useLenis();
  const scrollTo = useScrollTo();
  const latest = useRef({ lenis, scrollTo });
  useLayoutEffect(() => {
    latest.current = { lenis, scrollTo };
  });

  useLayoutEffect(() => {
    const { lenis } = latest.current;
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
    if (!hash) return;

    // Pinned sections are built after their data loads, which moves everything below them — so go
    // there after the first frame and again after the next ScrollTrigger refresh.
    const go = () => latest.current.scrollTo(hash);
    const raf = requestAnimationFrame(go);
    ScrollTrigger.addEventListener("refresh", go);
    const stop = setTimeout(() => ScrollTrigger.removeEventListener("refresh", go), 2000);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(stop);
      ScrollTrigger.removeEventListener("refresh", go);
    };
  }, [pathname, hash]);

  return null;
}
