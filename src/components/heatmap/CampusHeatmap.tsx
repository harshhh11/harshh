import { MapPin, Users, Calendar, TrendingUp, Flame } from "lucide-react";
import { useCampusHeatmap, VenueData } from "@/hooks/useCampusHeatmap";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const getHeatColor = (score: number) => {
  if (score >= 80) return "from-red-500 to-orange-500";
  if (score >= 60) return "from-orange-500 to-yellow-500";
  if (score >= 40) return "from-yellow-500 to-lime-500";
  if (score >= 20) return "from-lime-500 to-green-500";
  return "from-green-500 to-teal-500";
};

const getHeatBorder = (score: number) => {
  if (score >= 80) return "border-red-500/50";
  if (score >= 60) return "border-orange-500/50";
  if (score >= 40) return "border-yellow-500/50";
  if (score >= 20) return "border-lime-500/50";
  return "border-green-500/50";
};

interface VenueCardProps {
  venue: VenueData;
  rank: number;
}

const VenueCard = ({ venue, rank }: VenueCardProps) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card p-4 transition-all hover:scale-[1.02]",
        getHeatBorder(venue.popularityScore)
      )}
    >
      {/* Heat indicator bar */}
      <div
        className={cn(
          "absolute top-0 left-0 h-1 bg-gradient-to-r",
          getHeatColor(venue.popularityScore)
        )}
        style={{ width: `${venue.popularityScore}%` }}
      />

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br",
              getHeatColor(venue.popularityScore)
            )}
          >
            {rank <= 3 ? (
              <Flame className="h-5 w-5 text-white" />
            ) : (
              <MapPin className="h-5 w-5 text-white" />
            )}
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">
              {venue.location}
            </h3>
            <div className="flex items-center gap-1 mt-0.5">
              {rank <= 3 && (
                <Badge variant="secondary" className="text-xs bg-rose/20 text-rose">
                  #{rank} Hot
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1 text-2xl font-bold text-foreground">
            <TrendingUp className="h-5 w-5 text-rose" />
            {venue.popularityScore}%
          </div>
          <span className="text-xs text-muted-foreground">popularity</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
          <Users className="h-4 w-4 text-muted-foreground mb-1" />
          <span className="text-lg font-semibold">{venue.totalAttendees}</span>
          <span className="text-xs text-muted-foreground">Attendees</span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
          <Calendar className="h-4 w-4 text-muted-foreground mb-1" />
          <span className="text-lg font-semibold">{venue.eventCount}</span>
          <span className="text-xs text-muted-foreground">Events</span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
          <TrendingUp className="h-4 w-4 text-muted-foreground mb-1" />
          <span className="text-lg font-semibold">{venue.upcomingEvents}</span>
          <span className="text-xs text-muted-foreground">Upcoming</span>
        </div>
      </div>

      {venue.topCategories.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {venue.topCategories.map((cat) => (
            <Badge key={cat} variant="outline" className="text-xs">
              {cat}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export const CampusHeatmap = () => {
  const { venueData, loading, error } = useCampusHeatmap();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load heatmap data</p>
      </div>
    );
  }

  if (venueData.length === 0) {
    return (
      <div className="text-center py-12">
        <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No venue data available yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Flame className="h-6 w-6 text-rose" />
            Campus Heatmap
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Popular venues based on attendance data
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-heat-low" />
            Low
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-heat-medium" />
            Medium
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-heat-hot" />
            Hot
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {venueData.map((venue, index) => (
          <VenueCard key={venue.location} venue={venue} rank={index + 1} />
        ))}
      </div>
    </div>
  );
};
