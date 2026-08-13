export const isColdStartStatus = (status) => [502, 503, 504].includes(status);

export const isBrowserNetworkError = (error) =>
  !error?.response && error?.message === 'Network Error';

const isNavigatorOffline = () =>
  typeof navigator !== 'undefined' && navigator.onLine === false;

const isUnclassifiedSignUpBadRequest = (error, config = error?.config) => {
  const method = (config?.method || '').toLowerCase();
  const url = config?.url || '';

  return (
    method === 'post' &&
    url.includes('/users/sign-up') &&
    error?.response?.status === 400 &&
    !error?.response?.data?.code
  );
};

export const isColdStartError = (error, config = error?.config) =>
  error?.code === 'ECONNABORTED' ||
  isColdStartStatus(error?.response?.status) ||
  (isBrowserNetworkError(error) && !isNavigatorOffline()) ||
  isUnclassifiedSignUpBadRequest(error, config);

export const getNetworkErrorMessageKey = (error) => {
  if (error?.code === 'ECONNABORTED') return 'network.waking';
  if (isBrowserNetworkError(error)) {
    return isNavigatorOffline() ? 'network.offline' : 'network.waking';
  }
  if (isColdStartStatus(error?.response?.status)) {
    return 'network.waking';
  }
  return null;
};
