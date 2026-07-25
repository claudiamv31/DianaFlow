export const isColdStartStatus = (status) => [502, 503, 504].includes(status);

export const isBrowserNetworkError = (error) =>
  !error?.response && error?.message === 'Network Error';

const isNavigatorOffline = () =>
  typeof navigator !== 'undefined' && navigator.onLine === false;

export const isColdStartError = (error) =>
  error?.code === 'ECONNABORTED' ||
  isColdStartStatus(error?.response?.status) ||
  (isBrowserNetworkError(error) && !isNavigatorOffline());

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
