import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";
import { useTranslation } from "react-i18next";
import { useEventCalendar } from "@/hooks/calendar";
import { CalendarGrid, EventList, EventFormDialog } from "@/components/calendar";

const EventCalendar = () => {
  const { t } = useTranslation('calendar');

  const {
    currentDate,
    setCurrentDate,
    selectedDate,
    setSelectedDate,
    isDialogOpen,
    setIsDialogOpen,
    loading,
    formData,
    setFormData,
    handleCreateEvent,
    handleToggleComplete,
    getEventsForDay,
  } = useEventCalendar();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-8 w-8" />
            {t('event_calendar')}
          </h1>
          <p className="text-muted-foreground">{t('schedule_track_activities')}</p>
        </div>
        <EventFormDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreateEvent}
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">
              {format(currentDate, 'MMMM yyyy')}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentDate(new Date())}
              >
                {t('today')}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CalendarGrid
            currentDate={currentDate}
            getEventsForDay={getEventsForDay}
            onDayClick={setSelectedDate}
            onEventClick={handleToggleComplete}
          />
        </CardContent>
      </Card>

      {selectedDate && (
        <EventList
          selectedDate={selectedDate}
          events={getEventsForDay(selectedDate)}
          onToggleComplete={handleToggleComplete}
        />
      )}
    </div>
  );
};

export default EventCalendar;
