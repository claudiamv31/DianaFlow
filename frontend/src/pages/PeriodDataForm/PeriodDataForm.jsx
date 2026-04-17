import { useState, useEffect } from 'react';
import { checkUser } from '../../firebase/authService';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';

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
      alert('No hay usuario logeado');
      return;
    }

    try {
      const payload = {
        lastDayPeriod,
        daysDurationOfCycle: parseInt(daysOfCycle),
        duration: parseInt(daysOfPeriod),
        userUid: user.id
      };

      const res = await apiClient.post(`/profiles/${user.id}/cycles`, payload);

      const data = res.data;
      console.log('✅ Respuesta del backend:', data);
      alert('Ciclo guardado correctamente');

      navigate('/'); // Redirige a home o a donde quieras
    } catch (error) {
      console.error('❌ Error al guardar el ciclo:', error);
      alert('Error al guardar el ciclo');
    }
  };

  if (loading) return <p>Cargando usuario...</p>;

  return (
    <form onSubmit={handleSubmit}>
      <label>Cuántos días suele durar tu periodo</label>
      <input
        type="number"
        min={1}
        max={15}
        value={daysOfPeriod}
        onChange={(e) => setDaysPeriod(e.target.value)}
      />

      <label>Cuántos días suele durar tu ciclo</label>
      <input
        type="number"
        min={15}
        max={60}
        value={daysOfCycle}
        onChange={(e) => setDaysCycle(e.target.value)}
      />

      <label>Cuál es la fecha de tu último periodo</label>
      <input
        type="date"
        value={lastDayPeriod}
        max={new Date().toISOString().split('T')[0]}
        onChange={(e) => setLastDayPeriod(e.target.value)}
      />

      <button type="submit">Aceptar</button>
    </form>
  );
};

export default PeriodDataForm;
