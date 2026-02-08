import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

const emailPreferences = [
  {
    id: "marketing",
    title: "Marketing Emails",
    description: "Receive promotional emails about new features and offers",
  },
  {
    id: "newsletter",
    title: "Newsletter",
    description: "Weekly digest of campus events and news",
  },
  {
    id: "event-reminders",
    title: "Event Reminders",
    description: "Get email reminders before your registered events",
  },
  {
    id: "event-updates",
    title: "Event Updates",
    description: "Receive updates when events you're registered for change",
  },
  {
    id: "new-events",
    title: "New Event Alerts",
    description: "Get notified when new events matching your interests are posted",
  },
];

const EmailPreferences = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<Record<string, boolean>>({
    marketing: false,
    newsletter: true,
    "event-reminders": true,
    "event-updates": true,
    "new-events": true,
  });

  const handleToggle = (id: string) => {
    setPreferences((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = () => {
    toast({
      title: "Preferences saved",
      description: "Your email preferences have been updated.",
    });
    navigate("/profile");
  };

  return (
    <Layout>
      <div className="container py-8 max-w-2xl">
        <Button
          variant="ghost"
          className="mb-6 text-muted-foreground hover:text-foreground"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="glass-card p-8">
          <h1 className="font-display text-2xl font-bold text-rose mb-2">
            Email Preferences
          </h1>
          <p className="text-muted-foreground mb-6">
            Choose which emails you'd like to receive
          </p>

          <div className="space-y-4">
            {emailPreferences.map((pref) => (
              <div
                key={pref.id}
                className="flex items-center justify-between py-4 border-b border-border last:border-0"
              >
                <div>
                  <div className="font-medium text-foreground">{pref.title}</div>
                  <div className="text-sm text-muted-foreground">{pref.description}</div>
                </div>
                <Switch
                  checked={preferences[pref.id]}
                  onCheckedChange={() => handleToggle(pref.id)}
                />
              </div>
            ))}
          </div>

          <Button
            onClick={handleSave}
            className="mt-6 bg-rose hover:bg-rose-muted text-primary-foreground"
          >
            Save Preferences
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default EmailPreferences;
