import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Calendar, MapPin, Users, Clock, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEventById } from "@/hooks/useEvents";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { event, loading } = useEventById(id);
  const { toast } = useToast();
  const [registering, setRegistering] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    department: "",
    yearOfStudy: "",
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to register for events.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!event) return;

    setRegistering(true);

    const { error } = await supabase.from("event_registrations").insert({
      event_id: event.id,
      user_id: user.id,
      full_name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      department: formData.department,
      year_of_study: formData.yearOfStudy,
    });

    if (error) {
      if (error.code === "23505") {
        toast({
          title: "Already registered",
          description: "You have already registered for this event.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Registration successful!",
        description: `You are now registered for ${event.title}`,
      });
      setDialogOpen(false);
      navigate("/my-events");
    }

    setRegistering(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-16 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-rose" />
        </div>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="font-display text-2xl font-bold text-rose mb-4">Event Not Found</h1>
          <p className="text-muted-foreground mb-6">This event doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/browse")} variant="outline">
            Browse Events
          </Button>
        </div>
      </Layout>
    );
  }

  const capacityPercentage = Math.round(((event.registered || 0) / event.capacity) * 100);
  const isFull = (event.registered || 0) >= event.capacity;
  const eventDate = new Date(event.date);

  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        <Button
          variant="ghost"
          className="mb-6 text-muted-foreground hover:text-foreground"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="glass-card overflow-hidden">
          {event.image_url && (
            <div className="h-64 bg-secondary">
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge variant="secondary" className="text-sm">
                {event.category}
              </Badge>
              {capacityPercentage >= 80 && !isFull && (
                <Badge className="bg-warning text-primary-foreground">
                  Filling Fast
                </Badge>
              )}
              {isFull && (
                <Badge variant="destructive">
                  Sold Out
                </Badge>
              )}
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-bold text-rose mb-4">
              {event.title}
            </h1>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="h-5 w-5 text-rose" />
                  <span>{format(eventDate, "EEEE, MMMM d, yyyy")}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Clock className="h-5 w-5 text-rose" />
                  <span>{format(eventDate, "h:mm a")}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="h-5 w-5 text-rose" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Users className="h-5 w-5 text-rose" />
                  <span>{event.registered || 0} / {event.capacity} registered</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Capacity</span>
                    <span>{capacityPercentage}%</span>
                  </div>
                  <Progress value={capacityPercentage} className="h-3" />
                </div>

                {event.organizer_name && (
                  <p className="text-sm text-muted-foreground">
                    Organized by <span className="text-foreground">{event.organizer_name}</span>
                  </p>
                )}
              </div>
            </div>

            {event.description && (
              <div className="mb-8">
                <h2 className="font-display text-xl font-semibold text-rose mb-3">About this event</h2>
                <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
              </div>
            )}

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="w-full md:w-auto bg-rose hover:bg-rose-muted text-primary-foreground"
                  disabled={isFull}
                  size="lg"
                >
                  {isFull ? "Event Full" : "Register Now"}
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="font-display text-xl text-rose">
                    Register for {event.title}
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleRegister} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="regFullName">Full Name *</Label>
                    <Input
                      id="regFullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="bg-muted border-border focus:border-rose"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="regEmail">Email *</Label>
                    <Input
                      id="regEmail"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-muted border-border focus:border-rose"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="regPhone">Phone Number</Label>
                    <Input
                      id="regPhone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-muted border-border focus:border-rose"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="regDepartment">Department</Label>
                      <Input
                        id="regDepartment"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="bg-muted border-border focus:border-rose"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="regYear">Year of Study</Label>
                      <Select
                        value={formData.yearOfStudy}
                        onValueChange={(value) => setFormData({ ...formData, yearOfStudy: value })}
                      >
                        <SelectTrigger className="bg-muted border-border">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1st Year</SelectItem>
                          <SelectItem value="2">2nd Year</SelectItem>
                          <SelectItem value="3">3rd Year</SelectItem>
                          <SelectItem value="4">4th Year</SelectItem>
                          <SelectItem value="graduate">Graduate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-rose hover:bg-rose-muted text-primary-foreground"
                    disabled={registering}
                  >
                    {registering ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Complete Registration
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EventDetail;
