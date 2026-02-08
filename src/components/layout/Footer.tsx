import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="border-t border-border">
      {/* CTA Section */}
      <div className="bg-card py-16">
        <div className="container text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-rose mb-4">
            Ready to get started?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Join thousands of students who never miss out on campus events.
          </p>
          <Link to="/browse">
            <Button variant="secondary" className="px-8">
              Explore events now
            </Button>
          </Link>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px gradient-divider" />

      {/* Copyright */}
      <div className="bg-background py-6">
        <div className="container text-center text-sm text-muted-foreground">
          © 2025 EventEase. All Rights Reserved
        </div>
      </div>
    </footer>
  );
};

export default Footer;
