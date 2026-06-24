import React, { useState } from "react";
import { HeroSection } from "./HeroSection";
import { DailyToolsSection } from "./DailyToolsSection";
import { CreativeWorkflowsSection } from "./CreativeWorkflowsSection";
import { TestimonialsSection } from "./TestimonialsSection";
import { ContactSection } from "./ContactSection";
import { FooterV2 } from "./FooterV2";

type LandingPageV2Props = {
  onToolSelect: (toolName: string) => void;
  onViewChange: (view: any) => void;
  onLogoClick: () => void;
};

export function LandingPageV2({ onToolSelect, onViewChange, onLogoClick }: LandingPageV2Props) {
  // Support three types of design token styles: Blue (default), Light, and Dark
  const [activeTheme, setActiveTheme] = useState<"blue" | "light" | "dark">("blue");

  const scrollToTools = () => {
    document.getElementById("v2-tools-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className={`stitch-landing-v2 theme-${activeTheme}`}>

      {/* ── Subcomponents/Sections (Dedicated & Modular) ── */}
      <HeroSection onScrollToTools={scrollToTools} />
      
      <DailyToolsSection onToolSelect={onToolSelect} />
      
      <CreativeWorkflowsSection />
      
      <TestimonialsSection />
      
      <ContactSection />
      
      <FooterV2
        onToolSelect={onToolSelect}
        onViewChange={onViewChange}
        onLogoClick={onLogoClick}
      />
    </div>
  );
}
export default LandingPageV2;
