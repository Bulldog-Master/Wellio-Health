-- Create recipe_collaborations table
CREATE TABLE public.recipe_collaborations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  collaborator_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('owner', 'editor', 'viewer')),
  invited_by UUID NOT NULL,
  accepted BOOLEAN DEFAULT false,
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(recipe_id, collaborator_id)
);

-- Create recipe_versions table for tracking changes
CREATE TABLE public.recipe_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
  instructions TEXT NOT NULL,
  prep_time INTEGER,
  cook_time INTEGER,
  servings INTEGER,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  change_notes TEXT
);

-- Create recipe_remixes table
CREATE TABLE public.recipe_remixes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  remixed_recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  remix_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(original_recipe_id, remixed_recipe_id)
);

-- Create recipe_comments table
CREATE TABLE public.recipe_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  comment TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.recipe_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create recipe_shares table
CREATE TABLE public.recipe_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL,
  shared_with UUID,
  share_type TEXT NOT NULL DEFAULT 'public' CHECK (share_type IN ('public', 'friends', 'specific')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add collaboration fields to recipes table
ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS is_collaborative BOOLEAN DEFAULT false;
ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;
ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS allow_remixing BOOLEAN DEFAULT true;
ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS version_number INTEGER DEFAULT 1;

-- Enable Row Level Security
ALTER TABLE public.recipe_collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_remixes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recipe_collaborations
CREATE POLICY "Users can view collaborations for recipes they have access to"
ON public.recipe_collaborations FOR SELECT
USING (
  auth.uid() = collaborator_id
  OR auth.uid() = invited_by
  OR EXISTS (
    SELECT 1 FROM public.recipes 
    WHERE id = recipe_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Recipe owners can manage collaborations"
ON public.recipe_collaborations FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.recipes 
    WHERE id = recipe_id AND user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.recipes 
    WHERE id = recipe_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Collaborators can update their own status"
ON public.recipe_collaborations FOR UPDATE
USING (auth.uid() = collaborator_id);

-- RLS Policies for recipe_versions
CREATE POLICY "Users can view versions of accessible recipes"
ON public.recipe_versions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.recipes 
    WHERE id = recipe_id 
    AND (is_public = true OR user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.recipe_collaborations 
      WHERE recipe_id = recipes.id AND collaborator_id = auth.uid() AND accepted = true
    ))
  )
);

CREATE POLICY "Collaborators can create versions"
ON public.recipe_versions FOR INSERT
WITH CHECK (
  auth.uid() = created_by
  AND (
    EXISTS (
      SELECT 1 FROM public.recipes 
      WHERE id = recipe_id AND user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.recipe_collaborations 
      WHERE recipe_id = recipe_versions.recipe_id 
      AND collaborator_id = auth.uid() 
      AND accepted = true 
      AND role IN ('owner', 'editor')
    )
  )
);

-- RLS Policies for recipe_remixes
CREATE POLICY "Anyone can view public recipe remixes"
ON public.recipe_remixes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.recipes 
    WHERE id = original_recipe_id AND is_public = true
  )
);

CREATE POLICY "Users can create remixes of allowed recipes"
ON public.recipe_remixes FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.recipes 
    WHERE id = remixed_recipe_id AND user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM public.recipes 
    WHERE id = original_recipe_id AND allow_remixing = true
  )
);

-- RLS Policies for recipe_comments
CREATE POLICY "Users can view comments on accessible recipes"
ON public.recipe_comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.recipes 
    WHERE id = recipe_id 
    AND (is_public = true OR user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.recipe_collaborations 
      WHERE recipe_id = recipes.id AND collaborator_id = auth.uid() AND accepted = true
    ))
  )
);

CREATE POLICY "Users can create comments"
ON public.recipe_comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
ON public.recipe_comments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
ON public.recipe_comments FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for recipe_shares
CREATE POLICY "Users can view shares they created or received"
ON public.recipe_shares FOR SELECT
USING (
  auth.uid() = shared_by 
  OR auth.uid() = shared_with
  OR share_type = 'public'
);

CREATE POLICY "Users can create shares for their recipes"
ON public.recipe_shares FOR INSERT
WITH CHECK (
  auth.uid() = shared_by
  AND EXISTS (
    SELECT 1 FROM public.recipes 
    WHERE id = recipe_id AND user_id = auth.uid()
  )
);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_recipe_comments_updated_at
BEFORE UPDATE ON public.recipe_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.recipe_collaborations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.recipe_comments;