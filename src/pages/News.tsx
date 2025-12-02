import { useTranslation } from "react-i18next";
import { ArrowLeft, Newspaper, Trophy, Dumbbell, Bike, Footprints, Waves, Mountain, Heart, Swords, Globe, Flame, Medal, Timer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/SEOHead";

const News = () => {
  const { t } = useTranslation(['common', 'news']);
  const navigate = useNavigate();

  const newsCategories = [
    { 
      id: 'latest',
      icon: Newspaper, 
      titleKey: 'news:categories.latest_news',
      descKey: 'news:categories.latest_news_desc',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    { 
      id: 'crossfit',
      icon: Dumbbell, 
      titleKey: 'news:categories.crossfit',
      descKey: 'news:categories.crossfit_desc',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    },
    { 
      id: 'marathons',
      icon: Footprints, 
      titleKey: 'news:categories.marathons',
      descKey: 'news:categories.marathons_desc',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    { 
      id: 'triathlons',
      icon: Medal, 
      titleKey: 'news:categories.triathlons',
      descKey: 'news:categories.triathlons_desc',
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10'
    },
    { 
      id: 'cycling',
      icon: Bike, 
      titleKey: 'news:categories.cycling',
      descKey: 'news:categories.cycling_desc',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    },
    { 
      id: 'obstacle',
      icon: Mountain, 
      titleKey: 'news:categories.obstacle_racing',
      descKey: 'news:categories.obstacle_racing_desc',
      color: 'text-amber-600',
      bgColor: 'bg-amber-600/10'
    },
    { 
      id: 'mma',
      icon: Swords, 
      titleKey: 'news:categories.mma',
      descKey: 'news:categories.mma_desc',
      color: 'text-red-500',
      bgColor: 'bg-red-500/10'
    },
    { 
      id: 'bodybuilding',
      icon: Trophy, 
      titleKey: 'news:categories.bodybuilding',
      descKey: 'news:categories.bodybuilding_desc',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    { 
      id: 'yoga',
      icon: Heart, 
      titleKey: 'news:categories.yoga_wellness',
      descKey: 'news:categories.yoga_wellness_desc',
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10'
    },
    { 
      id: 'swimming',
      icon: Waves, 
      titleKey: 'news:categories.swimming',
      descKey: 'news:categories.swimming_desc',
      color: 'text-sky-500',
      bgColor: 'bg-sky-500/10'
    },
    { 
      id: 'ultra',
      icon: Flame, 
      titleKey: 'news:categories.ultra_endurance',
      descKey: 'news:categories.ultra_endurance_desc',
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10'
    },
    { 
      id: 'global',
      icon: Globe, 
      titleKey: 'news:categories.global_events',
      descKey: 'news:categories.global_events_desc',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10'
    },
  ];

  return (
    <>
      <SEOHead 
        titleKey="page_title"
        descriptionKey="page_description"
        namespace="news"
      />
      <div className="min-h-screen bg-background p-4 md:p-6 pb-24 md:pb-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              aria-label={t('common:back')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{t('news:title')}</h1>
              <p className="text-muted-foreground">{t('news:subtitle')}</p>
            </div>
          </div>

          {/* Global Badge */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Globe className="h-3 w-3" />
              {t('news:global_coverage')}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Timer className="h-3 w-3" />
              {t('news:updated_daily')}
            </Badge>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {newsCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Card 
                  key={category.id}
                  className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-border/50"
                >
                  <CardHeader className="pb-2">
                    <div className={`w-12 h-12 rounded-xl ${category.bgColor} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                      <Icon className={`h-6 w-6 ${category.color}`} />
                    </div>
                    <CardTitle className="text-lg">{t(category.titleKey)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="line-clamp-2">
                      {t(category.descKey)}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Coming Soon Notice */}
          <Card className="bg-muted/50 border-dashed">
            <CardContent className="py-8 text-center">
              <Newspaper className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('news:coming_soon_title')}</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {t('news:coming_soon_desc')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default News;
