const ACCENTS = {
  a: 'à', e: 'é', i: 'ï', o: 'ô', u: 'ü',
  A: 'À', E: 'É', I: 'Ï', O: 'Ô', U: 'Ü'
};

export const pseudoLocalize = (message) => {
  const expanded = message
    .split(/({{.*?}})/g)
    .map((part) => {
      if (part.startsWith('{{')) return part;
      return [...part]
        .map((character) => {
          const accented = ACCENTS[character] || character;
          return /[aeiouAEIOU]/.test(character) ? accented + accented : accented;
        })
        .join('');
    })
    .join('');

  return `[${expanded}]`;
};

export const createPseudoCatalogue = (catalogue) =>
  Object.fromEntries(
    Object.entries(catalogue).map(([key, message]) => [key, pseudoLocalize(message)])
  );
