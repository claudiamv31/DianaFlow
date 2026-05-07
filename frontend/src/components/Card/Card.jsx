const Card = ({ title, description, children, button, onClickButton }) => {
    return (
        <div className="card">
            {title && <h3>{title}</h3>}
            {description && <p>{description}</p>}
            {children}
            {button && <button onClick={onClickButton}>{button}</button>}
        </div>
    );
};  

export default Card;