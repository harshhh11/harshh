import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import EventCard from "@/components/events/EventCard";
import { useEvents } from "@/hooks/useEvents";

const categories = ["All", "Academic", "Social", "Sports", "Arts", "Career", "Workshop", "Other"];

const BrowseEvents = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchQuery = searchParams.get("search") || "";
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { events, loading } = useEvents(selectedCategory, searchQuery);

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-rose mb-2">
            Browse Events
          </h1>
          <p className="text-muted-foreground">
            {searchQuery
              ? `Showing results for "${searchQuery}"`
              : "Discover all the exciting events happening on campus"}
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={
                selectedCategory === category
                  ? "bg-rose text-primary-foreground hover:bg-rose-muted"
                  : "border-border hover:border-rose hover:text-rose"
              }
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-rose" />
          </div>
        ) : events.length > 0 ? (
          <div className="grid gap-4">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={{
                  id: event.id,
                  title: event.title,
                  category: event.category,
                  date: new Date(event.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  }),
                  location: event.location,
                  registered: event.registered || 0,
                  capacity: event.capacity,
                  fillingFast: ((event.registered || 0) / event.capacity) >= 0.8,
                }}
                onClick={() => navigate(`/event/${event.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "No events found matching your search."
                : "No events found in this category."}
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                onClick={() => navigate("/browse")}
                className="border-rose text-rose hover:bg-rose hover:text-primary-foreground"
              >
                Clear search
              </Button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BrowseEvents;
