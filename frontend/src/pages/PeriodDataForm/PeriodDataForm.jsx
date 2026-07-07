import { useState, useEffect } from 'react';
import { checkUser } from '../../database/authService';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { buildPeriodPayload } from '../../utils/periodPayload';
import LoadingSpinner from '../../components/LoadingSpinner';

const PeriodDataForm = () => {
  const [daysOfPeriod, setDaysPeriod] = useState(5);
  const [daysOfCycle, setDaysCycle] = useState(28);
  const [lastDayPeriod, setLastDayPeriod] = useState('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      console.error('There is not user');
      return;
    }

    try {
      const payload = buildPeriodPayload(lastDayPeriod, daysOfPeriod);

      await apiClient.post('/periods', payload);

      navigate('/');
    } catch (error) {
      console.error('❌ Error saving cycle:', error);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <form onSubmit={handleSubmit}>
      <label>How many days does your period usually last?</label>
      <input
        type="number"
        min={1}
        max={15}
        value={daysOfPeriod}
        onChange={(e) => setDaysPeriod(e.target.value)}
      />

      <label>How many days does your cycle usually last?</label>
      <input
        type="number"
        min={15}
        max={60}
        value={daysOfCycle}
        onChange={(e) => setDaysCycle(e.target.value)}
      />

      <label>What is the date of your last period?</label>
      <input
        type="date"
        value={lastDayPeriod}
        max={new Date().toISOString().split('T')[0]}
        onChange={(e) => setLastDayPeriod(e.target.value)}
      />

      <button type="submit">Accept</button>
    </form>
  );
};

export default PeriodDataForm;
