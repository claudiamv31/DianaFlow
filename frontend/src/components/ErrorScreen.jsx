import Button from './Button';
import { useLocale } from '../i18n/LocaleContext';

export default function ErrorScreen({ message, messageKey, onRetry }) {
  const { t } = useLocale();

  return (
    <div className="flex h-screen flex-col items-center justify-center text-center">
      <h2 className="text-3xl font-bold text-primary">{t('error.title')}</h2>
      <p className="mt-2 text-on-surface">
        {messageKey ? t(messageKey) : message || t('error.loadingPage')}
      </p>
      {onRetry && (
        <Button variant="primary" onClick={onRetry} className="mt-4 text-sm">
          {t('common.tryAgain')}
        </Button>
      )}
    </div>
  );
}
