"use client";

import { ExpandableCard } from "@/components/ui/expandable-card";

export default function ExpandableCardDemo() {
  return (
    <ExpandableCard
      title="Digital Revolution"
      src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80"
      description="The Future of Technology"
      classNameExpanded="[&_h4]:text-black dark:[&_h4]:text-white [&_h4]:font-medium"
    >
      <h4>The Rise of Artificial Intelligence</h4>
      <p>
        In the heart of Silicon Valley, a revolution is quietly unfolding. 
        Artificial Intelligence, once the stuff of science fiction, has become 
        the driving force behind the most transformative technologies of our 
        time.
      </p>
      <h4>The Quantum Computing Breakthrough</h4>
      <p>
        Deep within the research labs of tech giants and universities, 
        scientists are racing to harness the power of quantum mechanics.
      </p>
    </ExpandableCard>
  );
}
