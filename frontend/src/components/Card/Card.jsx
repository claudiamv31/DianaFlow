import { FaSpa } from "react-icons/fa";

const Card = ({ title, description, icon }) => {
    return (
        <div className="bg-tertiary-container/50 backdrop-blur-md p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
                {icon && <span className="text-tertiary text-xl mb-0.5">{icon === true ? <FaSpa/> : icon}</span>}
                {title && <h4 className="font-headline font-bold text-tertiary-dim text-lg">{title}</h4>}
            </div>
            {description && <p className="text-sm font-body text-on-tertiary-container leading-relaxed">{description}</p>}
        </div>
    );
};  

export default Card;