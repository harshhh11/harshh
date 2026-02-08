import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get authorization header for user context
    const authHeader = req.headers.get("Authorization");
    let userContext = "";
    let eventsContext = "";

    // Create Supabase client to fetch context - use SUPABASE_URL and SUPABASE_ANON_KEY
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    // Only fetch context if Supabase is configured
    if (supabaseUrl && supabaseAnonKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
          global: { headers: { Authorization: authHeader || "" } },
        });

        // Fetch upcoming events for context
        const { data: events } = await supabase
          .from("events")
          .select("id, title, description, category, date, location, capacity")
          .eq("is_published", true)
          .gte("date", new Date().toISOString())
          .order("date", { ascending: true })
          .limit(20);

        if (events && events.length > 0) {
          eventsContext = `\n\nUpcoming Events Available:\n${events
            .map(
              (e: any) =>
                `- "${e.title}" (${e.category}) on ${new Date(e.date).toLocaleDateString()} at ${e.location}. ${e.description || ""}`
            )
            .join("\n")}`;
        }

        // If user is authenticated, get their registrations for personalization
        if (authHeader) {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (user) {
            const { data: registrations } = await supabase
              .from("event_registrations")
              .select("event_id, events(title, category)")
              .eq("user_id", user.id)
              .limit(10);

            if (registrations && registrations.length > 0) {
              const categories = [
                ...new Set(
                  registrations
                    .map((r: any) => r.events?.category)
                    .filter(Boolean)
                ),
              ];
              userContext = `\n\nUser's Interests (based on past registrations): ${categories.join(", ")}
User has registered for: ${registrations.map((r: any) => r.events?.title).filter(Boolean).join(", ")}`;
            }

            // Get user profile
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name, department, year_of_study, user_type")
              .eq("user_id", user.id)
              .maybeSingle();

            if (profile) {
              userContext += `\nUser Profile: ${profile.full_name || "Anonymous"}, ${profile.user_type || "Student"}, ${profile.department || "Unknown Department"}`;
            }
          }
        }
      } catch (contextError) {
        console.error("Error fetching context:", contextError);
        // Continue without context
      }
    }

    const systemPrompt = `You are EventBot AI, an advanced and intelligent assistant for the EventEase campus event management platform. You provide comprehensive, detailed, and helpful responses similar to ChatGPT.

## Your Capabilities:
1. **Event Discovery & Recommendations**
   - Recommend events based on user interests, past registrations, and preferences
   - Search and filter events by category, date, location, or keywords
   - Provide detailed event information including dates, times, venues, and descriptions

2. **Schedule Management**
   - Help users plan their event schedules
   - Warn about potential schedule conflicts between registered events
   - Suggest optimal event combinations based on timing and interests

3. **Platform Guidance**
   - Explain how to browse, search, and filter events
   - Guide users through event registration process
   - Help organizers create and manage events
   - Explain the notification and calendar features

4. **General Assistance**
   - Answer questions about campus event policies
   - Provide tips for event attendance and networking
   - Help with event-related queries and troubleshooting

## Response Guidelines:
- Be thorough and comprehensive in your answers
- Use markdown formatting for better readability (headers, lists, bold, code blocks when needed)
- When recommending events, explain WHY each event might interest the user
- Provide step-by-step instructions when guiding users through processes
- If you don't have specific information, acknowledge it and provide helpful alternatives
- Be conversational but professional
- Anticipate follow-up questions and proactively provide relevant information

## Current Platform Context:${eventsContext}${userContext}

When recommending events, prioritize those matching the user's demonstrated interests. If no user context is available, ask about their interests to provide better recommendations.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add more credits." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to get AI response" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
