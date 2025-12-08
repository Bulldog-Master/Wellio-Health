import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import { MedicalAuthGate } from "@/components/MedicalAuthGate";
import { useMedicalData, useMedicalMutations } from "@/hooks/medical";
import {
  MedicationsTab,
  SymptomsTab,
  TestResultsTab,
  MedicalRecordsTab,
} from "@/components/medical";

const MedicalHistory = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['medical', 'errors']);
  
  const {
    medications,
    testResults,
    medicalRecords,
    symptoms,
    isLoading,
    refetchMedications,
    refetchTestResults,
    refetchMedicalRecords,
    refetchSymptoms,
  } = useMedicalData();

  const {
    addMedication,
    addTestResult,
    addMedicalRecord,
    addSymptom,
    deleteSymptom,
    isUploadingTest,
    isUploadingRecord,
  } = useMedicalMutations({
    onMedicationAdded: refetchMedications,
    onTestResultAdded: refetchTestResults,
    onMedicalRecordAdded: refetchMedicalRecords,
    onSymptomAdded: refetchSymptoms,
    onSymptomDeleted: refetchSymptoms,
  });

  return (
    <SubscriptionGate feature="medical_records">
      <MedicalAuthGate>
        <div className="space-y-6 max-w-4xl pb-20 md:pb-0">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/settings')}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-xl">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{t('medical:health')}</h1>
                <p className="text-muted-foreground">{t('medical:track_medications_tests')}</p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="medications" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="medications">{t('medical:medications')}</TabsTrigger>
              <TabsTrigger value="symptoms">{t('medical:symptoms')}</TabsTrigger>
              <TabsTrigger value="tests">{t('medical:test_results')}</TabsTrigger>
              <TabsTrigger value="records">{t('medical:medical_records')}</TabsTrigger>
            </TabsList>

            <TabsContent value="medications">
              <MedicationsTab
                medications={medications}
                isLoading={isLoading}
                onAddMedication={addMedication}
              />
            </TabsContent>

            <TabsContent value="symptoms">
              <SymptomsTab
                symptoms={symptoms}
                isLoading={isLoading}
                onAddSymptom={addSymptom}
                onDeleteSymptom={deleteSymptom}
              />
            </TabsContent>

            <TabsContent value="tests">
              <TestResultsTab
                testResults={testResults}
                isLoading={isLoading}
                isUploading={isUploadingTest}
                onAddTestResult={addTestResult}
              />
            </TabsContent>

            <TabsContent value="records">
              <MedicalRecordsTab
                medicalRecords={medicalRecords}
                isLoading={isLoading}
                isUploading={isUploadingRecord}
                onAddMedicalRecord={addMedicalRecord}
              />
            </TabsContent>
          </Tabs>
        </div>
      </MedicalAuthGate>
    </SubscriptionGate>
  );
};

export default MedicalHistory;
