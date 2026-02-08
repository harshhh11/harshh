import { Link } from "react-router-dom";
import { Calendar, Bell, User, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  {
    icon: Calendar,
    title: "Discover events",
    description: "Browse all campus events in one place. Filter by category, date, or search for specific interests.",
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    description: "Get personalized notifications before events start. Never forget about that important workshop again.",
  },
  {
    icon: User,
    title: "Easy Registration",
    description: "Register for events with just a few clicks. Track your registrations and manage your schedule.",
  },
];

const Index = () => {
  const { user } = useAuth();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container text-center">
          <div className="inline-block px-4 py-2 mb-6 text-sm bg-secondary rounded-full text-muted-foreground">
            Your Campus, Your Events
          </div>
          
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold italic text-rose mb-6 animate-fade-in">
            Never Miss Another Campus Event
          </h1>
          
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10">
            Discover, register, and get reminders for all the amazing events happening on campus. 
            From career fairs to concerts, we've got you covered.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/browse">
              <Button className="gap-2 px-6 bg-rose hover:bg-rose-muted text-primary-foreground">
                Browse all events <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            {user ? (
              <Link to="/create-event">
                <Button variant="outline" className="px-6 border-muted-foreground/30 hover:border-rose hover:text-rose">
                  Create an event
                </Button>
              </Link>
            ) : (
              <Link to="/register">
                <Button variant="outline" className="px-6 border-muted-foreground/30 hover:border-rose hover:text-rose">
                  Get Started
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-card/50">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-12">
            Everything you need in one place.
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass-card p-6 hover:border-rose/30 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold text-rose mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Assistant CTA */}
      <section className="py-16">
        <div className="container">
          <div className="glass-card p-8 md:p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-rose/20 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="h-8 w-8 text-rose" />
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-rose mb-4">
              Meet EventBot AI
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              Not sure what events to attend? Our AI assistant can help you find the perfect events based on your interests and schedule.
            </p>
            <Link to="/ai-assistant">
              <Button className="bg-rose hover:bg-rose-muted text-primary-foreground">
                Try EventBot <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
