import { User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    category: string;
    date: string;
    location: string;
    registered: number;
    capacity: number;
    fillingFast?: boolean;
  };
  onClick?: () => void;
}

const EventCard = ({ event, onClick }: EventCardProps) => {
  const capacityPercentage = Math.round((event.registered / event.capacity) * 100);
  const isFull = event.registered >= event.capacity;

  return (
    <div
      className={`glass-card p-6 hover:border-rose/30 transition-all duration-300 ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h3 className="font-display text-xl font-semibold text-rose">
              {event.title}
            </h3>
            <Badge variant="secondary" className="text-xs">
              {event.category}
            </Badge>
            {event.fillingFast && !isFull && (
              <Badge className="bg-warning text-primary-foreground text-xs">
                Filling fast
              </Badge>
            )}
            {isFull && (
              <Badge variant="destructive" className="text-xs">
                Sold Out
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm mb-4">
            {event.date} • {event.location}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{event.registered} / {event.capacity}</span>
          </div>
          
          <div className="w-32 md:w-48">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Capacity</span>
              <span>{capacityPercentage}%</span>
            </div>
            <Progress value={capacityPercentage} className="h-2" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
