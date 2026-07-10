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

const StatsPage = () => {
  const [user, setUser] = useState(null);

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

  if (isLoading) return <LoadingSpinner label="Loading DianaFlow..." showLabel />;
  if (error)
    return (
      <ErrorScreen
        message={error.message}
        onRetry={() => {
          refetchSummary();
        }}
      />
    );

  const getEmpatheticInsight = (summaryData) => {
    if (!summaryData || !summaryData.periods || summaryData.periods.length < 2) {
      return "Welcome! Once you log at least two cycles, we will begin analyzing your trends and consistency here.";
    }

    const regularity = summaryData.regularity;

    if (regularity >= 85) {
      return `Your cycle regularity is excellent (${regularity}% consistency). This month, consider prioritizing iron-rich foods as your luteal phase approaches.`;
    } else if (regularity >= 70) {
      return `Your cycle is moderately consistent (${regularity}% regularity). Minor variations are completely normal and can be influenced by stress, sleep, or travel.`;
    } else {
      return `Your cycle is showing some variations (${regularity}% regularity). Tracking daily energy levels and flow can help you understand your unique biological rhythm.`;
    }
  };

  return (
    <div className="mx-5 my-10">
      <p className="text-primary/100 font-headline font-bold tracking-tight text-lg pt-4">
        Analysis
      </p>
      <h1 className="font-headline font-extrabold text-4xl tracking-tighter text-on-surface">
        Your Cycle Sanctuary
      </h1>
      <p className="text-on-surface-variant max-w-md pt-2 pb-4">
        Detailed insights into your patterns and biological rhythms over the
        last six months.
      </p>
      <SummaryStats summary={summary} />
      <div className="mt-8 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-6 items-stretch">
          <div className="w-full md:w-[80%]">
            <VisualInsights summary={summary} />
          </div>
          <div className="w-full md:w-[20%]">
            <Card
              title="Empathetic Insight"
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
