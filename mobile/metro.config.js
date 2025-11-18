const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.server = {
  ...config.server,
  port: Number(process.env.EXPO_DEV_SERVER_PORT) || 19000,
};

module.exports = config;
