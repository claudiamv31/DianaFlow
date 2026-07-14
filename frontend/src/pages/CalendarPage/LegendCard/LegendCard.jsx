import { useLocale } from '../../../i18n/LocaleContext';

const LegendCard = () => {
    const { t } = useLocale();
    return (
        <div className="bg-surface-container-low p-6 rounded-lg">
            <h4 className="font-label font-bold text-sm uppercase tracking-widest text-on-surface-variant mb-6">{t('calendar.legend')}</h4>
            <ul className='space-y-4 p-0 m-0'>
                <li className='flex items-center gap-3'>
                    <span className="w-4 h-4 rounded-full bg-primary/20 border border-primary/70"></span>
                    <span className="text-sm font-body text-on-surface">{t('calendar.actualPeriod')}</span>
                </li>
                <li className='flex items-center gap-3'>
                    <span className="w-4 h-4 rounded-full border-2 border-dashed border-primary/40"></span>
                    <span className="text-sm font-body text-on-surface">{t('calendar.predictedPeriod')}</span>
                </li>
                <li className='flex items-center gap-3'>
                    <span className="w-4 h-4 rounded-full bg-secondary/100"></span>
                    <span className="text-sm font-body text-on-surface">{t('calendar.today')}</span>
                </li>
                <li className='flex items-center gap-3'>
                    <span className="flex w-4 h-4 items-center justify-center text-xs font-bold text-fertility">
                        12
                    </span>
                    <span className="text-sm font-body text-on-surface">{t('calendar.fertileDay')}</span>
                </li>
                <li className='flex items-center gap-3'>
                    <span className="flex w-4 h-4 items-center justify-center rounded-full border-2 border-dashed border-fertility text-xs font-bold text-fertility">
                        14
                    </span>
                    <span className="text-sm font-body text-on-surface">{t('calendar.peakFertility')}</span>
                </li>
            </ul>
        </div>
    );
};

export default LegendCard;
