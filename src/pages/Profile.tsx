import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Calendar, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const notificationSettings = [
  {
    id: "event-reminders",
    title: "Event Reminders",
    description: "Get notified before your registered events",
  },
  {
    id: "event-updates",
    title: "Event Updates",
    description: "Receive updates about events you're attending",
  },
  {
    id: "new-events",
    title: "New Events",
    description: "Get notified when new events are posted",
  },
  {
    id: "weekly-digest",
    title: "Weekly Digest",
    description: "Receive a weekly summary of upcoming events",
  },
];

interface Profile {
  full_name: string | null;
  email: string | null;
  phone: string | null;
  department: string | null;
  user_type: string | null;
  created_at: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    "event-reminders": true,
    "event-updates": true,
    "new-events": true,
    "weekly-digest": true,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setProfile(data);
        setFullName(data.full_name || "");
        setEmail(data.email || user.email || "");
        setPhone(data.phone || "");
        setDepartment(data.department || "");
      } else if (!error) {
        setEmail(user.email || "");
      }
      setLoading(false);
    };

    if (user) {
      fetchProfile();
    }
  }, [user, authLoading, navigate]);

  const handleNotificationChange = (id: string) => {
    setNotifications((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone,
        department,
      })
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile updated",
        description: "Your changes have been saved.",
      });
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
    navigate("/");
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

  return (
    <Layout>
      <div className="container py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-rose mb-2">
            Profile Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>

        {/* Profile Information */}
        <div className="glass-card p-6 mb-6">
          <div className="text-rose font-display font-semibold mb-1">
            Profile Information
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Update your personal details
          </p>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <div className="font-semibold text-rose">{fullName || "User"}</div>
              <div className="text-sm text-muted-foreground capitalize">
                {profile?.user_type || "Student"}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-muted border-border focus:border-rose"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-muted border-border opacity-60"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-muted border-border focus:border-rose"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="bg-muted border-border focus:border-rose"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4 mb-4">
            <Calendar className="h-4 w-4" />
            <span>
              Member since{" "}
              {profile?.created_at
                ? format(new Date(profile.created_at), "dd/MM/yyyy")
                : "Recently"}
            </span>
          </div>

          <Button
            onClick={handleSaveProfile}
            className="bg-rose hover:bg-rose-muted text-primary-foreground"
            disabled={saving}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save Profile
          </Button>
        </div>

        {/* Notification Preferences */}
        <div className="glass-card p-6 mb-6">
          <div className="text-rose font-display font-semibold mb-1">
            Notification Preferences
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Choose what updates you want to receive
          </p>

          <div className="space-y-4">
            {notificationSettings.map((setting) => (
              <div
                key={setting.id}
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <div>
                  <div className="text-sm font-medium text-foreground">{setting.title}</div>
                  <div className="text-sm text-muted-foreground">{setting.description}</div>
                </div>
                <Switch
                  checked={notifications[setting.id]}
                  onCheckedChange={() => handleNotificationChange(setting.id)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Account Actions */}
        <div className="glass-card p-6">
          <div className="text-rose font-display font-semibold mb-1">
            Account Actions
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Manage your account security and access
          </p>

          <div className="space-y-3">
            <Button
              variant="secondary"
              className="w-full justify-start"
              onClick={() => navigate("/change-password")}
            >
              Change Password
            </Button>
            <Button
              variant="secondary"
              className="w-full justify-start"
              onClick={() => navigate("/email-preferences")}
            >
              Manage Email Preferences
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
