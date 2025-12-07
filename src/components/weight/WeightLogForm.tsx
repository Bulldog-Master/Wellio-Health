import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useTranslation } from "react-i18next";

interface WeightLogFormProps {
  morning: string;
  setMorning: (val: string) => void;
  evening: string;
  setEvening: (val: string) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  preferredUnit: 'imperial' | 'metric';
  onLogWeight: (period: "morning" | "evening") => void;
}

export const WeightLogForm = ({
  morning,
  setMorning,
  evening,
  setEvening,
  selectedDate,
  setSelectedDate,
  preferredUnit,
  onLogWeight,
}: WeightLogFormProps) => {
  const { t, i18n } = useTranslation('weight');
  const dateLocale = i18n.language === 'es' ? es : undefined;

  return (
    <Card className="p-6 bg-gradient-card shadow-md">
      <h3 className="text-lg font-semibold mb-4">{t('log_weight')}</h3>
      <div className="space-y-4">
        <div>
          <Label>{t('select_date')}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start mt-1">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, "PPP", { locale: dateLocale })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="morning">{t('morning')}</Label>
          <div className="flex gap-2">
            <Input
              id="morning"
              type="number"
              step="0.1"
              placeholder={preferredUnit === 'imperial' ? "lbs" : "kg"}
              value={morning}
              onChange={(e) => setMorning(e.target.value)}
            />
            <Button onClick={() => onLogWeight("morning")} size="icon">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="evening">{t('evening')}</Label>
          <div className="flex gap-2">
            <Input
              id="evening"
              type="number"
              step="0.1"
              placeholder={preferredUnit === 'imperial' ? "lbs" : "kg"}
              value={evening}
              onChange={(e) => setEvening(e.target.value)}
            />
            <Button onClick={() => onLogWeight("evening")} size="icon">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
