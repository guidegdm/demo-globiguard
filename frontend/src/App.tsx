import { SectionNav } from '@/components/widgets/SectionNav';
import { HeroScene } from '@/components/scenes/HeroScene';
import { ProblemScene } from '@/components/scenes/ProblemScene';
import { FlowScene } from '@/components/scenes/FlowScene';
import { AutomationScene } from '@/components/scenes/AutomationScene';
import { ArchScene } from '@/components/scenes/ArchScene';
import { ComplianceScene } from '@/components/scenes/ComplianceScene';

export default function App() {
  return (
    <div className="relative">
      <SectionNav />
      <HeroScene />
      <ProblemScene />
      <FlowScene />
      <AutomationScene />
      <ArchScene />
      <ComplianceScene />
    </div>
  );
}
