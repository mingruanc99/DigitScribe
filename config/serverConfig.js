// === LOCAL DEVELOPMENT ===
export const LOCAL_CONFIG = {
  springBoot: 'http://localhost:8080/api',
  flask: 'http://localhost:5000/api',
};

// === NETWORK IP CONFIGURATION ===
export const NETWORK_CONFIG = {
  springBoot: 'http://192.168.56.1:8081',
  flask: 'http://10.63.164.227:5000',
};

export const ACTIVE_CONFIG = NETWORK_CONFIG;

export default ACTIVE_CONFIG;