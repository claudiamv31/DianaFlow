export const formatDateLocal = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateMexican = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatCalendarWeekday = (locale, date) =>
  date
    .toLocaleDateString(locale, { weekday: 'short' })
    .slice(0, 1)
    .toLocaleUpperCase(locale);

export const parseLocalDate = (dateString) => {
  if (!dateString) return null;

  // Si es un número (timestamp UNIX en segundos), convertir a milisegundos
  if (typeof dateString === 'number' && dateString > 1000000000) {
    const date = new Date(dateString * 1000);
    // Obtener los componentes UTC y reinterpretarlos como fecha local
    const [year, month, day] = [
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      date.getUTCDate()
    ];
    return new Date(year, month - 1, day);
  }

  // Para strings, crear la fecha parseando como si fuera local
  if (typeof dateString === 'string') {
    const [year, month, day] = dateString.split('-');
    return new Date(year, month - 1, day);
  }

  return new Date(dateString);
};

export const formatLongDate = (date, locale = 'en-US') => {
  const dateObj = parseLocalDate(date);
  return dateObj?.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatMonthDay = (date, locale = 'en-US') => {
  const dateObj = parseLocalDate(date);
  return dateObj?.toLocaleDateString(locale, {
    month: 'long',
    day: 'numeric'
  });
};

export const formatDateShort = (date, locale = 'en-US') => {
  const dateObj = parseLocalDate(date);
  return dateObj?.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateDayMonthYear = (date, locale = 'en-US') => {
  const dateObj = parseLocalDate(date);
  return dateObj?.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};
