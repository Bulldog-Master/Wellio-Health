-- Create clinician_patients relationship table (similar to coach_clients)
CREATE TABLE public.clinician_patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinician_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'revoked')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (clinician_id, patient_id)
);

-- Add foreign key references to profiles
ALTER TABLE public.clinician_patients
  ADD CONSTRAINT clinician_patients_clinician_id_fkey 
  FOREIGN KEY (clinician_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.clinician_patients
  ADD CONSTRAINT clinician_patients_patient_id_fkey 
  FOREIGN KEY (patient_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.clinician_patients ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clinician_patients
CREATE POLICY "Clinicians can view their patient relationships"
  ON public.clinician_patients FOR SELECT
  USING (auth.uid() = clinician_id OR auth.uid() = patient_id);

CREATE POLICY "Clinicians can invite patients"
  ON public.clinician_patients FOR INSERT
  WITH CHECK (auth.uid() = clinician_id);

CREATE POLICY "Clinicians can update their patient relationships"
  ON public.clinician_patients FOR UPDATE
  USING (auth.uid() = clinician_id);

CREATE POLICY "Patients can update their own relationship status"
  ON public.clinician_patients FOR UPDATE
  USING (auth.uid() = patient_id);

CREATE POLICY "Clinicians can remove patients"
  ON public.clinician_patients FOR DELETE
  USING (auth.uid() = clinician_id);

-- Add RLS policy on daily_scores for clinicians to view active patients' scores
CREATE POLICY "Clinicians can view active patients scores"
  ON public.daily_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clinician_patients cp
      WHERE cp.clinician_id = auth.uid()
        AND cp.patient_id = daily_scores.user_id
        AND cp.status = 'active'
    )
  );

-- Create updated_at trigger for clinician_patients
CREATE TRIGGER update_clinician_patients_updated_at
  BEFORE UPDATE ON public.clinician_patients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();