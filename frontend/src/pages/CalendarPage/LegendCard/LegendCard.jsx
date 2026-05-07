import './LegendCard.css';

const LegendCard = () => {
    return (
        <div className="legend-card-container">
            <h2>Legend</h2>
            <ul>
                <li>Actual period</li>
                <li>Predicted period</li>
                <li>Today</li>
            </ul>
        </div>
    );
};

export default LegendCard;