#!/usr/bin/env node

/**
 * This script sets up the built-in books by copying them from the builtinBooks directory
 * to the public/samples directory so they can be accessed by the application.
 */

// We need to use require here since this is a regular Node.js script
require('@babel/register')({
  presets: ['@babel/preset-env', '@babel/preset-typescript'],
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
});

// Setup module aliases for imports
require('module-alias').addAliases({
  '@': require('path').resolve(__dirname, 'src'),
});

// Run the setup script
require('./src/scripts/setupSampleBooks').setupAllBuiltinBooks()
  .then((success) => {
    console.log(success ? 'Setup completed successfully' : 'Setup completed with errors');
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Uncaught error in setup script:', error);
    process.exit(1);
  }); 