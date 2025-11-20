#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;
const buildDir = path.join(__dirname, '..', 'build');

// Check if build directory exists
if (!fs.existsSync(buildDir)) {
  console.error(`Error: Build directory does not exist at ${buildDir}`);
  console.error('Please run "npm run build" first.');
  process.exit(1);
}

// Check if build directory has content
const buildFiles = fs.readdirSync(buildDir);
if (buildFiles.length === 0) {
  console.error(`Error: Build directory is empty at ${buildDir}`);
  console.error('Please run "npm run build" first.');
  process.exit(1);
}

console.log(`Serving build directory: ${buildDir}`);
console.log(`Port: ${port}`);
console.log('Starting serve...\n');

// Spawn serve process
const serveProcess = spawn('npx', ['serve', '-s', 'build', '-l', port.toString()], {
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

