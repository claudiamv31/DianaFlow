import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../../api/apiClient';
import PeriodEditModal from '../../components/PeriodEditModal/PeriodEditModal';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { refreshCycleQueries } from '../../utils/queryInvalidation';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useLocale } from '../../i18n/LocaleContext';

const ArchivePage = () => {
  const queryClient = useQueryClient();
  const { t, locale } = useLocale();
  const [periods, setPeriods] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const isFetching = useRef(false);

  const handleSave = async (payload) => {
    try {
      await apiClient.put('/periods', payload);
      toast.success(t('archive.updated'), { icon: '🌸' });

      if (!payload.SelectedDays || payload.SelectedDays.length === 0) {
        setPeriods((prev) => prev.filter((p) => p.id !== payload.PeriodId));
      } else {
        const sortedDays = payload.SelectedDays.map((d) => d.date).sort();
        const startDate = sortedDays[0];
        const endDate = sortedDays[sortedDays.length - 1];
        const duration = sortedDays.length;

        setPeriods((prev) =>
          prev.map((p) =>
            p.id === payload.PeriodId
              ? { ...p, startDate, endDate, duration }
              : p
          )
        );
      }
      await refreshCycleQueries(queryClient);
      setSelectedPeriod(null);
    } catch (err) {
      console.error('Error updating period:', err);
      toast.error(t('archive.updateError'), { icon: '⚠️' });
    }
  };

  const fetchPeriods = async (pageToFetch) => {
    const token = localStorage.getItem('jwtToken');
    if (!token || isFetching.current) return;
    isFetching.current = true;
    setLoading(true);
    try {
      const response = await apiClient.get(`periods?page=${pageToFetch}&pageSize=5`);
      const data = response.data || [];
      if (data.length < 5) {
        setHasMore(false);
      }
      setPeriods((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const newPeriods = data.filter((p) => !existingIds.has(p.id));
        return [...prev, ...newPeriods];
      });
    } catch (err) {
      console.error('Error loading archive periods:', err);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  useEffect(() => {
    fetchPeriods(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 120
      ) {
        if (hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading]);

  const formatPeriodRange = (startDateStr, endDateStr) => {
    const parseDate = (dateStr) => {
      if (!dateStr) return null;
      const parts = dateStr.split('-');
      if (parts.length < 3) return null;
      return {
        year: parseInt(parts[0], 10),
        monthIdx: parseInt(parts[1], 10) - 1,
        day: parseInt(parts[2], 10)
      };
    };

    const start = parseDate(startDateStr);
    if (!start) return '';

    const formatDatePart = ({ year, monthIdx, day }) =>
      new Intl.DateTimeFormat(locale, {
        month: 'short',
        day: 'numeric'
      }).format(new Date(year, monthIdx, day));
    const startFormatted = formatDatePart(start);

    if (!endDateStr) {
      return `${startFormatted} - ${t('history.present')}`;
    }

    const end = parseDate(endDateStr);
    if (!end) return startFormatted;

    return `${startFormatted} - ${formatDatePart(end)}`;
  };

  const groupPeriodsByYear = (periodsList) => {
    const groups = {};
    periodsList.forEach((period) => {
      if (!period.startDate) return;
      const parts = period.startDate.split('-');
      if (parts.length > 0) {
        const year = parts[0];
        if (!groups[year]) {
          groups[year] = [];
        }
        groups[year].push(period);
      }
    });
    return Object.keys(groups)
      .sort((a, b) => b - a)
      .map((year) => ({
        year,
        periods: groups[year]
      }));
  };

  const groupedPeriods = groupPeriodsByYear(periods);
  const isInitialLoading = loading && periods.length === 0;
  const isLoadingMore = loading && periods.length > 0;

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto">
        {/* Editorial Header */}
        <header className="mb-10">
          <h1 className="text-headline-sm font-headline font-bold text-3xl text-primary-dim mb-2">
            {t('archive.title')}
          </h1>
          <p className="text-on-surface-variant font-body text-body-md leading-relaxed">
            {t('archive.description')}
          </p>
        </header>

        {isInitialLoading && <LoadingSpinner layout="center" size="lg" />}

        {periods.length === 0 && !loading && (
          <p className="text-on-surface-variant text-sm text-center py-8">
            {t('archive.none')}
          </p>
        )}

        <div className="space-y-12">
          {groupedPeriods.map(({ year, periods: yearPeriods }) => (
            <section key={year} className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-headline font-bold text-xl text-primary/60 tracking-wider">
                  {year}
                </h2>
                <div className="h-[1px] flex-grow ml-4 bg-outline-variant/20"></div>
              </div>
              <div className="space-y-4">
                {yearPeriods.map((period, idx) => {
                  const isCurrent = !period.endDate;
                  const cardBgClass = isCurrent
                    ? 'bg-surface-container-lowest border border-primary/20'
                    : 'bg-surface-container-low';
                  const durationText = period.duration
                    ? t('cycle.durationValue', { count: period.duration })
                    : t('archive.active');

                  return (
                    <div
                      key={period.id || idx}
                      className={`${cardBgClass} p-6 rounded-lg transition-transform hover:scale-[1.01] active:scale-95 cursor-pointer`}
                      onClick={() => setSelectedPeriod(period)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          {isCurrent && (
                            <p className="text-label-sm font-label font-medium text-primary uppercase tracking-widest mb-1">
                              {t('cycle.current')}
                            </p>
                          )}
                          <h3 className="text-lg font-headline font-bold text-on-surface">
                            {formatPeriodRange(period.startDate, period.endDate)}
                          </h3>
                        </div>
                        <span
                          className={`${
                            isCurrent
                              ? 'bg-primary-container/30 text-on-primary-container'
                              : 'bg-surface-container-highest text-on-surface-variant'
                          } px-3 py-1 rounded-full text-label-sm font-medium`}
                        >
                          {durationText}
                        </span>
                      </div>

                      {period.predominantFlow && (
                        <div className="flex flex-wrap gap-2">
                          <div className="flex items-center gap-1 bg-surface-container-high px-3 py-1.5 rounded-md text-on-surface-variant text-sm">
                            <span className="material-symbols-outlined text-[18px]">
                              water_drop
                            </span>
                            <span>{t(`flow.${period.predominantFlow}`)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {isLoadingMore && (
          <div className="flex justify-center py-6">
            <LoadingSpinner layout="inline" size="md" />
          </div>
        )}

      </main>

      {selectedPeriod && (
        <PeriodEditModal
          period={selectedPeriod}
          onClose={() => setSelectedPeriod(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default ArchivePage;
