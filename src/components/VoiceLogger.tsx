import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mic, MicOff, Loader2, Check, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface VoiceLoggerProps {
  logType: 'workout' | 'meal' | 'weight' | 'steps';
  onDataExtracted: (data: Record<string, unknown>) => void;
  onClose: () => void;
  isOpen: boolean;
}

const VoiceLogger = ({ logType, onDataExtracted, onClose, isOpen }: VoiceLoggerProps) => {
  const { t } = useTranslation(['common', 'fitness', 'food']);
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<Record<string, unknown> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: t('common:error'),
        description: t('microphone_access_denied'),
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
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
      });
      reader.readAsDataURL(audioBlob);
      const audioBase64 = await base64Promise;

      const response = await supabase.functions.invoke('voice-to-text', {
        body: { audioBase64, logType },
      });

      if (response.error) throw response.error;

      if (response.data.success) {
        setExtractedData(response.data.data);
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error('Voice processing error:', error);
      toast({
        title: t('common:error'),
        description: t('voice_processing_failed'),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmData = () => {
    if (extractedData) {
      onDataExtracted(extractedData);
      setExtractedData(null);
      onClose();
    }
  };

  const retryRecording = () => {
    setExtractedData(null);
  };

  const getLogTypeLabel = () => {
    switch (logType) {
      case 'workout': return t('fitness:workout');
      case 'meal': return t('food:meal');
      case 'weight': return t('common:weight');
      case 'steps': return t('common:steps');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5" />
            {t('voice_log')} {getLogTypeLabel()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!extractedData ? (
            <div className="flex flex-col items-center py-8">
              {isProcessing ? (
                <>
                  <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
                  <p className="text-muted-foreground">{t('processing_voice')}</p>
                </>
              ) : (
                <>
                  <Button
                    size="lg"
                    variant={isRecording ? "destructive" : "default"}
                    className={`w-24 h-24 rounded-full ${isRecording ? 'animate-pulse' : ''}`}
                    onClick={isRecording ? stopRecording : startRecording}
                  >
                    {isRecording ? (
                      <MicOff className="w-10 h-10" />
                    ) : (
                      <Mic className="w-10 h-10" />
                    )}
                  </Button>
                  <p className="text-muted-foreground mt-4">
                    {isRecording ? t('tap_to_stop') : t('tap_to_record')}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2 text-center max-w-xs">
                    {t('voice_log_hint', { type: getLogTypeLabel() })}
                  </p>
                </>
              )}
            </div>
          ) : (
            <Card className="p-4 bg-muted/50">
              <h3 className="font-semibold mb-3">{t('extracted_data')}</h3>
              <div className="space-y-2 text-sm">
                {Object.entries(extractedData).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-muted-foreground capitalize">
                      {key.replace(/_/g, ' ')}:
                    </span>
                    <span className="font-medium">{String(value)}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={confirmData} className="flex-1">
                  <Check className="w-4 h-4 mr-2" />
                  {t('common:confirm')}
                </Button>
                <Button variant="outline" onClick={retryRecording} className="flex-1">
                  <X className="w-4 h-4 mr-2" />
                  {t('retry')}
                </Button>
              </div>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceLogger;
