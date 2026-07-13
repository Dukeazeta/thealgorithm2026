import { HomeOpening } from "@/components/home-opening";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <div className="min-h-svh bg-white">
      <SiteHeader />
      <main>
        <HomeOpening />
      </main>
    </div>
  );
}
