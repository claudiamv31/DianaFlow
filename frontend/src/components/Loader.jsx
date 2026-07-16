import LoadingSpinner from './LoadingSpinner';
import { useLocale } from '../i18n/LocaleContext';

export default function Loader() {
  const { t } = useLocale();
  return (
    <LoadingSpinner
      layout="screen"
      size="lg"
      label={t('common.loadingApp')}
      showLabel
    />
  );
}
