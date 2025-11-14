/**
 * Server Configuration
 *
 * Configure your server connection settings here
 * Replace with your actual server IP address and port
 */

// Example configurations - uncomment and modify the one you need

// === LOCAL DEVELOPMENT ===
// For testing locally on your computer
export const LOCAL_CONFIG = {
  springBoot: 'http://localhost:8080/api',
  flask: 'http://localhost:5000/api',
};

// === NETWORK IP CONFIGURATION ===
export const NETWORK_CONFIG = {
  springBoot: 'http://10.63.91.4:8080/api',
  flask: 'http://10.63.91.4:5000/api',
};

export const ACTIVE_CONFIG = NETWORK_CONFIG;

export default ACTIVE_CONFIG;