import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Event {
  id: string;
  title: string;
  date: string;
  end_date: string | null;
  location: string;
  category: string;
}

interface Conflict {
  event1: Event;
  event2: Event;
  type: "overlap" | "exam_conflict";
  severity: "warning" | "critical";
  message: string;
}

export const useScheduleConflicts = () => {
  const { user } = useAuth();
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(false);

  const detectConflicts = useCallback(async () => {
    if (!user) {
      setConflicts([]);
      return;
    }

    setLoading(true);
    try {
      // Get user's registered events
      const { data: registrations, error: regError } = await supabase
        .from("event_registrations")
        .select("event_id")
        .eq("user_id", user.id)
        .eq("status", "registered");

      if (regError) throw regError;

      if (!registrations || registrations.length === 0) {
        setConflicts([]);
        setLoading(false);
        return;
      }

      const eventIds = registrations.map((r) => r.event_id);

      // Fetch full event details
      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("id, title, date, end_date, location, category")
        .in("id", eventIds)
        .order("date", { ascending: true });

      if (eventsError) throw eventsError;

      const detectedConflicts: Conflict[] = [];

      // Check for overlapping events
      for (let i = 0; i < events.length; i++) {
        for (let j = i + 1; j < events.length; j++) {
          const event1 = events[i];
          const event2 = events[j];

          const start1 = new Date(event1.date);
          const end1 = event1.end_date ? new Date(event1.end_date) : new Date(start1.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours
          const start2 = new Date(event2.date);
          const end2 = event2.end_date ? new Date(event2.end_date) : new Date(start2.getTime() + 2 * 60 * 60 * 1000);

          // Check for overlap
          if (start1 < end2 && start2 < end1) {
            const isExamConflict =
              event1.category.toLowerCase().includes("exam") ||
              event2.category.toLowerCase().includes("exam") ||
              event1.title.toLowerCase().includes("exam") ||
              event2.title.toLowerCase().includes("exam");

            detectedConflicts.push({
              event1,
              event2,
              type: isExamConflict ? "exam_conflict" : "overlap",
              severity: isExamConflict ? "critical" : "warning",
              message: isExamConflict
                ? `"${event1.title}" conflicts with exam "${event2.title}"`
                : `"${event1.title}" overlaps with "${event2.title}"`,
            });
          }
        }
      }

      setConflicts(detectedConflicts);
    } catch (error) {
      console.error("Error detecting conflicts:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Check if a new event would conflict with existing registrations
  const checkEventConflict = useCallback(
    async (eventId: string): Promise<Conflict[]> => {
      if (!user) return [];

      try {
        // Get the event to check
        const { data: eventToCheck, error: eventError } = await supabase
          .from("events")
          .select("id, title, date, end_date, location, category")
          .eq("id", eventId)
          .single();

        if (eventError || !eventToCheck) return [];

        // Get user's registered events
        const { data: registrations, error: regError } = await supabase
          .from("event_registrations")
          .select("event_id")
          .eq("user_id", user.id)
          .eq("status", "registered")
          .neq("event_id", eventId);

        if (regError || !registrations?.length) return [];

        const eventIds = registrations.map((r) => r.event_id);

        const { data: existingEvents, error: eventsError } = await supabase
          .from("events")
          .select("id, title, date, end_date, location, category")
          .in("id", eventIds);

        if (eventsError || !existingEvents) return [];

        const conflicts: Conflict[] = [];
        const newStart = new Date(eventToCheck.date);
        const newEnd = eventToCheck.end_date
          ? new Date(eventToCheck.end_date)
          : new Date(newStart.getTime() + 2 * 60 * 60 * 1000);

        for (const existingEvent of existingEvents) {
          const existStart = new Date(existingEvent.date);
          const existEnd = existingEvent.end_date
            ? new Date(existingEvent.end_date)
            : new Date(existStart.getTime() + 2 * 60 * 60 * 1000);

          if (newStart < existEnd && existStart < newEnd) {
            const isExamConflict =
              eventToCheck.category.toLowerCase().includes("exam") ||
              existingEvent.category.toLowerCase().includes("exam") ||
              eventToCheck.title.toLowerCase().includes("exam") ||
              existingEvent.title.toLowerCase().includes("exam");

            conflicts.push({
              event1: eventToCheck,
              event2: existingEvent,
              type: isExamConflict ? "exam_conflict" : "overlap",
              severity: isExamConflict ? "critical" : "warning",
              message: isExamConflict
                ? `This event conflicts with your exam "${existingEvent.title}"`
                : `This event overlaps with "${existingEvent.title}"`,
            });
          }
        }

        return conflicts;
      } catch (error) {
        console.error("Error checking event conflict:", error);
        return [];
      }
    },
    [user]
  );

  useEffect(() => {
    detectConflicts();
  }, [detectConflicts]);

  return {
    conflicts,
    loading,
    detectConflicts,
    checkEventConflict,
  };
};
