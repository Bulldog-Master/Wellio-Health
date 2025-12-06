import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2, Check, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ExtractedWorkout {
  activity_type: string;
  duration_minutes: number;
  calories_burned?: number;
  notes?: string;
}

interface VoiceWorkoutLoggerProps {
  onWorkoutLogged?: (workout: ExtractedWorkout) => void;
}

const VoiceWorkoutLogger = ({ onWorkoutLogged }: VoiceWorkoutLoggerProps) => {
  const { t } = useTranslation(['voice', 'fitness', 'common']);
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedWorkout | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast({
        title: t('voice:recording_started'),
        description: t('voice:speak_into_microphone'),
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: t('voice:error'),
        description: t('voice:could_not_access_microphone', { error: String(error) }),
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      // Convert blob to base64
      const reader = new FileReader();
      const base64Audio = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

      // Send to voice-to-text edge function
      const { data, error } = await supabase.functions.invoke('voice-to-text', {
        body: { 
          audioBase64: base64Audio,
          logType: 'workout'
        }
      });

      if (error) throw error;

      if (data?.success && data?.data) {
        const workout = data.data;
        setTranscript(workout.notes || 'Voice workout logged');
        setExtractedData({
          activity_type: workout.activity_type || 'General',
          duration_minutes: workout.duration_minutes || 30,
          calories_burned: workout.calories_burned,
          notes: workout.notes
        });
      } else if (data?.error) {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        title: t('common:error'),
        description: t('fitness:failed_to_process_voice'),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmAndSave = async () => {
    if (!extractedData) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: t('common:error'),
          description: t('fitness:authentication_required'),
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          activity_type: extractedData.activity_type,
          duration_minutes: extractedData.duration_minutes,
          calories_burned: extractedData.calories_burned,
          notes: extractedData.notes,
          logged_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: t('fitness:workout_logged'),
        description: t('fitness:voice_workout_saved'),
      });

      onWorkoutLogged?.(extractedData);
      resetState();
    } catch (error) {
      console.error('Error saving workout:', error);
      toast({
        title: t('common:error'),
        description: t('fitness:failed_to_save'),
        variant: "destructive",
      });
    }
  };

  const resetState = () => {
    setExtractedData(null);
    setTranscript("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="w-5 h-5 text-primary" />
          {t('fitness:voice_workout_logging')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!extractedData ? (
          <>
            <p className="text-sm text-muted-foreground">
              {t('fitness:voice_logging_description')}
            </p>

            <div className="flex justify-center">
              <Button
                size="lg"
                variant={isRecording ? "destructive" : "default"}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className="w-32 h-32 rounded-full"
              >
                {isProcessing ? (
                  <Loader2 className="w-12 h-12 animate-spin" />
                ) : isRecording ? (
                  <MicOff className="w-12 h-12" />
                ) : (
                  <Mic className="w-12 h-12" />
                )}
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              {isProcessing 
                ? t('fitness:processing_voice')
                : isRecording 
                  ? t('voice:recording')
                  : t('fitness:tap_to_record')
              }
            </p>

            <div className="text-center text-xs text-muted-foreground">
              <p>{t('fitness:voice_example')}</p>
              <p className="italic mt-1">"{t('fitness:voice_example_text')}"</p>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">{t('fitness:you_said')}:</p>
              <p className="italic">"{transcript}"</p>
            </div>

            <div className="p-4 bg-primary/10 rounded-lg space-y-2">
              <h4 className="font-semibold">{t('fitness:extracted_workout')}:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">{t('fitness:activity')}:</span>
                <span className="font-medium">{extractedData.activity_type}</span>
                
                <span className="text-muted-foreground">{t('fitness:duration')}:</span>
                <span className="font-medium">{extractedData.duration_minutes} {t('fitness:min')}</span>
                
                {extractedData.calories_burned && (
                  <>
                    <span className="text-muted-foreground">{t('fitness:calories')}:</span>
                    <span className="font-medium">{extractedData.calories_burned}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={confirmAndSave} className="flex-1">
                <Check className="w-4 h-4 mr-2" />
                {t('fitness:confirm_log')}
              </Button>
              <Button variant="outline" onClick={resetState}>
                <RotateCcw className="w-4 h-4 mr-2" />
                {t('fitness:retry')}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VoiceWorkoutLogger;
