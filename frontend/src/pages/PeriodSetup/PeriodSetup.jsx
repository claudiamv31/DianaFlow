import { useState, useEffect } from 'react';
import { checkUser } from '../../database/authService';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import PeriodDataWizard from '../../components/PeriodDataWizard/PeriodDataWizard';
import toast from 'react-hot-toast';
import { buildPeriodPayload } from '../../utils/periodPayload';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useLocale } from '../../i18n/LocaleContext';

const PeriodSetup = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useLocale();

  useEffect(() => {
    const unsubscribe = checkUser((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleWizardComplete = async (formData) => {
    if (!user) {
      toast.error(t('setup.noUser'));
      return;
    }

    try {
      const payload = buildPeriodPayload(
        formData.lastDayPeriod,
        formData.daysOfPeriod
      );

      await apiClient.post('/periods', payload);
      toast.success(t('setup.saved'));

      // Redirect to home
      navigate('/');
    } catch (error) {
      console.error('❌ Error saving cycle:', error);
      toast.error(t('setup.saveError'));
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-on-surface/10 backdrop-blur-sm">
        <div
          className="bg-surface-container-lowest w-full max-w-lg shadow-soft overflow-hidden flex flex-col items-center justify-center"
          style={{ height: '300px', borderRadius: '3rem' }}
        >
          <LoadingSpinner layout="center" size="lg" />
        </div>
      </div>
    );
  }

  return <PeriodDataWizard onComplete={handleWizardComplete} />;
};

export default PeriodSetup;
