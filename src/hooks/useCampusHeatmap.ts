import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface VenueData {
  location: string;
  eventCount: number;
  totalAttendees: number;
  popularityScore: number;
  upcomingEvents: number;
  topCategories: string[];
}

export const useCampusHeatmap = () => {
  const [venueData, setVenueData] = useState<VenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHeatmapData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch all events with their registration counts
        const { data: events, error: eventsError } = await supabase
          .from("events")
          .select("id, title, location, category, date, capacity")
          .eq("is_published", true);

        if (eventsError) throw eventsError;

        // Fetch registration counts for each event
        const locationMap = new Map<string, {
          eventCount: number;
          totalAttendees: number;
          upcomingEvents: number;
          categories: Map<string, number>;
        }>();

        const now = new Date();

        for (const event of events || []) {
          const { count } = await supabase
            .from("event_registrations")
            .select("*", { count: "exact", head: true })
            .eq("event_id", event.id)
            .eq("status", "registered");

          const attendees = count || 0;
          const isUpcoming = new Date(event.date) > now;
          const location = event.location.trim();

          if (!locationMap.has(location)) {
            locationMap.set(location, {
              eventCount: 0,
              totalAttendees: 0,
              upcomingEvents: 0,
              categories: new Map(),
            });
          }

          const data = locationMap.get(location)!;
          data.eventCount++;
          data.totalAttendees += attendees;
          if (isUpcoming) data.upcomingEvents++;
          
          const catCount = data.categories.get(event.category) || 0;
          data.categories.set(event.category, catCount + 1);
        }

        // Calculate popularity scores and format data
        const maxAttendees = Math.max(
          ...Array.from(locationMap.values()).map((d) => d.totalAttendees),
          1
        );

        const formattedData: VenueData[] = Array.from(locationMap.entries())
          .map(([location, data]) => {
            // Sort categories by frequency
            const sortedCategories = Array.from(data.categories.entries())
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(([cat]) => cat);

            return {
              location,
              eventCount: data.eventCount,
              totalAttendees: data.totalAttendees,
              popularityScore: Math.round((data.totalAttendees / maxAttendees) * 100),
              upcomingEvents: data.upcomingEvents,
              topCategories: sortedCategories,
            };
          })
          .sort((a, b) => b.popularityScore - a.popularityScore);

        setVenueData(formattedData);
      } catch (err) {
        console.error("Error fetching heatmap data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchHeatmapData();
  }, []);

  return { venueData, loading, error };
};
