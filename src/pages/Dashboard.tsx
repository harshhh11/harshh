import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Plus, Calendar, Users, TrendingUp, User, Loader2, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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

interface OrganizerEvent {
  id: string;
  title: string;
  category: string;
  date: string;
  location: string;
  capacity: number;
  registered: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<OrganizerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRegistrations: 0,
    avgAttendance: 0,
  });

  const fetchOrganizerEvents = async () => {
    if (!user) return;

    const { data: eventsData, error } = await supabase
      .from("events")
      .select("*")
      .eq("organizer_id", user.id)
      .order("date", { ascending: true });

    if (!error && eventsData) {
      // Get registration counts using secure RPC function
      const eventsWithCounts = await Promise.all(
        eventsData.map(async (event) => {
          const { data: registrations } = await supabase
            .rpc("get_event_registrations_for_organizer", { p_event_id: event.id });

          const registeredCount = registrations?.filter(
            (r: { status: string }) => r.status === "registered"
          ).length || 0;

          return { ...event, registered: registeredCount };
        })
      );

      setEvents(eventsWithCounts);

      // Calculate stats
      const totalRegs = eventsWithCounts.reduce((sum, e) => sum + e.registered, 0);
      setStats({
        totalEvents: eventsWithCounts.length,
        totalRegistrations: totalRegs,
        avgAttendance: eventsWithCounts.length > 0 ? Math.round(totalRegs / eventsWithCounts.length) : 0,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }

    if (user) {
      fetchOrganizerEvents();
    }
  }, [user, authLoading, navigate]);

  const handleDeleteEvent = async (eventId: string, eventTitle: string) => {
    const { error } = await supabase.from("events").delete().eq("id", eventId);

    if (error) {
      toast({
        title: "Failed to delete",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Event deleted",
        description: `${eventTitle} has been deleted.`,
      });
      fetchOrganizerEvents();
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

  const statItems = [
    { label: "Total Events", value: stats.totalEvents.toString(), sublabel: "Active events", icon: Calendar },
    { label: "Total Registrations", value: stats.totalRegistrations.toString(), sublabel: "Students Registered", icon: Users },
    { label: "Avg Attendance", value: stats.avgAttendance.toString(), sublabel: "per event", icon: TrendingUp },
  ];

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold italic text-rose">
              Organizer Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your events and track engagement
            </p>
          </div>
          <Link to="/create-event">
            <Button className="gap-2 bg-rose hover:bg-rose-muted text-primary-foreground">
              <Plus className="h-4 w-4" /> Create Event
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {statItems.map((stat, index) => (
            <div key={index} className="glass-card p-6">
              <div className="flex items-center gap-2 text-rose mb-2">
                <span className="font-display text-lg font-semibold">
                  {stat.label}
                </span>
                <stat.icon className="h-4 w-4" />
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.sublabel}</div>
            </div>
          ))}
        </div>

        {/* Your Events */}
        <div className="glass-card p-6">
          <div className="mb-6">
            <h2 className="font-display text-xl font-semibold text-rose">Your Events</h2>
            <p className="text-sm text-muted-foreground">Manage and monitor your event listings</p>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-4">You haven't created any events yet.</p>
              <Link to="/create-event">
                <Button className="bg-rose hover:bg-rose-muted text-primary-foreground">
                  Create Your First Event
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => {
                const capacityPercentage = Math.round((event.registered / event.capacity) * 100);
                const isFillingFast = capacityPercentage >= 80;
                return (
                  <div key={event.id} className="bg-card rounded-lg p-5 border border-border hover:border-rose/30 transition-all">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => navigate(`/event/${event.id}`)}
                      >
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-display text-lg font-semibold text-rose">
                            {event.title}
                          </h3>
                          <Badge variant="secondary" className="text-xs">
                            {event.category}
                          </Badge>
                          {isFillingFast && (
                            <Badge className="bg-warning text-primary-foreground text-xs">
                              Filling fast
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-sm">
                          {new Date(event.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}{" "}
                          • {event.location}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>{event.registered} / {event.capacity}</span>
                        </div>

                        <div className="w-24 md:w-32">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>Capacity</span>
                            <span>{capacityPercentage}%</span>
                          </div>
                          <Progress value={capacityPercentage} className="h-2" />
                        </div>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-card border-border">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Event?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete <strong>{event.title}</strong> and all
                                registrations. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteEvent(event.id, event.title)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
