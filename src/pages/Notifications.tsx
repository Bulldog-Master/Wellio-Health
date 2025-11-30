import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, UserPlus, Check, AtSign, UserCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface Notification {
  id: string;
  type: string;
  is_read: boolean;
  created_at: string;
  post_id: string | null;
  actor: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
}

const Notifications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation(['notifications', 'common']);
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data: notifs, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch actor profiles separately
      const actorIds = [...new Set(notifs.map((n) => n.actor_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .in("id", actorIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      return notifs.map((n) => ({
        ...n,
        actor: profileMap.get(n.actor_id) || {
          id: n.actor_id,
          username: null,
          full_name: null,
          avatar_url: null,
        },
      })) as Notification[];
    },
  });

  // Real-time subscription
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("notifications-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
          queryClient.invalidateQueries({ queryKey: ["unread-count"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("is_read", false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });
      toast({ title: t('notifications:all_notifications_read') });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="h-5 w-5 text-red-500" />;
      case "comment":
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case "follow":
        return <UserPlus className="h-5 w-5 text-green-500" />;
      case "mention":
        return <AtSign className="h-5 w-5 text-purple-500" />;
      case "follow_request":
        return <UserCheck className="h-5 w-5 text-orange-500" />;
      default:
        return null;
    }
  };

  const getNotificationText = (notification: Notification) => {
    const actorName = notification.actor.full_name || notification.actor.username || t('notifications:someone');
    switch (notification.type) {
      case "like":
        return t('notifications:liked_your_post', { name: actorName });
      case "comment":
        return t('notifications:commented_on_post', { name: actorName });
      case "follow":
        return t('notifications:started_following', { name: actorName });
      case "mention":
        return t('notifications:mentioned_you', { name: actorName });
      case "follow_request":
        return t('notifications:wants_to_follow', { name: actorName });
      default:
        return t('notifications:new_notification');
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead.mutate(notification.id);
    
    if (notification.type === "follow" || notification.type === "follow_request") {
      navigate(`/user/${notification.actor.id}`);
    } else if (notification.post_id) {
      navigate("/feed");
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">{t('notifications:notifications')}</h1>
        <p className="text-muted-foreground">{t('notifications:loading_notifications')}</p>
      </div>
    );
  }

  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0;

  return (
    <div className="container max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('notifications:notifications')}</h1>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllAsRead.mutate()}>
            <Check className="h-4 w-4 mr-2" />
            {t('notifications:mark_all_as_read')}
          </Button>
        )}
      </div>

      {!notifications || notifications.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            {t('notifications:no_notifications_yet')}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`cursor-pointer transition-colors hover:bg-accent/50 ${
                !notification.is_read ? "bg-accent/20" : ""
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={notification.actor.avatar_url || ""} />
                    <AvatarFallback>
                      {notification.actor.full_name?.[0] || notification.actor.username?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {getNotificationIcon(notification.type)}
                      <p className="text-sm">{getNotificationText(notification)}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
