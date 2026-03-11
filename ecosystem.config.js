const fs = require('fs');
const path = require('path');
const os = require('os');
const dotenv = require('dotenv');

// Priority order for env files
const envFiles = ['.env', '.env.local', '.env.dev', '.env.uat'];

let loadedEnvFile = null;

for (const file of envFiles) {
  const fullPath = path.resolve(__dirname, file);
  if (fs.existsSync(fullPath)) {
    dotenv.config({ path: fullPath });
    loadedEnvFile = file;
    console.log(`Loaded environment from ${file}`);
    break;
  }
}

if (!loadedEnvFile) {
  console.warn('No env file found. Using default NODE_ENV=local');
}

// Get the number of available CPUs
const totalCPUs = os.cpus().length;
console.log('totalCPUs', totalCPUs);

// Total system memory in bytes → MB
const totalMemBytes = os.totalmem();
const totalMemMB = totalMemBytes / (1024 * 1024);
console.log('totalMemMB:', totalMemMB.toFixed(1), 'MB');

// Reserve 10% for host (OS, services, antivirus, etc.)
const reservedMemMB = totalMemMB * 0.1;
console.log('reservedMemMB (10%):', reservedMemMB.toFixed(1), 'MB');

// Usable memory for Node.js instances
const usableMemMB = totalMemMB - reservedMemMB;
console.log('usableMemMB:', usableMemMB.toFixed(1), 'MB');

// Memory per instance (MB), floored to integer
const memPerInstanceMB = Math.floor(usableMemMB / totalCPUs);
console.log('memPerInstanceMB: can be set to', memPerInstanceMB, 'MB');

const maxMemory = `${memPerInstanceMB}M`; // eg: 1500M

console.log('maxMemory', maxMemory);

// Environment-specific configurations
const configByEnv = {
  local: { instances: 1 },
  dev: { instances: 1 },
  uat: { instances: 1 },
  prod: { instances: totalCPUs, max_memory_restart: maxMemory },
};

// Use NODE_ENV from .env
const env = process.env.NODE_ENV || 'local';
console.log('found NODE_ENV:', process.env.NODE_ENV);
console.log('set env:', env);

const currentConfig = configByEnv[env] || configByEnv.local;
console.log('Config:', currentConfig);
console.log('Config:max_memory_restart set to', currentConfig.max_memory_restart, `for ${env} env`);

module.exports = {
  apps: [
    {
      name: 'MyAPI',
      script: 'dist/src/main.js',
      instances: currentConfig.instances,
      max_memory_restart: currentConfig.max_memory_restart,
      autorestart: true,
      watch: false,
      out_file: 'out_log.log',
      error_file: 'error_log.log',
      env_local: { NODE_ENV: 'local' },
      env_dev: { NODE_ENV: 'dev' },
      env_uat: { NODE_ENV: 'uat' },
      env_prod: { NODE_ENV: 'prod' },
    },
  ],
};
