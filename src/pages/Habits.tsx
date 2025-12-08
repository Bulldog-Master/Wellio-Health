import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Plus, ArrowLeft } from "lucide-react";
import { useHabits, type HabitFormData } from "@/hooks/fitness/useHabits";
import { HabitForm, HabitCard } from "@/components/fitness";

const Habits = () => {
  const { t } = useTranslation('fitness');
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<HabitFormData>({
    name: "",
    description: "",
    target_frequency: "daily",
    target_count: "1",
  });

  const { 
    habits, 
    isLoading, 
    addHabit, 
    completeHabit, 
    deleteHabit, 
    isHabitCompleted 
  } = useHabits();

  const handleAddHabit = async () => {
    const success = await addHabit(formData);
    if (success) {
      setFormData({ name: "", description: "", target_frequency: "daily", target_count: "1" });
      setShowAddForm(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/activity")}
        className="gap-2 mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('back_to_activity')}
      </Button>
      
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{t('habit_tracker')}</h1>
            <p className="text-muted-foreground mt-1">{t('build_consistent_habits')}</p>
          </div>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          {t('add_habit')}
        </Button>
      </div>

      {showAddForm && (
        <HabitForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleAddHabit}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <Card className="p-6 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">{t('todays_habits')}</h3>
        </div>
        <div className="space-y-3">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">{t('loading')}</p>
          ) : habits.length > 0 ? (
            habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                isCompleted={isHabitCompleted(habit.id)}
                onComplete={() => completeHabit(habit.id)}
                onDelete={() => deleteHabit(habit.id)}
              />
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">
              {t('no_habits_yet')}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Habits;
