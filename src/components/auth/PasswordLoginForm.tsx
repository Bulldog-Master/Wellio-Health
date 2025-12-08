import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lock, Mail, User as UserIcon, Eye, EyeOff } from "lucide-react";
import { UserRole } from "./types";

interface PasswordLoginFormProps {
  loading: boolean;
  isLogin: boolean;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  name: string;
  setName: (value: string) => void;
  userRole: UserRole;
  setUserRole: (value: UserRole) => void;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (value: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onForgotPassword: () => void;
}

export const PasswordLoginForm = ({
  loading,
  isLogin,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  name,
  setName,
  userRole,
  setUserRole,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  onSubmit,
  onForgotPassword,
}: PasswordLoginFormProps) => {
  const { t } = useTranslation('auth');

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {!isLogin && (
        <div className="space-y-2">
          <Label htmlFor="name">{t('name')}</Label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              placeholder={t('full_name')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-10"
              required={!isLogin}
            />
          </div>
        </div>
      )}

      {!isLogin && (
        <div className="space-y-2">
          <Label htmlFor="role">{t('i_am_a')}</Label>
          <Select value={userRole} onValueChange={(value: UserRole) => setUserRole(value)}>
            <SelectTrigger id="role">
              <SelectValue placeholder={t('select_role')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">
                <div className="flex flex-col items-start">
                  <span className="font-medium">{t('fitness_enthusiast')}</span>
                  <span className="text-xs text-muted-foreground">{t('fitness_enthusiast_desc')}</span>
                </div>
              </SelectItem>
              <SelectItem value="trainer">
                <div className="flex flex-col items-start">
                  <span className="font-medium">{t('trainer_coach')}</span>
                  <span className="text-xs text-muted-foreground">{t('trainer_coach_desc')}</span>
                </div>
              </SelectItem>
              <SelectItem value="creator">
                <div className="flex flex-col items-start">
                  <span className="font-medium">{t('content_creator')}</span>
                  <span className="text-xs text-muted-foreground">{t('content_creator_desc')}</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">{t('email')}</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder={t('email_placeholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t('password')}</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder={t('password_placeholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {isLogin && (
          <div className="text-right">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm font-semibold underline text-[#00D4FF] hover:text-[#00E4FF]"
            >
              {t('forgot_password_q')}
            </button>
          </div>
        )}
      </div>

      {!isLogin && (
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t('confirm_password')}</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder={t('password_placeholder')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        disabled={loading}
      >
        {loading ? t('loading_ellipsis') : isLogin ? t('sign_in_btn') : t('create_account_btn')}
      </Button>
    </form>
  );
};
