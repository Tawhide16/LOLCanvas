import AboutManifestoSection from "@/components/about/AboutManifestoSection";
import DeveloperSection from "@/components/about/DeveloperSection";

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full bg-[#FAF9F5]">
      {/* Dynamic Manifesto & Technical Architecture Section */}
      <AboutManifestoSection />

      {/* Developer Profile Spotlight */}
      <DeveloperSection />
    </div>
  );
}

