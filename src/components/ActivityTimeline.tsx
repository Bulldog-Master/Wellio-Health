import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Scale, Utensils, Dumbbell, Footprints, Heart, Trophy, Target, TrendingUp, Calendar, Activity as ActivityIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TimelineEvent {
  id: string;
  type: 'weight' | 'nutrition' | 'workout' | 'steps' | 'habit' | 'achievement' | 'challenge';
  title: string;
  description: string;
  timestamp: string;
  icon: any;
  color: string;
  link?: string;
}

export const ActivityTimeline = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTimelineEvents();
  }, []);

  const fetchTimelineEvents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const allEvents: TimelineEvent[] = [];

      // Fetch recent weight logs
      const { data: weights } = await supabase
        .from('weight_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('logged_at', { ascending: false })
        .limit(5);

      weights?.forEach(w => {
        allEvents.push({
          id: w.id,
          type: 'weight',
          title: 'Weight Logged',
          description: `${w.weight_lbs} lbs`,
          timestamp: w.logged_at,
          icon: Scale,
          color: 'text-primary',
          link: '/weight'
        });
      });

      // Fetch recent nutrition logs
      const { data: nutrition } = await supabase
        .from('nutrition_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('logged_at', { ascending: false })
        .limit(5);

      nutrition?.forEach(n => {
        allEvents.push({
          id: n.id,
          type: 'nutrition',
          title: 'Meal Logged',
          description: `${n.food_name} - ${n.calories || 0} cal`,
          timestamp: n.logged_at || n.created_at,
          icon: Utensils,
          color: 'text-success',
          link: '/food'
        });
      });

      // Fetch recent workouts/activities
      const { data: activities } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      activities?.forEach(a => {
        allEvents.push({
          id: a.id,
          type: 'workout',
          title: 'Activity Logged',
          description: `${a.activity_type} - ${a.duration_minutes} min`,
          timestamp: a.logged_at || a.created_at || new Date().toISOString(),
          icon: Dumbbell,
          color: 'text-secondary',
          link: '/activity'
        });
      });

      // Fetch recent wearable data (includes steps)
      const { data: wearable } = await supabase
        .from('wearable_data')
        .select('*')
        .eq('user_id', user.id)
        .order('data_date', { ascending: false })
        .limit(5);

      wearable?.forEach(w => {
        if (w.steps) {
          allEvents.push({
            id: w.id,
            type: 'steps',
            title: 'Steps Tracked',
            description: `${w.steps.toLocaleString()} steps`,
            timestamp: w.data_date,
            icon: Footprints,
            color: 'text-accent',
            link: '/step-count'
          });
        }
      });

      // Fetch recent habit completions
      const { data: habits } = await supabase
        .from('habit_completions')
        .select('*, habits(name)')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(5);

      habits?.forEach(h => {
        allEvents.push({
          id: h.id,
          type: 'habit',
          title: 'Habit Completed',
          description: (h.habits as any)?.name || 'Habit',
          timestamp: h.completed_at || new Date().toISOString(),
          icon: Target,
          color: 'text-warning',
          link: '/habits'
        });
      });

      // Fetch recent achievements
      const { data: achievements } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('achieved_at', { ascending: false })
        .limit(5);

      achievements?.forEach(a => {
        allEvents.push({
          id: a.id,
          type: 'achievement',
          title: 'Achievement Unlocked',
          description: a.achievement_type,
          timestamp: a.achieved_at,
          icon: Trophy,
          color: 'text-primary',
          link: '/achievements'
        });
      });

      // Fetch recent challenge completions
      const { data: challengeCompletions } = await supabase
        .from('challenge_completions')
        .select('*, challenges(title)')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(5);

      challengeCompletions?.forEach(c => {
        allEvents.push({
          id: c.id,
          type: 'challenge',
          title: 'Challenge Completed',
          description: (c.challenges as any)?.title || 'Challenge',
          timestamp: c.completed_at,
          icon: TrendingUp,
          color: 'text-success',
          link: '/challenges'
        });
      });

      // Sort all events by timestamp
      allEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setEvents(allEvents.slice(0, 20)); // Limit to 20 most recent events
    } catch (error) {
      console.error('Error fetching timeline events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card className="p-8 text-center">
        <ActivityIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Activity Yet</h3>
        <p className="text-muted-foreground">
          Start logging your fitness journey to see your activity timeline here!
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Calendar className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-xl font-semibold">Recent Activity</h3>
      </div>
      
      <div className="space-y-4">
        {events.map((event, index) => {
          const Icon = event.icon;
          return (
            <div
              key={`${event.type}-${event.id}-${index}`}
              className="flex gap-4 group cursor-pointer hover:bg-accent/50 p-3 rounded-lg transition-colors"
              onClick={() => event.link && navigate(event.link)}
            >
              <div className="relative">
                <div className={`p-2 bg-background border-2 rounded-lg ${event.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                {index < events.length - 1 && (
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-border" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {event.type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(event.timestamp), "MMM dd, yyyy 'at' h:mm a")}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
