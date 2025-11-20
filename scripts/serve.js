#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;
const rootDir = path.join(__dirname, '..');
const buildDir = path.join(rootDir, 'build');

console.log('=== Serve Script Debug Info ===');
console.log(`Root directory: ${rootDir}`);
console.log(`Build directory: ${buildDir}`);
console.log(`Port: ${port}`);
console.log(`Current working directory: ${process.cwd()}`);
console.log(`__dirname: ${__dirname}`);

// Check if build directory exists
if (!fs.existsSync(buildDir)) {
  console.error(`\n❌ Error: Build directory does not exist at ${buildDir}`);
  console.error('Please run "npm run build" first.');
  process.exit(1);
}

// Check if build directory has content
const buildFiles = fs.readdirSync(buildDir);
if (buildFiles.length === 0) {
  console.error(`\n❌ Error: Build directory is empty at ${buildDir}`);
  console.error('Please run "npm run build" first.');
  process.exit(1);
}

console.log(`\n✅ Build directory exists with ${buildFiles.length} items`);
console.log(`Build files: ${buildFiles.slice(0, 5).join(', ')}${buildFiles.length > 5 ? '...' : ''}`);

// Check if serve.json exists
const serveJsonPath = path.join(rootDir, 'serve.json');
if (fs.existsSync(serveJsonPath)) {
  console.log(`✅ serve.json found at ${serveJsonPath}`);
} else {
  console.warn(`⚠️  serve.json not found at ${serveJsonPath}`);
}

console.log('\n🚀 Starting serve...\n');

// Spawn serve process - listen on 0.0.0.0 to accept external connections
const listenAddress = `0.0.0.0:${port}`;
console.log(`Listening on: ${listenAddress}`);
const serveProcess = spawn('npx', ['serve', '-s', 'build', '-l', listenAddress], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..'),
  shell: true
});

serveProcess.on('error', (error) => {
  console.error('Error starting serve:', error);
  process.exit(1);
});

serveProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`Serve exited with code ${code}`);
    process.exit(code);
  }
});

