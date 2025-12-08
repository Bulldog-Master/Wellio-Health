import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { Clock, MapPin, CheckCircle2, Circle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FitnessEvent, eventTypes } from "./types";

interface EventListProps {
  selectedDate: Date;
  events: FitnessEvent[];
  onToggleComplete: (event: FitnessEvent) => void;
}

export const EventList = ({ selectedDate, events, onToggleComplete }: EventListProps) => {
  const { t } = useTranslation('calendar');

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>{t('events_on', { date: format(selectedDate, 'MMMM d, yyyy') })}</CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            {t('no_events_scheduled')}
          </p>
        ) : (
          <div className="space-y-3">
            {events.map((event) => {
              const eventType = eventTypes.find(t => t.value === event.event_type);
              return (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-4 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => onToggleComplete(event)}
                >
                  {event.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-medium ${event.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {event.title}
                      </h4>
                      <Badge className={eventType?.color || 'bg-gray-500'}>
                        {eventType?.label}
                      </Badge>
                    </div>
                    {event.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {event.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(parseISO(event.start_time), 'h:mm a')}
                        {event.end_time && ` - ${format(parseISO(event.end_time), 'h:mm a')}`}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
