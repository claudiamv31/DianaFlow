const LegendCard = () => {
    return (
        <div className="bg-surface-container-low p-6 rounded-lg">
            <h4 className="font-label font-bold text-sm uppercase tracking-widest text-on-surface-variant mb-6">Legend</h4>
            <ul className='space-y-4 p-0 m-0'>
                <li className='flex items-center gap-3'>
                    <span className="w-4 h-4 rounded-full bg-primary/20 border border-primary/70"></span>
                    <span className="text-sm font-body text-on-surface">Actual Period</span>
                </li>
                <li className='flex items-center gap-3'>
                    <span className="w-4 h-4 rounded-full border-2 border-dashed border-primary/40"></span>
                    <span className="text-sm font-body text-on-surface">Predicted Period</span>
                </li>
                <li className='flex items-center gap-3'>
                    <span className="w-4 h-4 rounded-full bg-secondary/100"></span>
                    <span className="text-sm font-body text-on-surface">Today</span>
                </li>
            </ul>
        </div>
    );
};

export default LegendCard;