import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePersonalRecords } from "@/hooks/personal-records";
import { 
  RecordCard, 
  RecordFormDialog, 
  exerciseCategories, 
  defaultFormData,
  PersonalRecord,
  PRFormData
} from "@/components/personal-records";

const PersonalRecords = () => {
  const { t } = useTranslation(['records', 'errors']);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [editingRecord, setEditingRecord] = useState<PersonalRecord | null>(null);
  const [formData, setFormData] = useState<PRFormData>(defaultFormData);

  const { records, history, loading, saveRecord, deleteRecord } = usePersonalRecords();

  const handleSubmit = async () => {
    const success = await saveRecord(formData, editingRecord);
    if (success) {
      setIsDialogOpen(false);
      setEditingRecord(null);
      setFormData(defaultFormData);
    }
  };

  const handleEdit = (record: PersonalRecord) => {
    setEditingRecord(record);
    setFormData({
      exercise_name: record.exercise_name,
      exercise_category: record.exercise_category,
      record_type: record.record_type,
      record_value: record.record_value.toString(),
      record_unit: record.record_unit,
      notes: record.notes || "",
      achieved_at: record.achieved_at.split('T')[0],
    });
    setIsDialogOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingRecord(null);
      setFormData(defaultFormData);
    }
  };

  const filteredRecords = records.filter((record) => 
    filterCategory === "all" || record.exercise_category === filterCategory
  );

  const groupedRecords = filteredRecords.reduce((acc: Record<string, PersonalRecord[]>, record) => {
    if (!acc[record.exercise_category]) {
      acc[record.exercise_category] = [];
    }
    acc[record.exercise_category].push(record);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            {t('records:personal_records')}
          </h1>
          <p className="text-muted-foreground">{t('records:track_best_performances')}</p>
        </div>
        <RecordFormDialog
          open={isDialogOpen}
          onOpenChange={handleOpenChange}
          formData={formData}
          setFormData={setFormData}
          isEditing={!!editingRecord}
          onSubmit={handleSubmit}
          t={t}
        />
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <Button
          variant={filterCategory === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterCategory("all")}
        >
          {t('records:all')}
        </Button>
        {exerciseCategories.map((cat) => (
          <Button
            key={cat.value}
            variant={filterCategory === cat.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterCategory(cat.value)}
          >
            {cat.icon} {t(`records:${cat.value}`)}
          </Button>
        ))}
      </div>

      {filteredRecords.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">{t('records:no_records_yet')}</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              {t('records:start_tracking')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedRecords).map(([category, categoryRecords]) => {
            const categoryInfo = exerciseCategories.find(c => c.value === category);
            
            return (
              <div key={category}>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span>{categoryInfo?.icon}</span>
                  {t(`records:${categoryInfo?.value}`)}
                  <Badge variant="secondary">{categoryRecords.length}</Badge>
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categoryRecords.map((record) => (
                    <RecordCard
                      key={record.id}
                      record={record}
                      history={history[record.id] || []}
                      onEdit={() => handleEdit(record)}
                      onDelete={() => deleteRecord(record.id)}
                      t={t}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PersonalRecords;
