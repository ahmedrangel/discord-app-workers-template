/**
 * General functions
 */
export const getFrom = (name, options) => {
  const option = options.find((option) => option.name === name);
  return option?.value ?? null;
};

export const getRandom = (options) => {
  const min = options.min ?? 1;
  return Math.round((Math.random() * (options.max - min)) + min);
};