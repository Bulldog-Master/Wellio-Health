-- Performance optimization: Add indices for frequently queried columns

-- Posts table indices
CREATE INDEX IF NOT EXISTS idx_posts_user_id_created_at ON public.posts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_is_public_created_at ON public.posts(is_public, created_at DESC) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_posts_post_type ON public.posts(post_type);

-- Nutrition logs indices
CREATE INDEX IF NOT EXISTS idx_nutrition_logs_user_id_logged_at ON public.nutrition_logs(user_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_nutrition_logs_meal_type ON public.nutrition_logs(meal_type);

-- Activity logs indices  
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id_logged_at ON public.activity_logs(user_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_activity_type ON public.activity_logs(activity_type);

-- Medical records indices
CREATE INDEX IF NOT EXISTS idx_medical_records_user_id_record_date ON public.medical_records(user_id, record_date DESC);
CREATE INDEX IF NOT EXISTS idx_medical_test_results_user_id_test_date ON public.medical_test_results(user_id, test_date DESC);
CREATE INDEX IF NOT EXISTS idx_medications_user_id_is_active ON public.medications(user_id, is_active) WHERE is_active = true;

-- Follows and social indices
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id_post_id ON public.post_likes(user_id, post_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id_created_at ON public.comments(post_id, created_at DESC);

-- Notifications indices
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_is_read ON public.notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Messages and conversations indices
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id_created_at ON public.messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_participant1_last_message ON public.conversations(participant1_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_participant2_last_message ON public.conversations(participant2_id, last_message_at DESC);

-- Challenges and leaderboard indices
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge_id ON public.challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user_id ON public.challenge_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_type_period ON public.leaderboard_entries(leaderboard_type, period_start, period_end, rank);

-- Habits and completions indices
CREATE INDEX IF NOT EXISTS idx_habits_user_id_is_active ON public.habits(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_id_completed_at ON public.habit_completions(habit_id, completed_at DESC);

-- Bookmarks and hashtags indices
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id_created_at ON public.bookmarks(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_hashtags_hashtag ON public.post_hashtags(hashtag);
CREATE INDEX IF NOT EXISTS idx_post_hashtags_post_id ON public.post_hashtags(post_id);

-- Workout and programs indices
CREATE INDEX IF NOT EXISTS idx_program_enrollments_user_id_status ON public.program_enrollments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_program_exercises_program_id_week_day ON public.program_exercises(program_id, week_number, day_number);

-- Stories indices
CREATE INDEX IF NOT EXISTS idx_stories_user_id_created_at ON public.stories(user_id, created_at DESC);

-- Fundraisers indices
CREATE INDEX IF NOT EXISTS idx_fundraisers_user_id ON public.fundraisers(user_id);
CREATE INDEX IF NOT EXISTS idx_fundraisers_status_end_date ON public.fundraisers(status, end_date);
CREATE INDEX IF NOT EXISTS idx_fundraiser_donations_fundraiser_id ON public.fundraiser_donations(fundraiser_id);

-- Groups indices
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_posts_group_id ON public.group_posts(group_id);

-- Profile indices
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username) WHERE username IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code) WHERE referral_code IS NOT NULL;