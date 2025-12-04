import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Plus, Pill, Upload, FolderOpen, AlertCircle, Trash2, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { 
  medicationSchema, 
  testResultSchema, 
  medicalRecordSchema, 
  symptomSchema, 
  validateAndSanitize 
} from "@/lib/validationSchemas";
import { uploadMedicalFile, getSignedMedicalFileUrl } from "@/lib/medicalFileStorage";
import { useTranslation } from "react-i18next";
import { SubscriptionGate } from "@/components/SubscriptionGate";

interface Medication {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date: string | null;
  notes: string | null;
  is_active: boolean | null;
}

interface TestResult {
  id: string;
  test_name: string;
  test_date: string;
  result_value: string | null;
  result_unit: string | null;
  notes: string | null;
  file_url_encrypted: string | null;
}

interface MedicalRecord {
  id: string;
  record_name: string;
  record_date: string;
  category: string;
  notes: string | null;
  file_url_encrypted: string | null;
}

interface Symptom {
  id: string;
  symptom_name: string;
  severity: number | null;
  description: string | null;
  logged_at: string | null;
}

const MedicalHistory = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation(['medical', 'errors']);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [medFormData, setMedFormData] = useState({
    medication_name: "",
    dosage: "",
    frequency: "",
    start_date: new Date().toISOString().split('T')[0],
    notes: "",
  });

  const [testFormData, setTestFormData] = useState({
    test_name: "",
    test_date: new Date().toISOString().split('T')[0],
    result_value: "",
    result_unit: "",
    notes: "",
    file_url: "",
  });
  const [testFile, setTestFile] = useState<File | null>(null);
  const [isUploadingTest, setIsUploadingTest] = useState(false);

  const [recordFormData, setRecordFormData] = useState({
    record_name: "",
    record_date: new Date().toISOString().split('T')[0],
    category: "",
    notes: "",
    file_url: "",
  });
  const [recordFile, setRecordFile] = useState<File | null>(null);
  const [isUploadingRecord, setIsUploadingRecord] = useState(false);

  const [symptomName, setSymptomName] = useState("");
  const [severity, setSeverity] = useState([5]);
  const [symptomDescription, setSymptomDescription] = useState("");

  useEffect(() => {
    fetchMedications();
    fetchTestResults();
    fetchMedicalRecords();
    fetchSymptoms();
  }, []);

  const fetchMedications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false });

      if (error) throw error;
      setMedications(data || []);
    } catch (error) {
      console.error('Error fetching medications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTestResults = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('medical_test_results')
        .select('*')
        .eq('user_id', user.id)
        .order('test_date', { ascending: false });

      if (error) throw error;
      setTestResults(data || []);
    } catch (error) {
      console.error('Error fetching test results:', error);
    }
  };

  const fetchMedicalRecords = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('medical_records')
        .select('*')
        .eq('user_id', user.id)
        .order('record_date', { ascending: false });

      if (error) throw error;
      setMedicalRecords(data || []);
    } catch (error) {
      console.error('Error fetching medical records:', error);
    }
  };

  const fetchSymptoms = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('symptoms')
        .select('*')
        .eq('user_id', user.id)
        .order('logged_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setSymptoms(data || []);
    } catch (error) {
      console.error('Error fetching symptoms:', error);
    }
  };

  const handleAddMedication = async () => {
    // Validate using Zod schema
    const validation = validateAndSanitize(medicationSchema, medFormData);
    if (validation.success === false) {
      toast({
        title: t('medical:validation_error'),
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('medications')
        .insert({
          user_id: user.id,
          medication_name: medFormData.medication_name,
          dosage: medFormData.dosage,
          frequency: medFormData.frequency,
          start_date: medFormData.start_date,
          notes: medFormData.notes || null,
        });

      if (error) throw error;

      toast({
        title: t('medical:medication_added'),
        description: t('medical:medication_added_desc', { name: medFormData.medication_name }),
      });

      setMedFormData({
        medication_name: "",
        dosage: "",
        frequency: "",
        start_date: new Date().toISOString().split('T')[0],
        notes: "",
      });
      fetchMedications();
    } catch (error) {
      console.error('Error adding medication:', error);
      toast({
        title: t('medical:error'),
        description: t('medical:failed_add_medication'),
        variant: "destructive",
      });
    }
  };

  const handleTestFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (50MB max)
    if (file.size > 52428800) {
      toast({
        title: t('medical:file_too_large'),
        description: t('medical:file_size_limit'),
        variant: "destructive",
      });
      return;
    }

    setTestFile(file);
  };

  const handleAddTestResult = async () => {
    // Validate using Zod schema
    const validation = validateAndSanitize(testResultSchema, testFormData);
    if (validation.success === false) {
      toast({
        title: t('medical:validation_error'),
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploadingTest(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let filePath = testFormData.file_url || null;

      // Upload file if selected
      if (testFile) {
        const uploadResult = await uploadMedicalFile(testFile, user.id, 'test_results');
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Failed to upload file');
        }
        filePath = uploadResult.filePath || null;
      }

      const { error } = await supabase
        .from('medical_test_results')
        .insert({
          user_id: user.id,
          test_name: testFormData.test_name,
          test_date: testFormData.test_date,
          result_value: testFormData.result_value || null,
          result_unit: testFormData.result_unit || null,
          notes: testFormData.notes || null,
          file_url_encrypted: filePath,
        });

      if (error) throw error;

      toast({
        title: t('medical:test_result_added'),
        description: t('medical:test_result_added_desc', { name: testFormData.test_name }),
      });

      setTestFormData({
        test_name: "",
        test_date: new Date().toISOString().split('T')[0],
        result_value: "",
        result_unit: "",
        notes: "",
        file_url: "",
      });
      setTestFile(null);
      fetchTestResults();
    } catch (error) {
      console.error('Error adding test result:', error);
      toast({
        title: t('medical:error'),
        description: t('medical:failed_add_test'),
        variant: "destructive",
      });
    } finally {
      setIsUploadingTest(false);
    }
  };

  const handleRecordFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (50MB max)
    if (file.size > 52428800) {
      toast({
        title: t('medical:file_too_large'),
        description: t('medical:file_size_limit'),
        variant: "destructive",
      });
      return;
    }

    setRecordFile(file);
  };

  const handleAddMedicalRecord = async () => {
    // Validate using Zod schema
    const validation = validateAndSanitize(medicalRecordSchema, recordFormData);
    if (validation.success === false) {
      toast({
        title: t('medical:validation_error'),
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploadingRecord(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let filePath = recordFormData.file_url || null;

      // Upload file if selected
      if (recordFile) {
        const uploadResult = await uploadMedicalFile(recordFile, user.id, 'medical_records');
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Failed to upload file');
        }
        filePath = uploadResult.filePath || null;
      }

      const { error } = await supabase
        .from('medical_records')
        .insert({
          user_id: user.id,
          record_name: recordFormData.record_name,
          record_date: recordFormData.record_date,
          category: recordFormData.category,
          notes: recordFormData.notes || null,
          file_url_encrypted: filePath,
        });

      if (error) throw error;

      toast({
        title: t('medical:medical_record_added'),
        description: t('medical:medical_record_added_desc', { name: recordFormData.record_name }),
      });

      setRecordFormData({
        record_name: "",
        record_date: new Date().toISOString().split('T')[0],
        category: "",
        notes: "",
        file_url: "",
      });
      setRecordFile(null);
      fetchMedicalRecords();
    } catch (error) {
      console.error('Error adding medical record:', error);
      toast({
        title: t('medical:error'),
        description: t('medical:failed_add_record'),
        variant: "destructive",
      });
    } finally {
      setIsUploadingRecord(false);
    }
  };

  const handleAddSymptom = async () => {
    // Validate using Zod schema
    const validation = validateAndSanitize(symptomSchema, {
      symptom_name: symptomName,
      severity: severity[0],
      description: symptomDescription || undefined,
    });
    if (validation.success === false) {
      toast({
        title: t('medical:validation_error'),
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('symptoms')
        .insert({
          user_id: user.id,
          symptom_name: symptomName,
          severity: severity[0],
          description: symptomDescription || null,
        });

      if (error) throw error;

      toast({
        title: t('medical:symptom_logged'),
        description: t('medical:symptom_logged_desc', { name: symptomName }),
      });

      setSymptomName("");
      setSeverity([5]);
      setSymptomDescription("");
      fetchSymptoms();
    } catch (error) {
      console.error('Error logging symptom:', error);
      toast({
        title: t('medical:error'),
        description: t('medical:failed_log_symptom'),
        variant: "destructive",
      });
    }
  };

  const handleDeleteSymptom = async (id: string) => {
    try {
      const { error } = await supabase
        .from('symptoms')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: t('medical:symptom_deleted'),
        description: t('medical:symptom_deleted_desc'),
      });

      fetchSymptoms();
    } catch (error) {
      console.error('Error deleting symptom:', error);
      toast({
        title: t('medical:error'),
        description: t('medical:failed_delete_symptom'),
        variant: "destructive",
      });
    }
  };

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return "text-yellow-600";
    if (severity <= 7) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <SubscriptionGate feature="medical_records">
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

        <TabsContent value="medications" className="space-y-6">
          <Card className="p-6 bg-gradient-card shadow-md">
            <h3 className="text-lg font-semibold mb-6">{t('medical:add_medication')}</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="med-name">{t('medical:medication_name')}</Label>
                  <Input
                    id="med-name"
                    placeholder={t('medical:placeholder_medication')}
                    value={medFormData.medication_name}
                    onChange={(e) => setMedFormData({ ...medFormData, medication_name: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="dosage">{t('medical:dosage')}</Label>
                  <Input
                    id="dosage"
                    placeholder={t('medical:placeholder_dosage')}
                    value={medFormData.dosage}
                    onChange={(e) => setMedFormData({ ...medFormData, dosage: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="frequency">{t('medical:frequency')}</Label>
                  <Input
                    id="frequency"
                    placeholder={t('medical:placeholder_frequency')}
                    value={medFormData.frequency}
                    onChange={(e) => setMedFormData({ ...medFormData, frequency: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="start-date">{t('medical:start_date')}</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={medFormData.start_date}
                    onChange={(e) => setMedFormData({ ...medFormData, start_date: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="med-notes">{t('medical:notes')}</Label>
                <Textarea
                  id="med-notes"
                  placeholder={t('medical:placeholder_notes')}
                  value={medFormData.notes}
                  onChange={(e) => setMedFormData({ ...medFormData, notes: e.target.value })}
                  className="mt-1.5 min-h-20"
                />
              </div>

              <Button onClick={handleAddMedication} className="w-full gap-2">
                <Plus className="w-4 h-4" />
                {t('medical:add_medication')}
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card shadow-md">
            <h3 className="text-lg font-semibold mb-4">{t('medical:active')}</h3>
            <div className="space-y-3">
              {isLoading ? (
                <p className="text-center text-muted-foreground py-8">Loading...</p>
              ) : medications.filter(m => m.is_active).length > 0 ? (
                medications.filter(m => m.is_active).map((med) => (
                  <div key={med.id} className="p-4 bg-secondary rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-lg flex items-center gap-2">
                          <Pill className="w-4 h-4" />
                          {med.medication_name}
                        </h4>
                        <p className="text-sm text-muted-foreground">{med.dosage} - {med.frequency}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Started: {format(new Date(med.start_date), "PP")}
                    </p>
                    {med.notes && (
                      <p className="text-sm text-muted-foreground mt-2">{med.notes}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  {t('medical:no_medications')}
                </p>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="symptoms" className="space-y-6">
          <Card className="p-6 bg-gradient-card shadow-md">
            <h3 className="text-lg font-semibold mb-6">{t('medical:log_symptom')}</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="symptom-name">{t('medical:symptom_name')}</Label>
                <Input
                  id="symptom-name"
                  placeholder={t('medical:placeholder_symptom')}
                  value={symptomName}
                  onChange={(e) => setSymptomName(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="severity">{t('medical:severity')}</Label>
                <div className="flex items-center gap-4 mt-1.5">
                  <Slider
                    id="severity"
                    min={1}
                    max={10}
                    step={1}
                    value={severity}
                    onValueChange={setSeverity}
                    className="flex-1"
                  />
                  <span className="text-lg font-semibold w-8">{severity[0]}</span>
                </div>
              </div>

              <div>
                <Label htmlFor="symptom-description">{t('medical:description')}</Label>
                <Textarea
                  id="symptom-description"
                  placeholder={t('medical:placeholder_symptom_description')}
                  value={symptomDescription}
                  onChange={(e) => setSymptomDescription(e.target.value)}
                  className="mt-1.5 min-h-20"
                />
              </div>

              <Button onClick={handleAddSymptom} className="w-full gap-2">
                <Plus className="w-4 h-4" />
                {t('medical:log_symptom')}
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card shadow-md">
            <h3 className="text-lg font-semibold mb-4">Recent Symptoms</h3>
            <div className="space-y-3">
              {isLoading ? (
                <p className="text-center text-muted-foreground py-8">Loading...</p>
              ) : symptoms.length > 0 ? (
                symptoms.map((symptom) => (
                  <div key={symptom.id} className="p-4 bg-secondary rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertCircle className="w-4 h-4" />
                          <h4 className="font-semibold">{symptom.symptom_name}</h4>
                        </div>
                        {symptom.severity && (
                          <p className={`text-sm font-medium ${getSeverityColor(symptom.severity)}`}>
                            {t('medical:severity_level', { level: symptom.severity })}
                          </p>
                        )}
                        {symptom.description && (
                          <p className="text-sm text-muted-foreground mt-2">{symptom.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {symptom.logged_at && format(new Date(symptom.logged_at), "PPp")}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSymptom(symptom.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  {t('medical:no_symptoms')}
                </p>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="space-y-6">
          <Card className="p-6 bg-gradient-card shadow-md">
            <h3 className="text-lg font-semibold mb-6">{t('medical:add_test_result')}</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="test-name">{t('medical:test_name')}</Label>
                <Input
                  id="test-name"
                  placeholder={t('medical:placeholder_test_name')}
                  value={testFormData.test_name}
                  onChange={(e) => setTestFormData({ ...testFormData, test_name: e.target.value })}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="test-date">{t('medical:test_date')}</Label>
                <Input
                  id="test-date"
                  type="date"
                  value={testFormData.test_date}
                  onChange={(e) => setTestFormData({ ...testFormData, test_date: e.target.value })}
                  className="mt-1.5"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="result-value">{t('medical:result')}</Label>
                  <Input
                    id="result-value"
                    placeholder={t('medical:placeholder_result')}
                    value={testFormData.result_value}
                    onChange={(e) => setTestFormData({ ...testFormData, result_value: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="result-unit">Unit (optional)</Label>
                  <Input
                    id="result-unit"
                    placeholder="e.g., mg/dL"
                    value={testFormData.result_unit}
                    onChange={(e) => setTestFormData({ ...testFormData, result_unit: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="test-notes">Notes (optional)</Label>
                <Textarea
                  id="test-notes"
                  placeholder="Add any details..."
                  value={testFormData.notes}
                  onChange={(e) => setTestFormData({ ...testFormData, notes: e.target.value })}
                  className="mt-1.5 min-h-20"
                />
              </div>

              <div>
                <Label htmlFor="test-file">Upload File (optional)</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    id="test-file"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleTestFileChange}
                    className="flex-1"
                  />
                </div>
                {testFile && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Selected: {testFile.name} ({(testFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Max file size: 50MB. Accepted formats: PDF, JPG, PNG, DOC, DOCX
                </p>
              </div>

              <Button onClick={handleAddTestResult} className="w-full gap-2" disabled={isUploadingTest}>
                <Plus className="w-4 h-4" />
                {isUploadingTest ? t('common:uploading') : t('medical:add_test_result')}
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card shadow-md">
            <h3 className="text-lg font-semibold mb-4">Recent Test Results</h3>
            <div className="space-y-3">
              {isLoading ? (
                <p className="text-center text-muted-foreground py-8">Loading...</p>
              ) : testResults.length > 0 ? (
                testResults.map((test) => (
                  <div key={test.id} className="p-4 bg-secondary rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-lg">{test.test_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(test.test_date), "PP")}
                        </p>
                      </div>
                      {test.result_value && (
                        <span className="font-bold text-primary">
                          {test.result_value} {test.result_unit}
                        </span>
                      )}
                    </div>
                    {test.notes && (
                      <p className="text-sm text-muted-foreground mt-2">{test.notes}</p>
                    )}
                    {test.file_url_encrypted && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={async () => {
                          const signedUrl = await getSignedMedicalFileUrl(
                            test.file_url_encrypted!,
                            test.id,
                            'medical_test_results'
                          );
                          if (signedUrl) {
                            window.open(signedUrl, '_blank');
                            toast({
                              title: "File Access Logged",
                              description: "Medical file access has been recorded for audit purposes.",
                            });
                          } else {
                            toast({
                              title: t('medical:error'),
                              description: "Failed to access file. The link may have expired.",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        {t('medical:view_file')}
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  {t('medical:no_test_results')}
                </p>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="records" className="space-y-6">
          <Card className="p-6 bg-gradient-card shadow-md">
            <h3 className="text-lg font-semibold mb-6">{t('medical:add_record')}</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="record-name">{t('medical:record_name')}</Label>
                <Input
                  id="record-name"
                  placeholder={t('medical:placeholder_record_name')}
                  value={recordFormData.record_name}
                  onChange={(e) => setRecordFormData({ ...recordFormData, record_name: e.target.value })}
                  className="mt-1.5"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="record-date">Date</Label>
                  <Input
                    id="record-date"
                    type="date"
                    value={recordFormData.record_date}
                    onChange={(e) => setRecordFormData({ ...recordFormData, record_date: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="category">{t('medical:category')}</Label>
                  <Input
                    id="category"
                    placeholder={t('medical:placeholder_category')}
                    value={recordFormData.category}
                    onChange={(e) => setRecordFormData({ ...recordFormData, category: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="record-notes">Notes (optional)</Label>
                <Textarea
                  id="record-notes"
                  placeholder="Add any details..."
                  value={recordFormData.notes}
                  onChange={(e) => setRecordFormData({ ...recordFormData, notes: e.target.value })}
                  className="mt-1.5 min-h-20"
                />
              </div>

              <div>
                <Label htmlFor="record-file">Upload File (optional)</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    id="record-file"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleRecordFileChange}
                    className="flex-1"
                  />
                </div>
                {recordFile && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Selected: {recordFile.name} ({(recordFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Max file size: 50MB. Accepted formats: PDF, JPG, PNG, DOC, DOCX
                </p>
              </div>

              <Button onClick={handleAddMedicalRecord} className="w-full gap-2" disabled={isUploadingRecord}>
                <Plus className="w-4 h-4" />
                {isUploadingRecord ? t('common:uploading') : t('medical:add_record')}
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card shadow-md">
            <h3 className="text-lg font-semibold mb-4">Medical Records</h3>
            <div className="space-y-3">
              {isLoading ? (
                <p className="text-center text-muted-foreground py-8">Loading...</p>
              ) : medicalRecords.length > 0 ? (
                medicalRecords.map((record) => (
                  <div key={record.id} className="p-4 bg-secondary rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-lg flex items-center gap-2">
                          <FolderOpen className="w-4 h-4" />
                          {record.record_name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(record.record_date), "PP")}
                        </p>
                      </div>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {record.category}
                      </span>
                    </div>
                    {record.notes && (
                      <p className="text-sm text-muted-foreground mt-2">{record.notes}</p>
                    )}
                    {record.file_url_encrypted && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={async () => {
                          const signedUrl = await getSignedMedicalFileUrl(
                            record.file_url_encrypted!,
                            record.id,
                            'medical_records'
                          );
                          if (signedUrl) {
                            window.open(signedUrl, '_blank');
                            toast({
                              title: "File Access Logged",
                              description: "Medical file access has been recorded for audit purposes.",
                            });
                          } else {
                            toast({
                              title: "Error",
                              description: "Failed to access file. The link may have expired.",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View File
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  {t('medical:no_medical_records')}
                </p>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </SubscriptionGate>
  );
};

export default MedicalHistory;
