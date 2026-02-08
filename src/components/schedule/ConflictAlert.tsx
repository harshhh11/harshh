import { AlertTriangle, XCircle, Calendar, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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

interface ConflictAlertProps {
  conflicts: Conflict[];
  className?: string;
}

export const ConflictAlert = ({ conflicts, className }: ConflictAlertProps) => {
  if (conflicts.length === 0) return null;

  const criticalConflicts = conflicts.filter((c) => c.severity === "critical");
  const warningConflicts = conflicts.filter((c) => c.severity === "warning");

  return (
    <div className={cn("space-y-3", className)}>
      {criticalConflicts.length > 0 && (
        <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
          <XCircle className="h-4 w-4" />
          <AlertTitle className="font-display">Exam Conflicts Detected!</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            {criticalConflicts.map((conflict, index) => (
              <div key={index} className="flex flex-col gap-1 text-sm">
                <p className="font-medium">{conflict.message}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(conflict.event1.date), "MMM d, h:mm a")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(conflict.event2.date), "MMM d, h:mm a")}
                  </span>
                </div>
              </div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {warningConflicts.length > 0 && (
        <Alert className="border-warning/50 bg-warning/10">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertTitle className="font-display text-warning">Schedule Overlaps</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            {warningConflicts.map((conflict, index) => (
              <div key={index} className="flex flex-col gap-1 text-sm">
                <p className="font-medium">{conflict.message}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(conflict.event1.date), "MMM d, h:mm a")}
                  </span>
                  <span>vs</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(conflict.event2.date), "MMM d, h:mm a")}
                  </span>
                </div>
              </div>
            ))}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
