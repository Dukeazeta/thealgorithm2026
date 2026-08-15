import { HomeOpening } from "@/components/home-opening";
import { HomeSections, SiteFooter } from "@/components/home-sections";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <div className="min-h-svh bg-white">
      <a
        href="#memories"
        className="fixed top-3 left-3 z-[100] -translate-y-20 rounded-sm bg-white px-4 py-3 text-sm font-medium text-black shadow-lg transition-transform focus:translate-y-0"
      >
        Skip the hero animation
      </a>
      <SiteHeader />
      <main>
        <HomeOpening />
        <HomeSections />
      </main>
      <SiteFooter />
    </div>
  );
}
