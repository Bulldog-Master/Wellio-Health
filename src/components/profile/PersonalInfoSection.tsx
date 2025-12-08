import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { User, Upload, UserCircle, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ProfileFormData } from "@/hooks/profile/useProfile";

interface PersonalInfoSectionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: ProfileFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProfileFormData>>;
  avatarUrl: string | null;
  isLoading: boolean;
  onAvatarUpload: (file: File) => void;
}

export function PersonalInfoSection({
  open,
  onOpenChange,
  formData,
  setFormData,
  avatarUrl,
  isLoading,
  onAvatarUpload
}: PersonalInfoSectionProps) {
  const { t } = useTranslation('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onAvatarUpload(file);
  };

  return (
    <Card className="bg-gradient-card shadow-md overflow-hidden">
      <Collapsible open={open} onOpenChange={onOpenChange}>
        <CollapsibleTrigger className="w-full p-6 flex items-center justify-between hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary/20 rounded-lg">
              <UserCircle className="w-5 h-5 text-secondary" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold">{t('personal_information')}</h3>
              <p className="text-sm text-muted-foreground">{t('profile_details_account')}</p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-6 pt-0 space-y-4 border-t">
            <div className="flex items-center gap-4 pb-4 border-b">
              <Avatar className="w-24 h-24">
                <AvatarImage src={avatarUrl || undefined} alt={formData.name} />
                <AvatarFallback>
                  <User className="w-12 h-12" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {t('upload_photo')}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="name">{t('full_name')}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="username">{t('username')}</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="johndoe"
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age">{t('age')}</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="gender">{t('gender')}</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t('male')}</SelectItem>
                    <SelectItem value="female">{t('female')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="height">{t('height')}</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="flex-1"
                  />
                  <Select value={formData.heightUnit} onValueChange={(value) => setFormData({ ...formData, heightUnit: value })}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inches">{t('in')}</SelectItem>
                      <SelectItem value="cm">{t('cm')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="weight">{t('current_weight')}</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="flex-1"
                  />
                  <Select value={formData.weightUnit} onValueChange={(value) => setFormData({ ...formData, weightUnit: value })}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lbs">{t('lbs')}</SelectItem>
                      <SelectItem value="kg">{t('kg')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
