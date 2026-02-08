import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Calendar, MapPin, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Registration {
  id: string;
  event_id: string;
  status: string;
  created_at: string;
  events: {
    id: string;
    title: string;
    category: string;
    date: string;
    location: string;
  };
}

const MyEvents = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRegistrations = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("event_registrations")
      .select(`
        id,
        event_id,
        status,
        created_at,
        events (
          id,
          title,
          category,
          date,
          location
        )
      `)
      .eq("user_id", user.id)
      .eq("status", "registered")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setRegistrations(data as unknown as Registration[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }

    if (user) {
      fetchRegistrations();
    }
  }, [user, authLoading, navigate]);

  const handleCancelRegistration = async (registrationId: string, eventTitle: string) => {
    const { error } = await supabase
      .from("event_registrations")
      .update({ status: "cancelled" })
      .eq("id", registrationId);

    if (error) {
      toast({
        title: "Failed to cancel",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Registration cancelled",
        description: `You have cancelled your registration for ${eventTitle}`,
      });
      fetchRegistrations();
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container py-16 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-rose" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  const upcomingEvents = registrations.filter(
    (r) => new Date(r.events.date) >= new Date()
  );
  const pastEvents = registrations.filter(
    (r) => new Date(r.events.date) < new Date()
  );

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-rose mb-2">
            My Events
          </h1>
          <p className="text-muted-foreground">
            Events you've registered for
          </p>
        </div>

        {registrations.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">
              No events yet
            </h2>
            <p className="text-muted-foreground mb-6">
              You haven't registered for any events. Start exploring!
            </p>
            <Button
              onClick={() => navigate("/browse")}
              className="bg-rose hover:bg-rose-muted text-primary-foreground"
            >
              Browse Events
            </Button>
          </div>
        ) : (
          <>
            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <div className="mb-12">
                <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                  Upcoming Events ({upcomingEvents.length})
                </h2>
                <div className="grid gap-4">
                  {upcomingEvents.map((registration) => (
                    <div
                      key={registration.id}
                      className="glass-card p-6 hover:border-rose/30 transition-all"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => navigate(`/event/${registration.events.id}`)}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-display text-lg font-semibold text-rose">
                              {registration.events.title}
                            </h3>
                            <Badge variant="secondary" className="text-xs">
                              {registration.events.category}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(registration.events.date), "PPP 'at' p")}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {registration.events.location}
                            </div>
                          </div>
                        </div>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-card border-border">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel Registration?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to cancel your registration for{" "}
                                <strong>{registration.events.title}</strong>? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-border">
                                Keep Registration
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleCancelRegistration(
                                    registration.id,
                                    registration.events.title
                                  )
                                }
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Yes, Cancel
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <div>
                <h2 className="font-display text-xl font-semibold text-muted-foreground mb-4">
                  Past Events ({pastEvents.length})
                </h2>
                <div className="grid gap-4 opacity-60">
                  {pastEvents.map((registration) => (
                    <div
                      key={registration.id}
                      className="glass-card p-6 cursor-pointer"
                      onClick={() => navigate(`/event/${registration.events.id}`)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-display text-lg font-semibold text-foreground">
                          {registration.events.title}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {registration.events.category}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Attended
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(registration.events.date), "PPP")}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {registration.events.location}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default MyEvents;
