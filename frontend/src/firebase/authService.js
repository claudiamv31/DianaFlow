import { supabase } from '../supabaseClient';

export const login = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const register = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export function checkUser(callback) {
  // Suscribirse a cambios en la sesión de Supabase
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      // Supabase devuelve session.user en lugar del user directo de Firebase
      callback(session?.user || null);
    }
  );

  // Devolver una función para desuscribirse cuando el componente se desmonte
  return () => subscription.unsubscribe();
}

export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
