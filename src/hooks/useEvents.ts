import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Event {
  id: string;
  title: string;
  description: string | null;
  category: string;
  date: string;
  end_date: string | null;
  location: string;
  capacity: number;
  image_url: string | null;
  organizer_id: string;
  organizer_name: string | null;
  is_published: boolean;
  created_at: string;
  registered?: number;
}

export const useEvents = (category?: string, searchQuery?: string) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from("events")
      .select("*")
      .eq("is_published", true)
      .order("date", { ascending: true });

    if (category && category !== "All") {
      query = query.eq("category", category);
    }

    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`);
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      setError(fetchError.message);
      setEvents([]);
    } else {
      // Get registration counts for each event
      const eventsWithCounts = await Promise.all(
        (data || []).map(async (event) => {
          const { count } = await supabase
            .from("event_registrations")
            .select("*", { count: "exact", head: true })
            .eq("event_id", event.id)
            .eq("status", "registered");
          
          return { ...event, registered: count || 0 };
        })
      );
      setEvents(eventsWithCounts);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, [category, searchQuery]);

  return { events, loading, error, refetch: fetchEvents };
};

export const useEventById = (eventId: string | undefined) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    const fetchEvent = async () => {
      const { data, error: fetchError } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .maybeSingle();

      if (fetchError) {
        setError(fetchError.message);
      } else if (data) {
        // Get registration count
        const { count } = await supabase
          .from("event_registrations")
          .select("*", { count: "exact", head: true })
          .eq("event_id", data.id)
          .eq("status", "registered");
        
        setEvent({ ...data, registered: count || 0 });
      }
      setLoading(false);
    };

    fetchEvent();
  }, [eventId]);

  return { event, loading, error };
};
