import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sun, 
  Cloud, 
  Droplets, 
  Wind, 
  Thermometer, 
  MapPin,
  RefreshCw,
  AlertTriangle,
  Shirt,
  Clock,
  Home
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EnvironmentalData {
  overallScore: number;
  outdoorRecommendation: string;
  bestWorkoutTypes: string[];
  warnings: string[];
  hydrationAdvice: string;
  clothingAdvice: string;
  bestTimeToWorkout: string[];
  indoorAlternatives: string[];
  uvProtection: string;
  airQualityNote: string;
  currentWeather: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    uvIndex: number;
    precipitation: number;
    weatherCode: number;
  };
}

export const EnvironmentalIntelligence: React.FC = () => {
  const { t } = useTranslation(['fitness', 'common']);
  const [data, setData] = useState<EnvironmentalData | null>(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    requestLocation();
  }, []);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationError(null);
      },
      (error) => {
        setLocationError(error.message);
      }
    );
  };

  const analyzeEnvironment = async () => {
    if (!location) {
      toast.error(t('common:location_required'));
      return;
    }

    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('environmental-fitness', {
        body: {
          latitude: location.lat,
          longitude: location.lng,
          userPreferences: {}
        }
      });

      if (error) throw error;
      setData(result);
      toast.success(t('analysis_complete'));
    } catch (error) {
      console.error('Environmental analysis error:', error);
      toast.error(t('common:error'));
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'moderate': return 'bg-yellow-500';
      case 'poor': return 'bg-orange-500';
      case 'avoid': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getWeatherIcon = (code: number) => {
    if (code === 0) return <Sun className="w-8 h-8 text-yellow-500" />;
    if (code < 50) return <Cloud className="w-8 h-8 text-gray-400" />;
    return <Droplets className="w-8 h-8 text-blue-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Location Status */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="font-medium">
              {location 
                ? `${location.lat.toFixed(2)}°, ${location.lng.toFixed(2)}°`
                : t('location_not_available')
              }
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={requestLocation}>
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('common:refresh')}
          </Button>
        </div>
        {locationError && (
          <p className="text-sm text-destructive mt-2">{locationError}</p>
        )}
      </Card>

      {/* Analyze Button */}
      {!data && (
        <Button 
          onClick={analyzeEnvironment} 
          disabled={loading || !location}
          className="w-full"
          size="lg"
        >
          {loading ? t('analyzing_environment') : t('analyze_environment')}
        </Button>
      )}

      {data && (
        <>
          {/* Current Weather */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t('current_conditions')}</h3>
              {getWeatherIcon(data.currentWeather.weatherCode)}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{data.currentWeather.temperature}°C</p>
                  <p className="text-xs text-muted-foreground">
                    {t('feels_like')} {data.currentWeather.feelsLike}°C
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-lg font-semibold">{data.currentWeather.humidity}%</p>
                  <p className="text-xs text-muted-foreground">{t('humidity')}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Wind className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-lg font-semibold">{data.currentWeather.windSpeed} km/h</p>
                  <p className="text-xs text-muted-foreground">{t('wind')}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-lg font-semibold">{data.currentWeather.uvIndex}</p>
                  <p className="text-xs text-muted-foreground">{t('uv_index')}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Fitness Score */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t('outdoor_fitness_score')}</h3>
              <Badge className={getRecommendationColor(data.outdoorRecommendation)}>
                {t(`recommendation_${data.outdoorRecommendation}`)}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t('conditions_suitability')}</span>
                <span className="font-semibold">{data.overallScore}/100</span>
              </div>
              <Progress value={data.overallScore} className="h-3" />
            </div>
          </Card>

          {/* Warnings */}
          {data.warnings.length > 0 && (
            <Card className="p-4 border-yellow-500/50 bg-yellow-500/10">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-700 dark:text-yellow-400">
                    {t('weather_warnings')}
                  </h4>
                  <ul className="mt-2 space-y-1">
                    {data.warnings.map((warning, i) => (
                      <li key={i} className="text-sm">{warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          )}

          {/* Best Workout Types */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t('recommended_workouts')}</h3>
            <div className="flex flex-wrap gap-2">
              {data.bestWorkoutTypes.map((type, i) => (
                <Badge key={i} variant="secondary">{type}</Badge>
              ))}
            </div>
          </Card>

          {/* Best Times */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">{t('best_workout_times')}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.bestTimeToWorkout.map((time, i) => (
                <Badge key={i} variant="outline">{time}</Badge>
              ))}
            </div>
          </Card>

          {/* Clothing Advice */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shirt className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">{t('clothing_advice')}</h3>
            </div>
            <p className="text-muted-foreground">{data.clothingAdvice}</p>
          </Card>

          {/* Hydration */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Droplets className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold">{t('hydration_advice')}</h3>
            </div>
            <p className="text-muted-foreground">{data.hydrationAdvice}</p>
          </Card>

          {/* Indoor Alternatives */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Home className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">{t('indoor_alternatives')}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.indoorAlternatives.map((alt, i) => (
                <Badge key={i} variant="outline">{alt}</Badge>
              ))}
            </div>
          </Card>

          {/* UV Protection */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sun className="w-5 h-5 text-yellow-500" />
              <h3 className="text-lg font-semibold">{t('uv_protection')}</h3>
            </div>
            <p className="text-muted-foreground">{data.uvProtection}</p>
          </Card>

          {/* Refresh */}
          <Button 
            onClick={analyzeEnvironment} 
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {t('refresh_analysis')}
          </Button>
        </>
      )}
    </div>
  );
};
