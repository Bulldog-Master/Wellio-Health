import { startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, format } from "date-fns";
import { CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FitnessEvent, eventTypes } from "./types";

interface CalendarGridProps {
  currentDate: Date;
  getEventsForDay: (date: Date) => FitnessEvent[];
  onDayClick: (date: Date) => void;
  onEventClick: (event: FitnessEvent) => void;
}

export const CalendarGrid = ({ 
  currentDate, 
  getEventsForDay, 
  onDayClick, 
  onEventClick 
}: CalendarGridProps) => {
  const { t } = useTranslation('calendar');

  const getDaysInMonth = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  };

  const days = getDaysInMonth();

  return (
    <>
      <div className="grid grid-cols-7 gap-2 mb-2">
        {[t('sun'), t('mon'), t('tue'), t('wed'), t('thu'), t('fri'), t('sat')].map((day) => (
          <div key={day} className="text-center font-semibold text-sm text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: days[0].getDay() }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}
        
        {days.map((day) => {
          const dayEvents = getEventsForDay(day);
          const isToday = isSameDay(day, new Date());
          
          return (
            <div
              key={day.toISOString()}
              className={`
                aspect-square p-2 border rounded-lg cursor-pointer transition-colors
                ${isToday ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}
                ${!isSameMonth(day, currentDate) ? 'opacity-50' : ''}
              `}
              onClick={() => onDayClick(day)}
            >
              <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : ''}`}>
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 2).map((event) => {
                  const eventType = eventTypes.find(t => t.value === event.event_type);
                  return (
                    <div
                      key={event.id}
                      className={`text-xs px-1 py-0.5 rounded truncate ${eventType?.color || 'bg-gray-500'} text-white`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                    >
                      {event.completed && <CheckCircle2 className="inline h-2 w-2 mr-1" />}
                      {event.title}
                    </div>
                  );
                })}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayEvents.length - 2} {t('more')}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
