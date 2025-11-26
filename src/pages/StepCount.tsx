import { Card } from '@/components/ui/card';
import { ChevronRight, Footprints, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

const StepCount = () => {
  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Summary Header */}
      <div className="px-6 pt-6 pb-4">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {format(new Date(), 'EEEE, MMM dd').toUpperCase()}
        </p>
        <h1 className="text-5xl font-bold mt-1">Summary</h1>
      </div>

      <div className="space-y-3 px-6">
        {/* Activity Ring Card - Coming Soon */}
        <Card className="bg-card/50 backdrop-blur border-border/50 overflow-hidden opacity-60">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-6">Activity Ring</h2>
            <div className="flex items-center gap-8">
              <div className="relative w-32 h-32 flex-shrink-0">
                <div className="w-full h-full rounded-full border-8 border-muted/30" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-1">Move</h3>
                <p className="text-3xl font-bold text-muted-foreground">
                  ---/---
                  <span className="text-xl">CAL</span>
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Step Count Card - Coming Soon */}
        <Card className="bg-card/50 backdrop-blur border-border/50 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Step Count</h2>
              <ChevronRight className="w-6 h-6 text-muted-foreground" />
            </div>
            
            <div className="text-center py-12 space-y-4">
              <div className="w-24 h-24 mx-auto rounded-full bg-muted/30 flex items-center justify-center">
                <Footprints className="w-12 h-12 text-muted-foreground/50" />
              </div>
              <div>
                <p className="font-bold text-2xl">Coming Soon!</p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2">
                  Automatic step tracking with wearable device integration is on the way. Track your daily steps, distance, and activity patterns.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Step Distance Card - Coming Soon */}
        <Card className="bg-card/50 backdrop-blur border-border/50 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Step Distance</h2>
              <ChevronRight className="w-6 h-6 text-muted-foreground" />
            </div>
            
            <div className="text-center py-12 space-y-4">
              <div className="w-24 h-24 mx-auto rounded-full bg-muted/30 flex items-center justify-center">
                <TrendingUp className="w-12 h-12 text-muted-foreground/50" />
              </div>
              <div>
                <p className="font-bold text-2xl">Coming Soon!</p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2">
                  View your walking and running distances calculated from your step count throughout the day.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Sessions Card - Coming Soon */}
        <Card className="bg-card/50 backdrop-blur border-border/50 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Sessions</h2>
              <ChevronRight className="w-6 h-6 text-muted-foreground" />
            </div>
            
            <p className="text-center text-muted-foreground py-8">
              No sessions recorded.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StepCount;
