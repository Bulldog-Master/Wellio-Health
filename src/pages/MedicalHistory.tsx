import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Plus, Pill, Upload, FolderOpen, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

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
  file_url: string | null;
}

interface MedicalRecord {
  id: string;
  record_name: string;
  record_date: string;
  category: string;
  notes: string | null;
  file_url: string | null;
}

const MedicalHistory = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
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

  const [recordFormData, setRecordFormData] = useState({
    record_name: "",
    record_date: new Date().toISOString().split('T')[0],
    category: "",
    notes: "",
    file_url: "",
  });

  useEffect(() => {
    fetchMedications();
    fetchTestResults();
    fetchMedicalRecords();
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

  const handleAddMedication = async () => {
    if (!medFormData.medication_name || !medFormData.dosage || !medFormData.frequency) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
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
        title: "Medication added",
        description: `${medFormData.medication_name} has been added to your records.`,
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
        title: "Error",
        description: "Failed to add medication.",
        variant: "destructive",
      });
    }
  };

  const handleAddTestResult = async () => {
    if (!testFormData.test_name || !testFormData.test_date) {
      toast({
        title: "Missing information",
        description: "Please fill in test name and date.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('medical_test_results')
        .insert({
          user_id: user.id,
          test_name: testFormData.test_name,
          test_date: testFormData.test_date,
          result_value: testFormData.result_value || null,
          result_unit: testFormData.result_unit || null,
          notes: testFormData.notes || null,
          file_url: testFormData.file_url || null,
        });

      if (error) throw error;

      toast({
        title: "Test result added",
        description: `${testFormData.test_name} has been recorded.`,
      });

      setTestFormData({
        test_name: "",
        test_date: new Date().toISOString().split('T')[0],
        result_value: "",
        result_unit: "",
        notes: "",
        file_url: "",
      });
      fetchTestResults();
    } catch (error) {
      console.error('Error adding test result:', error);
      toast({
        title: "Error",
        description: "Failed to add test result.",
        variant: "destructive",
      });
    }
  };

  const handleAddMedicalRecord = async () => {
    if (!recordFormData.record_name || !recordFormData.record_date || !recordFormData.category) {
      toast({
        title: "Missing information",
        description: "Please fill in record name, date, and category.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('medical_records')
        .insert({
          user_id: user.id,
          record_name: recordFormData.record_name,
          record_date: recordFormData.record_date,
          category: recordFormData.category,
          notes: recordFormData.notes || null,
          file_url: recordFormData.file_url || null,
        });

      if (error) throw error;

      toast({
        title: "Medical record added",
        description: `${recordFormData.record_name} has been recorded.`,
      });

      setRecordFormData({
        record_name: "",
        record_date: new Date().toISOString().split('T')[0],
        category: "",
        notes: "",
        file_url: "",
      });
      fetchMedicalRecords();
    } catch (error) {
      console.error('Error adding medical record:', error);
      toast({
        title: "Error",
        description: "Failed to add medical record.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-xl">
          <FileText className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Health</h1>
          <p className="text-muted-foreground">Track medications, tests, and symptoms</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Card 
          className="p-6 bg-gradient-card shadow-md hover:shadow-lg transition-all cursor-pointer"
          onClick={() => navigate('/symptoms')}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-xl">
              <AlertCircle className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Symptoms</h3>
              <p className="text-sm text-muted-foreground">Track and log your symptoms</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="medications" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="tests">Test Results</TabsTrigger>
          <TabsTrigger value="records">Medical Records</TabsTrigger>
        </TabsList>

        <TabsContent value="medications" className="space-y-6">
          <Card className="p-6 bg-gradient-card shadow-md">
            <h3 className="text-lg font-semibold mb-6">Add Medication</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="med-name">Medication Name</Label>
                  <Input
                    id="med-name"
                    placeholder="e.g., Aspirin"
                    value={medFormData.medication_name}
                    onChange={(e) => setMedFormData({ ...medFormData, medication_name: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="dosage">Dosage</Label>
                  <Input
                    id="dosage"
                    placeholder="e.g., 100mg"
                    value={medFormData.dosage}
                    onChange={(e) => setMedFormData({ ...medFormData, dosage: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Input
                    id="frequency"
                    placeholder="e.g., Twice daily"
                    value={medFormData.frequency}
                    onChange={(e) => setMedFormData({ ...medFormData, frequency: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="start-date">Start Date</Label>
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
                <Label htmlFor="med-notes">Notes (optional)</Label>
                <Textarea
                  id="med-notes"
                  placeholder="Add any details..."
                  value={medFormData.notes}
                  onChange={(e) => setMedFormData({ ...medFormData, notes: e.target.value })}
                  className="mt-1.5 min-h-20"
                />
              </div>

              <Button onClick={handleAddMedication} className="w-full gap-2">
                <Plus className="w-4 h-4" />
                Add Medication
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card shadow-md">
            <h3 className="text-lg font-semibold mb-4">Active Medications</h3>
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
                  No active medications.
                </p>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="space-y-6">
          <Card className="p-6 bg-gradient-card shadow-md">
            <h3 className="text-lg font-semibold mb-6">Add Test Result</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="test-name">Test Name</Label>
                <Input
                  id="test-name"
                  placeholder="e.g., Blood Pressure, Cholesterol"
                  value={testFormData.test_name}
                  onChange={(e) => setTestFormData({ ...testFormData, test_name: e.target.value })}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="test-date">Test Date</Label>
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
                  <Label htmlFor="result-value">Result Value (optional)</Label>
                  <Input
                    id="result-value"
                    placeholder="e.g., 120"
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
                <Label htmlFor="file-url">File URL (optional)</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    id="file-url"
                    placeholder="https://example.com/test-result.pdf"
                    value={testFormData.file_url}
                    onChange={(e) => setTestFormData({ ...testFormData, file_url: e.target.value })}
                    className="flex-1"
                  />
                  <Button variant="outline" size="icon" type="button">
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload your test result to cloud storage and paste the URL here
                </p>
              </div>

              <Button onClick={handleAddTestResult} className="w-full gap-2">
                <Plus className="w-4 h-4" />
                Add Test Result
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
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No test results yet.
                </p>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="records" className="space-y-6">
          <Card className="p-6 bg-gradient-card shadow-md">
            <h3 className="text-lg font-semibold mb-6">Add Medical Record</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="record-name">Record Name</Label>
                <Input
                  id="record-name"
                  placeholder="e.g., Annual Checkup, X-Ray Results"
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
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    placeholder="e.g., Imaging, Lab Report, Visit"
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
                <Label htmlFor="record-file-url">File URL (optional)</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    id="record-file-url"
                    placeholder="https://example.com/medical-record.pdf"
                    value={recordFormData.file_url}
                    onChange={(e) => setRecordFormData({ ...recordFormData, file_url: e.target.value })}
                    className="flex-1"
                  />
                  <Button variant="outline" size="icon" type="button">
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload your medical record to cloud storage and paste the URL here
                </p>
              </div>

              <Button onClick={handleAddMedicalRecord} className="w-full gap-2">
                <Plus className="w-4 h-4" />
                Add Medical Record
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
                    {record.file_url && (
                      <a
                        href={record.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline mt-2 inline-block"
                      >
                        View File
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No medical records yet.
                </p>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MedicalHistory;
