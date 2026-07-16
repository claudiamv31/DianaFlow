import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { checkUser } from '../../database/authService';
import apiClient from '../../api/apiClient';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorScreen from '../../components/ErrorScreen';
import SummaryStats from './SummaryStats';
import HistoryPeriod from './HistoryPeriods';
import VisualInsights from './VisualInsights';
import Card from '../../components/Card/Card.jsx';
import { useLocale } from '../../i18n/LocaleContext';
import { getErrorMessageKey } from '../../api/AppError';

const StatsPage = () => {
  const [user, setUser] = useState(null);
  const { t } = useLocale();

  useEffect(() => {
    const unsubscribe = checkUser((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const {
    data: summary,
    error,
    isLoading,
    refetch: refetchSummary
  } = useQuery({
    queryKey: ['summary', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const res = await apiClient.get(`stats/summary`);
      return res.data;
    },
    enabled: !!user
  });

  if (isLoading)
    return <LoadingSpinner label={t('common.loadingApp')} showLabel />;
  if (error)
    return (
      <ErrorScreen
        messageKey={getErrorMessageKey(error, 'error.loadingPage')}
        onRetry={() => {
          refetchSummary();
        }}
      />
    );

  const getEmpatheticInsight = (summaryData) => {
    if (!summaryData || !summaryData.periods || summaryData.periods.length < 2) {
      return t('stats.insightWelcome');
    }

    const regularity = summaryData.regularity;

    if (regularity >= 85) {
      return t('stats.insightExcellent', { regularity });
    } else if (regularity >= 70) {
      return t('stats.insightModerate', { regularity });
    } else {
      return t('stats.insightVariable', { regularity });
    }
  };

  return (
    <div className="mx-5 my-10">
      <p className="text-primary/100 font-headline font-bold tracking-tight text-lg pt-4">
        {t('stats.analysis')}
      </p>
      <h1 className="font-headline font-extrabold text-4xl tracking-tighter text-on-surface">
        {t('stats.title')}
      </h1>
      <p className="text-on-surface-variant max-w-md pt-2 pb-4">
        {t('stats.description')}
      </p>
      <SummaryStats summary={summary} />
      <div className="mt-8 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-6 items-stretch">
          <div className="w-full md:w-[80%]">
            <VisualInsights summary={summary} />
          </div>
          <div className="w-full md:w-[20%]">
            <Card
              title={t('stats.insightTitle')}
              description={getEmpatheticInsight(summary)}
              icon={true}
            />
          </div>
        </div>
        <HistoryPeriod latestPeriods={summary?.periods} />
      </div>
    </div>
  );
};

export default StatsPage;
