import { HeroSection } from '@/components/sections/HeroSection';
import { ProblemSection } from '@/components/sections/ProblemSection';
import { NodeSection } from '@/components/sections/NodeSection';
import { CapabilitiesSection } from '@/components/sections/CapabilitiesSection';
import { HowItWorksSection } from '@/components/sections/HowItWorksSection';
import { IntegrationSection } from '@/components/sections/IntegrationSection';
import { VisionSection } from '@/components/sections/VisionSection';
import { SectionNav } from '@/components/widgets/SectionNav';

export default function App() {
  return (
    <main className="noise-overlay">
      <SectionNav />
      <HeroSection />
      <ProblemSection />
      <NodeSection />
      <CapabilitiesSection />
      <HowItWorksSection />
      <IntegrationSection />
      <VisionSection />
    </main>
  );
}
