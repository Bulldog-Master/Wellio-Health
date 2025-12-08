import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Edit, Trash2, Calendar, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { PersonalRecord, PRHistory } from "./types";

interface RecordCardProps {
  record: PersonalRecord;
  history: PRHistory[];
  onEdit: () => void;
  onDelete: () => void;
  t: (key: string, options?: any) => string;
}

export const RecordCard = ({ record, history, onEdit, onDelete, t }: RecordCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-4 w-4" />
              {record.exercise_name}
            </CardTitle>
            <CardDescription className="mt-1">
              {record.record_type.charAt(0).toUpperCase() + record.record_type.slice(1)} PR
            </CardDescription>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold mb-2">
          {record.record_value} {record.record_unit}
        </div>
        
        {history && history.length > 0 && (
          <div className="flex items-center gap-1 text-sm text-green-600 mb-3">
            <TrendingUp className="h-4 w-4" />
            <span>
              {t('records:improved_by', { percent: history[0].improvement_percentage?.toFixed(1) })}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {format(new Date(record.achieved_at), 'MMM d, yyyy')}
        </div>

        {record.notes && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {record.notes}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
