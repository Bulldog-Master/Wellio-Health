import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, FileText, Shield, Download, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import SEOHead from '@/components/SEOHead';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';

const CCPARightsRequest = () => {
  const { t } = useTranslation(['legal', 'common']);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    requestType: 'know',
    additionalInfo: '',
    verifyIdentity: false,
    californiaResident: false,
  });

  const requestTypes = [
    {
      value: 'know',
      icon: Eye,
      title: t('legal:right_to_know'),
      description: t('legal:right_to_know_desc'),
    },
    {
      value: 'delete',
      icon: Trash2,
      title: t('legal:right_to_delete'),
      description: t('legal:right_to_delete_desc'),
    },
    {
      value: 'optout',
      icon: Shield,
      title: t('legal:right_to_opt_out'),
      description: t('legal:right_to_opt_out_desc'),
    },
    {
      value: 'portability',
      icon: Download,
      title: t('legal:right_to_portability'),
      description: t('legal:right_to_portability_desc'),
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.californiaResident) {
      toast.error(t('legal:california_resident_required'));
      return;
    }
    
    if (!formData.verifyIdentity) {
      toast.error(t('legal:identity_verification_required'));
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Store the CCPA request
      const { error } = await supabase.from('data_export_requests').insert({
        user_id: user?.id || null,
        status: 'pending',
      });

      if (error) throw error;

      toast.success(t('legal:ccpa_request_submitted'));
      setFormData({
        fullName: '',
        email: '',
        requestType: 'know',
        additionalInfo: '',
        verifyIdentity: false,
        californiaResident: false,
      });
    } catch (error) {
      console.error('Error submitting CCPA request:', error);
      toast.error(t('common:error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <SEOHead 
        titleKey="ccpa_rights_title"
        descriptionKey="ccpa_rights_description"
        namespace="seo"
      />
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
          aria-label={t('common:back')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common:back')}
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">{t('legal:ccpa_rights_title')}</h1>
        </div>

        <p className="text-muted-foreground mb-8">{t('legal:ccpa_intro_text')}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('legal:personal_information')}</CardTitle>
              <CardDescription>{t('legal:personal_info_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">{t('legal:full_name')}</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('legal:email_address')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('legal:select_request_type')}</CardTitle>
              <CardDescription>{t('legal:request_type_desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={formData.requestType}
                onValueChange={(value) => setFormData({ ...formData, requestType: value })}
                className="space-y-3"
              >
                {requestTypes.map((type) => (
                  <div key={type.value} className="flex items-start space-x-3 p-3 rounded-lg border bg-card/50">
                    <RadioGroupItem value={type.value} id={type.value} className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor={type.value} className="flex items-center gap-2 cursor-pointer">
                        <type.icon className="h-4 w-4 text-primary" />
                        <span className="font-medium">{type.title}</span>
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('legal:additional_information')}</CardTitle>
              <CardDescription>{t('legal:additional_info_desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.additionalInfo}
                onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                placeholder={t('legal:additional_info_placeholder')}
                rows={4}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('legal:verification')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="californiaResident"
                  checked={formData.californiaResident}
                  onCheckedChange={(checked) => setFormData({ ...formData, californiaResident: checked as boolean })}
                />
                <Label htmlFor="californiaResident" className="text-sm cursor-pointer">
                  {t('legal:california_resident_confirmation')}
                </Label>
              </div>
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="verifyIdentity"
                  checked={formData.verifyIdentity}
                  onCheckedChange={(checked) => setFormData({ ...formData, verifyIdentity: checked as boolean })}
                />
                <Label htmlFor="verifyIdentity" className="text-sm cursor-pointer">
                  {t('legal:identity_verification_confirmation')}
                </Label>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t('common:submitting') : t('legal:submit_request')}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            {t('legal:ccpa_response_time')}
          </p>
        </form>
      </div>
    </Layout>
  );
};

export default CCPARightsRequest;
