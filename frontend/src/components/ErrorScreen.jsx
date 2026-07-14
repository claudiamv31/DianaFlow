import './ErrorScreen.css';
import Button from 'react-bootstrap/Button';
import { useLocale } from '../i18n/LocaleContext';

export default function ErrorScreen({ message, messageKey, onRetry }) {
  const { t } = useLocale();

  return (
    <div className="error-screen">
      <h2>{t('error.title')}</h2>
      <p>{messageKey ? t(messageKey) : message || t('error.loadingPage')}</p>
      {onRetry && (
        <Button variant="primary" onClick={onRetry} className="btn">
          {t('common.tryAgain')}
        </Button>
      )}
    </div>
  );
}
