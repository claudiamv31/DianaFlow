import { useEffect, useMemo, useState } from 'react';
import Button from '../Button';
import LoadingSpinner from '../LoadingSpinner';
import apiClient from '../../api/apiClient';
import { formatLongDate } from '../../utils/calendarUtils';
import { useLocale } from '../../i18n/LocaleContext';

const severityValues = ['Mild', 'Moderate', 'Severe'];

const LogTodayModal = ({ onClose, todayDate, existingSymptoms = [], onSaved, isSaving = false }) => {
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
          initial[symptom.symptomId] = { severity: symptom.severity, notes: symptom.notes || '', id: symptom.id };
        });
        setSelected(initial);
      }
    }).finally(() => setLoading(false));
    return () => { document.body.style.overflow = 'unset'; };
  }, [existingSymptoms, todayDate]);

  useEffect(() => {
    const initial = {};
    existingSymptoms.forEach((symptom) => {
      initial[symptom.symptomId] = { severity: symptom.severity, notes: symptom.notes || '', id: symptom.id };
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
    else next[symptom.id] = { severity: 'Mild', notes: '' };
    return next;
  });

  const save = async () => {
    const symptoms = Object.entries(selected).map(([symptomId, value]) => ({
      symptomId: Number(symptomId), severity: value.severity, notes: value.notes || null
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
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{symptoms.map((symptom) => {
                const value = selected[symptom.id];
                return <div key={symptom.id} className={`rounded-2xl border p-3 ${value ? 'border-primary bg-primary/10' : 'border-outline-variant/30'}`}>
                  <button className="w-full text-left font-semibold text-sm text-on-surface" onClick={() => toggle(symptom)} disabled={isSaving}>{value ? '✓ ' : ''}{t(`symptom.${symptom.code}`)}</button>
                  {value && <><select className="mt-2 w-full rounded-lg bg-surface-container-lowest text-xs p-2" value={value.severity} onChange={(event) => setSelected((current) => ({ ...current, [symptom.id]: { ...value, severity: event.target.value } }))}>{severityValues.map((severity) => <option key={severity}>{severity}</option>)}</select><input className="mt-2 w-full rounded-lg bg-surface-container-lowest text-xs p-2" placeholder={t('symptoms.notePlaceholder')} value={value.notes} onChange={(event) => setSelected((current) => ({ ...current, [symptom.id]: { ...value, notes: event.target.value } }))} /></>}
                </div>;
              })}</div>
            </section>
          ))}
        </div>
        <div className="px-8 pb-8 pt-4 grid grid-cols-2 gap-4"><button className="h-14 rounded-full text-on-surface-variant" onClick={onClose} disabled={isSaving}>{t('common.cancel')}</button><Button variant="primary" onClick={save} disabled={isSaving || loading || !Object.keys(selected).length}>{isSaving ? <LoadingSpinner size="sm" layout="inline" tone="current" label={t('symptoms.saving')} /> : t('symptoms.save')}</Button></div>
      </div>
    </div>
  );
};

export default LogTodayModal;
