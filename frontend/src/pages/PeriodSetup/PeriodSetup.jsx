import { useState, useEffect } from 'react';
import { checkUser } from '../../database/authService';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import PeriodDataWizard from '../../components/PeriodDataWizard/PeriodDataWizard';
import toast from 'react-hot-toast';

const PeriodSetup = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = checkUser((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleWizardComplete = async (formData) => {
    if (!user) {
      toast.error('No user logged in');
      return;
    }

    try {
      const payload = {
        lastDayPeriod: formData.lastDayPeriod,
        daysDurationOfCycle: parseInt(formData.daysOfCycle),
        duration: parseInt(formData.daysOfPeriod),
        userUid: user.id
      };

      const res = await apiClient.post(`/profiles/${user.id}/cycles`, payload);
      const data = res.data;
      toast.success('Cycle saved successfully!');

      // Redirect to home
      navigate('/');
    } catch (error) {
      console.error('❌ Error saving cycle:', error);
      toast.error('Error saving cycle. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-on-surface/10 backdrop-blur-sm">
        <div
          className="bg-surface-container-lowest w-full max-w-lg shadow-[0_12px_32px_rgba(52,50,47,0.06)] overflow-hidden flex flex-col items-center justify-center"
          style={{ height: '300px', borderRadius: '3rem' }}
        >
          <div className="w-12 h-12 border-4 border-surface-container-high border-t-primary/100 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return <PeriodDataWizard onComplete={handleWizardComplete} />;
};

export default PeriodSetup;
