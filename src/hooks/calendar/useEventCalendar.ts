import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { startOfMonth, endOfMonth, isSameDay, parseISO } from "date-fns";
import { FitnessEvent, EventFormData, eventTypes, initialEventFormData } from "@/components/calendar/types";

export const useEventCalendar = () => {
  const { toast } = useToast();
  const { t } = useTranslation(['calendar', 'errors']);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<FitnessEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<EventFormData>(initialEventFormData);

  useEffect(() => {
    fetchEvents();
    
    const channel = supabase
      .channel('fitness_events_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fitness_events'
        },
        () => fetchEvents()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);

      const { data, error } = await supabase
        .from("fitness_events")
        .select("*")
        .eq("user_id", user.id)
        .gte("start_time", monthStart.toISOString())
        .lte("start_time", monthEnd.toISOString())
        .order("start_time", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      toast({
        title: t('errors:error'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please log in to create events");

      if (!formData.title || !formData.start_time) {
        toast({
          title: t('calendar:error'),
          description: t('calendar:title_start_required'),
          variant: "destructive",
        });
        return;
      }

      const eventType = eventTypes.find(t => t.value === formData.event_type);
      
      const { error } = await supabase
        .from("fitness_events")
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description || null,
          event_type: formData.event_type,
          start_time: formData.start_time,
          end_time: formData.end_time || null,
          location: formData.location || null,
          color: eventType?.color || null,
        });

      if (error) throw error;

      toast({
        title: t('calendar:success'),
        description: t('calendar:event_created'),
      });

      setIsDialogOpen(false);
      setFormData(initialEventFormData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleComplete = async (event: FitnessEvent) => {
    try {
      const { error } = await supabase
        .from("fitness_events")
        .update({ completed: !event.completed })
        .eq("id", event.id);

      if (error) throw error;

      toast({
        title: event.completed ? t('calendar:marked_incomplete') : t('calendar:completed'),
        description: event.completed ? "" : t('calendar:great_job'),
      });
    } catch (error: any) {
      toast({
        title: t('errors:error'),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getEventsForDay = (date: Date) => {
    return events.filter(event =>
      isSameDay(parseISO(event.start_time), date)
    );
  };

  return {
    currentDate,
    setCurrentDate,
    events,
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
  };
};
