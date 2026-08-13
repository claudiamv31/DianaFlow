import { useEffect, useMemo, useState } from 'react';
import Button from '../Button';
import LoadingSpinner from '../LoadingSpinner';
import apiClient from '../../api/apiClient';
import { formatLongDate } from '../../utils/calendarUtils';
import { useLocale } from '../../i18n/LocaleContext';

const severityValues = ['Mild', 'Moderate', 'Severe'];
const severityStyles = {
  Mild: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  Moderate: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  Severe: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200'
};
const symptomIcons = {
  headache: 'psychology',
  cramps: 'healing',
  bloating: 'air',
  fatigue: 'battery_2_bar',
  nausea: 'sick',
  back_pain: 'accessibility_new',
  breast_tenderness: 'favorite',
  mood_changes: 'mood',
  acne: 'face',
  food_cravings: 'restaurant',
  insomnia: 'bedtime',
  anxiety: 'sentiment_worried'
};
const EMPTY_SYMPTOMS = Object.freeze([]);

const LogTodayModal = ({ onClose, todayDate, existingSymptoms = EMPTY_SYMPTOMS, onSaved, isSaving = false }) => {
  const { t, locale } = useLocale();
  const [catalog, setCatalog] = useState([]);
  const [selected, setSelected] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    Promise.all([
      apiClient.get('/symptoms/catalog'),
      existingSymptoms.length ? Promise.resolve({ data: existingSymptoms }) : apiClient.get(`/symptoms?date=${todayDate}`)
    ]).then(([catalogResponse, existingResponse]) => {
      setCatalog(catalogResponse.data);
      if (!existingSymptoms.length) {
        const initial = {};
        existingResponse.data.forEach((symptom) => {
          initial[symptom.symptomId] = { severity: symptom.severity, id: symptom.id };
        });
        setSelected(initial);
      }
    }).finally(() => setLoading(false));
    return () => { document.body.style.overflow = 'unset'; };
  }, [existingSymptoms, todayDate]);

  useEffect(() => {
    const initial = {};
    existingSymptoms.forEach((symptom) => {
      initial[symptom.symptomId] = { severity: symptom.severity, id: symptom.id };
    });
    setSelected(initial);
  }, [existingSymptoms]);

  const groupedCatalog = useMemo(() => catalog.reduce((groups, symptom) => {
    (groups[symptom.category] ||= []).push(symptom);
    return groups;
  }, {}), [catalog]);

  const toggle = (symptom) => setSelected((current) => {
    const next = { ...current };
    if (next[symptom.id]) delete next[symptom.id];
    else next[symptom.id] = { severity: symptom.allowsSeverity ? 'Mild' : null };
    return next;
  });

  const save = async () => {
    const symptoms = Object.entries(selected).map(([symptomId, value]) => ({
      symptomId: Number(symptomId), severity: value.severity
    }));
    await apiClient.post('/symptoms/bulk', { date: todayDate, symptoms });
    onSaved?.();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm" onClick={(event) => event.target === event.currentTarget && !isSaving && onClose()}>
      <div className="bg-surface-container-lowest w-full max-w-2xl shadow-soft overflow-hidden flex flex-col border border-outline-variant/20 rounded-[2.5rem]" style={{ maxHeight: '90vh' }}>
        <div className="px-8 pt-8 pb-4 flex items-center justify-between">
          <div><h2 className="font-headline font-bold text-2xl text-on-surface">{t('symptoms.title')}</h2><p className="text-sm font-semibold tracking-widest uppercase text-primary mt-1">{formatLongDate(todayDate, locale)}</p></div>
          <button aria-label={t('common.close')} className="w-10 h-10 rounded-full bg-gray-100" onClick={onClose} disabled={isSaving}><span className="material-symbols-outlined">close</span></button>
        </div>
        <div className="px-8 pb-4 overflow-y-auto">
          <p className="text-on-surface-variant text-sm mb-6">{t('symptoms.choose')}</p>
          {loading ? <LoadingSpinner layout="center" size="md" /> : Object.entries(groupedCatalog).map(([category, symptoms]) => (
            <section key={category} className="mb-6"><h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">{t(`symptomCategory.${category}`)}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{symptoms.map((symptom) => {
                const value = selected[symptom.id];
                return <div key={symptom.id} className={`rounded-3xl border p-4 transition-all ${value ? 'border-primary bg-primary/10 shadow-sm' : 'border-outline-variant/30 bg-surface-container-lowest/40'}`}>
                  <button type="button" className="w-full text-left font-semibold text-sm text-on-surface" onClick={() => toggle(symptom)} disabled={isSaving} aria-pressed={Boolean(value)}>
                    <span className={`mb-3 flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${value ? 'bg-primary text-on-primary' : 'bg-primary/10 text-primary'}`} aria-hidden="true"><span className="material-symbols-outlined">{symptom.icon || symptomIcons[symptom.code] || 'healing'}</span></span>
                    <span className="flex items-start justify-between gap-2"><span>{t(`symptom.${symptom.code}`)}</span>{value && <span className="text-primary" aria-hidden="true">{'✓'}</span>}</span>
                  </button>
                  {value?.severity && <div className="mt-3" role="group" aria-label={t('symptoms.severityLabel')}>
                    <div className="grid grid-cols-3 gap-1 rounded-2xl bg-surface-container-lowest p-1">
                      {severityValues.map((severity) => <button key={severity} type="button" className={`min-w-0 rounded-xl px-1 py-2 text-[11px] font-bold leading-tight transition-colors ${value.severity === severity ? severityStyles[severity] : 'text-on-surface-variant hover:bg-primary/10'}`} onClick={() => setSelected((current) => ({ ...current, [symptom.id]: { ...value, severity } }))} disabled={isSaving} aria-pressed={value.severity === severity}>{t(`severity.${severity.toLowerCase()}`)}</button>)}
                    </div>
                  </div>}
                </div>;
              })}</div>
            </section>
          ))}
        </div>
        <div className="px-8 pb-8 pt-4 grid grid-cols-2 gap-4"><button className="h-14 rounded-full text-on-surface-variant" onClick={onClose} disabled={isSaving}>{t('common.cancel')}</button><Button className="!bg-none !bg-primary !text-on-primary" variant="primary" onClick={save} disabled={isSaving || loading || !Object.keys(selected).length}>{isSaving ? <LoadingSpinner size="sm" layout="inline" tone="current" label={t('symptoms.saving')} /> : t('symptoms.save')}</Button></div>
      </div>
    </div>
  );
};

export default LogTodayModal;
