import { Link } from 'react-router-dom';
import LanguageSelector from '../../components/LanguageSelector';
import ThemeSelector from '../../components/ThemeSelector';
import { useLocale } from '../../i18n/LocaleContext';
import leftCardImg from '../../assets/login-left-card.png';
import rightCardImg from '../../assets/login-right-card.png';
import '../Login/Login.css';

const PasswordResetLayout = ({ subtitle, children, footer }) => {
  const { t } = useLocale();

  return (
    <div className="login-screen-bg min-h-screen w-full flex items-center justify-center relative overflow-hidden font-body p-4 text-on-surface">
      <div className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-full bg-surface-container-lowest/80 px-2 shadow-soft backdrop-blur-md">
        <LanguageSelector />
        <ThemeSelector />
      </div>
      <div className="hidden lg:block absolute left-[8%] top-[55%] -translate-y-1/2">
        <div className="w-[220px] h-[340px] rounded-[2.5rem] overflow-hidden tilted-card-left">
          <img
            src={leftCardImg}
            className="w-full h-full object-cover"
            alt={t('auth.decorativeWave')}
          />
        </div>
      </div>
      <div className="hidden lg:block absolute right-[8%] top-[45%] -translate-y-1/2">
        <div className="w-[260px] h-[390px] rounded-[3rem] overflow-hidden tilted-card-right">
          <img
            src={rightCardImg}
            className="w-full h-full object-cover"
            alt={t('auth.decorativePetal')}
          />
        </div>
      </div>
      <div className="w-full max-w-[460px] z-10 flex flex-col items-center">
        <h1 className="text-4xl font-headline font-bold text-primary mb-1">
          DianaFlow
        </h1>
        <p className="text-sm text-on-surface-variant mb-8">{subtitle}</p>
        <div className="auth-card w-full bg-surface-container-lowest/80 backdrop-blur-md rounded-[3rem] border border-outline-variant/20 p-8 md:p-10 flex flex-col">
          {children}
        </div>
        {footer && (
          <div className="text-center mt-8 text-sm text-on-surface-variant">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export const ResetLinkFooter = ({ promptKey, linkKey, to }) => {
  const { t } = useLocale();
  return (
    <>
      {t(promptKey)}{' '}
      <Link to={to} className="font-bold text-primary hover:underline">
        {t(linkKey)}
      </Link>
    </>
  );
};

export default PasswordResetLayout;
