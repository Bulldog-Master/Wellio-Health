import { useTranslation } from "react-i18next";
import { HeartPulse, Zap, Lock, Shield, Atom } from "lucide-react";
import authHero from "@/assets/auth-hero-new.jpg";

export const AuthHeroSection = () => {
  const { t } = useTranslation('auth');

  return (
    <div className="relative lg:block">
      <img 
        src={authHero} 
        alt={t('fitness_inspiration')}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-secondary/70 to-accent/60" />
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 text-white">
        <div className="mb-4 md:mb-6">
          <div className="flex items-center gap-2 mb-3 md:mb-4 animate-float">
            <Zap className="w-5 h-5 md:w-6 md:h-6 text-white drop-shadow-glow" />
            <span className="text-xs md:text-sm font-semibold uppercase tracking-wider bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              {t('your_journey')}
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-2 md:mb-3 drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] tracking-tight">
            {t('app_name')}
          </h1>
        </div>
        <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
          <HeartPulse className="w-6 h-6 md:w-8 md:h-8 text-white drop-shadow-glow" />
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold drop-shadow-lg">
            {t('welcome_back')}
          </h2>
        </div>
        <p className="text-base md:text-lg text-white/95 max-w-md drop-shadow-md mb-6">
          {t('hero_message')}
        </p>
        
        {/* Security Badges */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white text-xs">
            <Atom className="h-3.5 w-3.5 text-cyan-300" />
            <span>{t('quantum_resistant')}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white text-xs">
            <Lock className="h-3.5 w-3.5 text-green-300" />
            <span>{t('e2e_encryption')}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white text-xs">
            <Shield className="h-3.5 w-3.5 text-purple-300" />
            <span>{t('metadata_protection')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
