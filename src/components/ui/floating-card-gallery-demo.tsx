"use client";

import FloatingCardGallery, { CardItem } from "@/components/ui/floating-card-gallery";

const cardData: CardItem[] = [
  {
    title: "Immersive Virtual Reality",
    description: "Explore how VR is transforming the way we interact with digital environments.",
    fullDescription: "Virtual Reality technology is revolutionizing industries from gaming to healthcare. By creating fully immersive digital environments, VR enables users to experience scenarios that would otherwise be impossible, dangerous, or prohibitively expensive in the real world.",
    image: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=800&q=80",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    author: "Sophia Chen",
    category: "Technology",
    tags: ["Virtual Reality", "Technology", "Innovation", "Digital Experience"]
  },
  {
    title: "Quantum Computing Breakthroughs",
    description: "Recent advances in quantum computing are promising to solve previously impossible problems.",
    fullDescription: "Quantum computers leverage the strange properties of quantum mechanics to process information in ways that classical computers cannot. Recent breakthroughs have brought us closer to quantum supremacy, where quantum computers can solve problems that classical computers practically cannot.",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    author: "Robert Jiang",
    category: "Science",
    tags: ["Quantum", "Computing", "Research", "Future Tech"]
  },
  {
    title: "Sustainable Architecture",
    description: "How eco-friendly building designs are shaping our urban landscapes.",
    fullDescription: "Sustainable architecture focuses on creating buildings that minimize environmental impact through energy efficiency, resource conservation, and harmony with the natural environment. From living walls to solar integration, these designs are revolutionizing how we think about urban spaces.",
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    author: "Emma Rodriguez",
    category: "Design",
    tags: ["Architecture", "Sustainability", "Urban Design", "Eco-friendly"]
  },
  {
    title: "Neuroscience of Creativity",
    description: "New research reveals how the brain generates innovative ideas.",
    fullDescription: "Scientists are uncovering the neural mechanisms behind creative thinking. Using advanced imaging techniques, researchers can observe how different brain regions collaborate during creative processes, offering insights into how we might enhance innovative thinking.",
    image: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=800&q=80",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    author: "Marcus Taylor",
    category: "Science",
    tags: ["Neuroscience", "Creativity", "Brain", "Research"]
  },
  {
    title: "Autonomous Transportation",
    description: "Self-driving vehicles are transforming how we think about mobility.",
    fullDescription: "Autonomous vehicles use a combination of sensors, cameras, radar, and artificial intelligence to navigate without human input. As this technology matures, it promises to reduce accidents, ease congestion, and provide mobility options for those who cannot drive.",
    image: "https://images.unsplash.com/photo-1562519819-016930ada31c?auto=format&fit=crop&w=800&q=80",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    author: "Leila Johnson",
    category: "Technology",
    tags: ["Autonomous", "Transportation", "AI", "Future Mobility"]
  },
  {
    title: "Deep Ocean Discoveries",
    description: "Exploring the mysteries of Earth's final frontier.",
    fullDescription: "The deep ocean remains one of the least explored regions on Earth. Recent expeditions have discovered new species, underwater geological features, and insights into how life adapts to extreme conditions. These discoveries have implications for medicine, climate science, and our understanding of life itself.",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80",
    author: "David Nakamura",
    category: "Environment",
    tags: ["Oceanography", "Marine Biology", "Exploration", "Discovery"]
  }
];

export default function FloatingCardGalleryDemo() {
  return (
    <div className="w-full">
      <FloatingCardGallery cards={cardData} />
    </div>
  );
}
