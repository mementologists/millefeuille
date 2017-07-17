module.exports = {
  env: {
    'es6': true
  },
  extends: [
    './node_modules/eslint-config-airbnb/index.js' 
  ],
  rules: {
    'comma-dangle': 'off',
    'react/require-default-props': 'off'
  },
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module",
    ecmaFeatures: {
      'jsx': true
    }
  }
};
