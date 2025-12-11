import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Stethoscope, Eye, EyeOff, Shield, Loader2, CheckCircle, Clock,
  TrendingUp, AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const clinicianApplicationSchema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  organization: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  license_type: z.string().optional(),
  license_id: z.string().optional(),
  consent_not_emr: z.boolean().refine(val => val === true, {
    message: 'You must acknowledge this is not an EMR/EHR',
  }),
  consent_derived_signals: z.boolean().refine(val => val === true, {
    message: 'You must acknowledge the derived signals access model',
  }),
});

type ClinicianApplicationValues = z.infer<typeof clinicianApplicationSchema>;

interface ClinicianApplicationFormProps {
  onSuccess?: () => void;
}

export const ClinicianApplicationForm = ({ onSuccess }: ClinicianApplicationFormProps) => {
  const { t } = useTranslation(['professional', 'care_team', 'common']);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'pending' | 'approved' | 'rejected'>('idle');

  const form = useForm<ClinicianApplicationValues>({
    resolver: zodResolver(clinicianApplicationSchema),
    defaultValues: {
      full_name: '',
      organization: '',
      country: '',
      license_type: '',
      license_id: '',
      consent_not_emr: false,
      consent_derived_signals: false,
    },
  });

  const onSubmit = async (values: ClinicianApplicationValues) => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error(t('common:auth_required'));
        return;
      }

      // Check for existing application
      const { data: existing } = await supabase
        .from('professional_profiles')
        .select('status')
        .eq('user_id', user.id)
        .eq('role', 'clinician')
        .maybeSingle();

      if (existing) {
        setStatus(existing.status as any);
        return;
      }

      // Create new application
      const { error } = await supabase
        .from('professional_profiles')
        .insert({
          user_id: user.id,
          role: 'clinician',
          status: 'pending',
          full_name: values.full_name,
          organization: values.organization || null,
          country: values.country,
          license_id: values.license_id || null,
        });

      if (error) throw error;

      setStatus('pending');
      toast.success(t('professional:application_submitted'));
      onSuccess?.();
    } catch (err) {
      console.error('Error submitting clinician application:', err);
      toast.error(t('common:error'));
    } finally {
      setSubmitting(false);
    }
  };

  // Show status if already applied
  if (status === 'pending') {
    return (
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
            <Clock className="h-6 w-6 text-amber-500" />
          </div>
          <CardTitle>{t('professional:application_pending')}</CardTitle>
          <CardDescription>
            {t('professional:pending_review_message', 
              'Your clinician profile is under review. You can still receive invites from patients and preview functional signals.'
            )}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (status === 'approved') {
    return (
      <Card className="border-green-500/30 bg-green-500/5">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-500" />
          </div>
          <CardTitle>{t('professional:application_approved')}</CardTitle>
          <CardDescription>
            {t('professional:approved_message', 
              'You are now approved as a clinician on Wellio. Patients can invite you to view their functional wellness patterns.'
            )}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Hero Section */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Stethoscope className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {t('professional:become_clinician_title', 'Become a Clinician on Wellio')}
          </CardTitle>
          <CardDescription className="text-base">
            {t('professional:become_clinician_desc', 
              'Wellio is a Wellness APP Platform centered on individuals, not clinics. As a clinician, you can view functional wellness patterns and adherence signals shared with you by your patients — without inheriting the risk of storing PHI or raw logs.'
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* What You Will See */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-green-500" />
            <CardTitle className="text-lg">
              {t('professional:what_you_will_see', 'You will see')}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <span>{t('care_team:functional_wellness_index', 'Functional Wellness Index (FWI)')}</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <span>{t('professional:trend_lines_adherence', 'Trend lines and adherence signals')}</span>
          </div>
        </CardContent>
      </Card>

      {/* What You Will NOT See */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <EyeOff className="h-5 w-5 text-red-500" />
            <CardTitle className="text-lg">
              {t('professional:what_you_will_not_see', 'You will not see')}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <span className="text-muted-foreground">
              {t('professional:no_raw_logs', 'Raw logs, journals, or Medical Vault contents')}
            </span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <span className="text-muted-foreground">
              {t('professional:no_phi', 'PHI or identifiers managed by Wellio')}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Application Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t('professional:application_form', 'Application Form')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('professional:full_name', 'Full Name')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('professional:full_name_placeholder', 'Dr. Jane Smith')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="organization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('professional:organization', 'Organization / Practice')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('professional:organization_placeholder', 'City Medical Center')} {...field} />
                    </FormControl>
                    <FormDescription>
                      {t('professional:organization_optional', 'Optional')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('professional:country', 'Country / Region')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('professional:select_country', 'Select country')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="UK">United Kingdom</SelectItem>
                        <SelectItem value="AU">Australia</SelectItem>
                        <SelectItem value="DE">Germany</SelectItem>
                        <SelectItem value="FR">France</SelectItem>
                        <SelectItem value="ES">Spain</SelectItem>
                        <SelectItem value="MX">Mexico</SelectItem>
                        <SelectItem value="BR">Brazil</SelectItem>
                        <SelectItem value="IN">India</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="license_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('professional:license_type', 'License Type')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('professional:select_license', 'Select license type')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MD">MD (Medical Doctor)</SelectItem>
                        <SelectItem value="DO">DO (Doctor of Osteopathy)</SelectItem>
                        <SelectItem value="NP">NP (Nurse Practitioner)</SelectItem>
                        <SelectItem value="PA">PA (Physician Assistant)</SelectItem>
                        <SelectItem value="RD">RD (Registered Dietitian)</SelectItem>
                        <SelectItem value="PT">PT (Physical Therapist)</SelectItem>
                        <SelectItem value="DC">DC (Doctor of Chiropractic)</SelectItem>
                        <SelectItem value="LCSW">LCSW (Licensed Clinical Social Worker)</SelectItem>
                        <SelectItem value="PhD">PhD (Psychologist)</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {t('professional:license_optional', 'Optional - helps verify your credentials')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="license_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('professional:license_id', 'License ID')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('professional:license_id_placeholder', 'ABC123456')} {...field} />
                    </FormControl>
                    <FormDescription>
                      {t('professional:license_optional', 'Optional - helps verify your credentials')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Consent Checkboxes */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  {t('professional:required_acknowledgements', 'Required Acknowledgements')}
                </div>

                <FormField
                  control={form.control}
                  name="consent_not_emr"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="cursor-pointer">
                          {t('professional:consent_not_emr', 
                            'I understand Wellio is not an EMR/EHR and does not store clinical records.'
                          )}
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="consent_derived_signals"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="cursor-pointer">
                          {t('professional:consent_derived_signals', 
                            'I understand that I will only see derived wellness signals shared by my patients.'
                          )}
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('common:submitting')}
                  </>
                ) : (
                  t('professional:submit_application', 'Submit Application')
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClinicianApplicationForm;
