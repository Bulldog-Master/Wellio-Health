-- Create news_items table for dynamic news content
CREATE TABLE public.news_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  title_es TEXT,
  url TEXT NOT NULL,
  event_date TEXT,
  event_date_es TEXT,
  badge_type TEXT DEFAULT 'upcoming',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.news_items ENABLE ROW LEVEL SECURITY;

-- Everyone can view active news items
CREATE POLICY "Anyone can view active news items"
ON public.news_items
FOR SELECT
USING (is_active = true);

-- Only admins can insert news items
CREATE POLICY "Admins can insert news items"
ON public.news_items
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update news items
CREATE POLICY "Admins can update news items"
ON public.news_items
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete news items
CREATE POLICY "Admins can delete news items"
ON public.news_items
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_news_items_updated_at
BEFORE UPDATE ON public.news_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial news items from static data
INSERT INTO public.news_items (category, title, title_es, url, event_date, event_date_es, badge_type, sort_order) VALUES
-- Latest News
('latest', 'New Study: HIIT Training Improves Heart Health by 25%', 'Nuevo Estudio: Entrenamiento HIIT Mejora la Salud Cardíaca un 25%', 'https://www.healthline.com/health/fitness', 'Dec 1, 2025', '1 Dic 2025', 'recent', 1),
('latest', 'Global Fitness Industry Expected to Reach $100B by 2026', 'Industria del Fitness Alcanzará $100B para 2026', 'https://www.forbes.com/health/fitness/', 'Nov 28, 2025', '28 Nov 2025', 'recent', 2),
('latest', 'Wearable Tech Revolution: AI-Powered Fitness Trackers', 'Revolución en Tecnología Wearable: Rastreadores con IA', 'https://www.wired.com/tag/fitness/', 'Nov 25, 2025', '25 Nov 2025', 'recent', 3),

-- CrossFit
('crossfit', '2025 CrossFit Games - Madison, Wisconsin', 'CrossFit Games 2025 - Madison, Wisconsin', 'https://games.crossfit.com/', 'Aug 1-4, 2025', '1-4 Ago 2025', 'upcoming', 1),
('crossfit', 'CrossFit Open Registration Now Live', 'Inscripciones Abiertas para CrossFit Open', 'https://games.crossfit.com/open', 'Feb 15, 2025', '15 Feb 2025', 'upcoming', 2),
('crossfit', 'New Training Methodologies for Competition Prep', 'Nuevas Metodologías de Entrenamiento para Competición', 'https://www.crossfit.com/', 'Jan 10, 2025', '10 Ene 2025', 'upcoming', 3),

-- Marathons
('marathons', 'Boston Marathon 2025 - April 21', 'Maratón de Boston 2025 - 21 de Abril', 'https://www.baa.org/races/boston-marathon', 'Apr 21, 2025', '21 Abr 2025', 'upcoming', 1),
('marathons', 'NYC Marathon Results: Record-Breaking Times', 'Resultados Maratón NYC: Tiempos Récord', 'https://www.nyrr.org/tcsnycmarathon', 'Nov 3, 2024', '3 Nov 2024', 'recent', 2),
('marathons', 'Tokyo Marathon 2025 - March 2', 'Maratón de Tokio 2025 - 2 de Marzo', 'https://www.marathon.tokyo/', 'Mar 2, 2025', '2 Mar 2025', 'upcoming', 3),

-- Triathlons
('triathlons', 'Ironman World Championship - Kona 2025', 'Campeonato Mundial Ironman - Kona 2025', 'https://www.ironman.com/im-world-championship', 'Oct 11, 2025', '11 Oct 2025', 'upcoming', 1),
('triathlons', 'Olympic Triathlon Qualifiers Announced', 'Clasificatorios Olímpicos de Triatlón Anunciados', 'https://triathlon.org/', 'Jun 15, 2025', '15 Jun 2025', 'upcoming', 2),
('triathlons', '70.3 World Championship Preview', 'Vista Previa del Campeonato Mundial 70.3', 'https://www.ironman.com/im703-world-championship', 'Sep 7, 2025', '7 Sep 2025', 'upcoming', 3),

-- Cycling
('cycling', 'Tour de France 2025 Route Revealed', 'Ruta del Tour de Francia 2025 Revelada', 'https://www.letour.fr/', 'Jul 5-27, 2025', '5-27 Jul 2025', 'upcoming', 1),
('cycling', 'Giro d''Italia Stage Winners', 'Ganadores de Etapa del Giro de Italia', 'https://www.giroditalia.it/', 'May 2024', 'May 2024', 'recent', 2),
('cycling', 'UCI World Championships Update', 'Actualización Campeonatos Mundiales UCI', 'https://www.uci.org/', 'Sep 2025', 'Sep 2025', 'upcoming', 3),

-- Obstacle Racing
('obstacle', 'Spartan World Championship 2025', 'Campeonato Mundial Spartan 2025', 'https://www.spartan.com/', 'Dec 7, 2025', '7 Dic 2025', 'upcoming', 1),
('obstacle', 'Tough Mudder Classic Series Dates', 'Fechas de la Serie Tough Mudder Classic', 'https://toughmudder.com/', 'Mar-Oct 2025', 'Mar-Oct 2025', 'upcoming', 2),
('obstacle', 'HYROX World Championship Results', 'Resultados Campeonato Mundial HYROX', 'https://hyrox.com/', 'Nov 2024', 'Nov 2024', 'recent', 3),

-- MMA
('mma', 'UFC 310 Fight Card Announced', 'Cartelera UFC 310 Anunciada', 'https://www.ufc.com/', 'Dec 7, 2024', '7 Dic 2024', 'live', 1),
('mma', 'Bellator Grand Prix Finals', 'Finales Grand Prix Bellator', 'https://www.bellator.com/', 'Feb 2025', 'Feb 2025', 'upcoming', 2),
('mma', 'PFL Championship Season Preview', 'Vista Previa Temporada PFL Championship', 'https://www.pflmma.com/', '2025 Season', 'Temporada 2025', 'upcoming', 3),

-- Bodybuilding
('bodybuilding', 'Mr. Olympia 2025 - Las Vegas', 'Mr. Olympia 2025 - Las Vegas', 'https://mrolympia.com/', 'Oct 10-12, 2025', '10-12 Oct 2025', 'upcoming', 1),
('bodybuilding', 'Arnold Classic Results & Highlights', 'Resultados y Destacados del Arnold Classic', 'https://arnoldsportsfestival.com/', 'Mar 2025', 'Mar 2025', 'upcoming', 2),
('bodybuilding', 'IFBB Pro League New Divisions', 'Nuevas Divisiones de la Liga Pro IFBB', 'https://www.ifbbpro.com/', '2025', '2025', 'upcoming', 3),

-- Yoga & Wellness
('yoga', 'International Yoga Day Events Worldwide', 'Eventos del Día Internacional del Yoga', 'https://www.un.org/en/observances/yoga-day', 'Jun 21, 2025', '21 Jun 2025', 'upcoming', 1),
('yoga', 'Top Wellness Retreats for 2025', 'Mejores Retiros de Bienestar para 2025', 'https://www.yogajournal.com/', '2025', '2025', 'upcoming', 2),
('yoga', 'Mindfulness Apps: Year in Review', 'Apps de Mindfulness: Resumen del Año', 'https://www.headspace.com/', 'Dec 2024', 'Dic 2024', 'recent', 3),

-- Swimming
('swimming', 'World Aquatics Championships 2025', 'Campeonatos Mundiales de Natación 2025', 'https://www.worldaquatics.com/', 'Jul 2025', 'Jul 2025', 'upcoming', 1),
('swimming', 'Open Water Swimming World Cup', 'Copa Mundial de Natación en Aguas Abiertas', 'https://www.fina.org/', '2025 Season', 'Temporada 2025', 'upcoming', 2),
('swimming', 'Olympic Pool Records Broken', 'Récords Olímpicos de Piscina Rotos', 'https://olympics.com/en/sports/swimming', '2024', '2024', 'recent', 3),

-- Ultra Endurance
('ultra', 'Western States 100 Endurance Run', 'Western States 100 Carrera de Resistencia', 'https://www.wser.org/', 'Jun 28-29, 2025', '28-29 Jun 2025', 'upcoming', 1),
('ultra', 'Ultra-Trail du Mont-Blanc 2025', 'Ultra-Trail du Mont-Blanc 2025', 'https://utmbmontblanc.com/', 'Aug 25, 2025', '25 Ago 2025', 'upcoming', 2),
('ultra', 'Badwater 135 Desert Challenge', 'Badwater 135 Desafío del Desierto', 'https://www.badwater.com/', 'Jul 2025', 'Jul 2025', 'upcoming', 3),

-- Global Events
('global', 'Paris 2024 Olympic Legacy Programs', 'Programas de Legado Olímpico París 2024', 'https://olympics.com/en/paris-2024', 'Ongoing', 'En Curso', 'recent', 1),
('global', 'LA 2028 Olympics Venue Updates', 'Actualizaciones de Sedes Olimpiadas LA 2028', 'https://la28.org/', '2028', '2028', 'upcoming', 2),
('global', 'World Games 2025 Schedule Released', 'Calendario de los Juegos Mundiales 2025', 'https://www.theworldgames.org/', 'Aug 2025', 'Ago 2025', 'upcoming', 3);