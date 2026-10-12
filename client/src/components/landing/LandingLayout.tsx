import { Cursor } from "./Cursor";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { PageTransition } from "./PageTransition";
import { Preloader } from "./Preloader";
import { SmoothScroll } from "./SmoothScroll";

/** Shell shared by every public page: smooth scroll, cursor, header, page transitions and footer. */
export function LandingLayout() {
  return (
    <SmoothScroll>
      <div className="landing min-h-screen overflow-x-clip">
        <Preloader />
        <Cursor />
        <Navbar />
        <PageTransition />
        <Footer />
      </div>
    </SmoothScroll>
  );
}
