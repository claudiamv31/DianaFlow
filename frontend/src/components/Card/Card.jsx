import { FaSpa } from 'react-icons/fa';

const Card = ({ title, description, icon }) => {
  return (
    <div className="rounded-lg bg-tertiary-container/50 p-6 backdrop-blur-md dark:bg-surface-container-high/80 dark:shadow-glass">
      <div className="mb-2 flex items-center gap-2">
        {icon && (
          <span className="mb-0.5 text-xl text-tertiary dark:text-primary">
            {icon === true ? <FaSpa /> : icon}
          </span>
        )}
        {title && (
          <h4 className="font-headline text-lg font-bold text-tertiary-dim dark:text-primary">
            {title}
          </h4>
        )}
      </div>
      {description && (
        <p className="font-body text-sm leading-relaxed text-on-tertiary-container dark:text-on-surface-variant">
          {description}
        </p>
      )}
    </div>
  );
};

export default Card;
