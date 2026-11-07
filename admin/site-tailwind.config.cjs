const { theme, darkMode, plugins } = require('./shop-tailwind.config.cjs');

module.exports = {
  content: ['./index.html', './menu/index.html', './storia.html', './assets/site.js'],
  theme,
  darkMode,
  plugins,
};
