import { Sparkles, Calendar, MapPin, Clock, Users, TrendingUp } from "lucide-react";

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

const prompts = [
  {
    icon: Calendar,
    title: "What events are happening this week?",
    description: "Get a summary of upcoming events",
  },
  {
    icon: Sparkles,
    title: "Recommend events based on my interests",
    description: "Personalized suggestions for you",
  },
  {
    icon: MapPin,
    title: "What's happening at the Main Auditorium?",
    description: "Events at a specific venue",
  },
  {
    icon: TrendingUp,
    title: "Which events are most popular right now?",
    description: "See what's trending",
  },
  {
    icon: Users,
    title: "Find networking events for me",
    description: "Connect with others",
  },
  {
    icon: Clock,
    title: "Are there any events today?",
    description: "Quick daily overview",
  },
];

export const SuggestedPrompts = ({ onSelect }: SuggestedPromptsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
      {prompts.map((prompt, index) => (
        <button
          key={index}
          onClick={() => onSelect(prompt.title)}
          className="flex items-start gap-3 p-4 rounded-xl bg-card hover:bg-muted border border-border transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-lg bg-rose/10 flex items-center justify-center flex-shrink-0 group-hover:bg-rose/20 transition-colors">
            <prompt.icon className="h-5 w-5 text-rose" />
          </div>
          <div>
            <p className="font-medium text-sm text-foreground">{prompt.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {prompt.description}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
};
