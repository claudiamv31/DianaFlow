import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { checkUser } from '../../firebase/authService';
import apiClient from '../../api/apiClient';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorScreen from '../../components/ErrorScreen';
import SummaryStats from './SummaryStats';
import HistoryPeriod from './HistoryPeriods';

const StatsPage = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = checkUser((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const {
    data: dataSummary,
    error: errorSummary,
    isLoading: isLoadingSummary,
    refetch: refetchSummary
  } = useQuery({
    queryKey: ['summary', user?.uid],
    queryFn: async () => {
      if (!user) return null;
      const res = await apiClient.get(`stats/summary`);
      return res.data;
    },
    enabled: !!user
  });

  const {
    data: latestPeriods,
    error: errorPeriods,
    isLoading: isLoadingPeriods,
    refetch: refetchPeriods
  } = useQuery({
    queryKey: ['periods', user?.uid],
    queryFn: async () => {
      if (!user) return null;
      const res = await apiClient.get(`periods`);
      return res.data;
    },
    enabled: !!user
  });

  if (isLoadingSummary || isLoadingPeriods) return <LoadingSpinner />;
  if (errorSummary || errorPeriods)
    return (
      <ErrorScreen
        onRetry={() => {
          refetchSummary();
          refetchPeriods();
        }}
      />
    );

  return (
    <>
      <SummaryStats user={user} dataSummary={dataSummary} />
      <HistoryPeriod user={user} latestPeriods={latestPeriods} />
    </>
  );
};

export default StatsPage;
