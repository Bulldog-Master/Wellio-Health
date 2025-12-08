import { useTranslation } from 'react-i18next';

export const SkipToContent = () => {
  const { t } = useTranslation('a11y');
  
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-primary focus:text-primary-foreground focus:top-0 focus:left-0"
    >
      {t('skip_to_content', 'Skip to content')}
    </a>
  );
};

export default SkipToContent;
