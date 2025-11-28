#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

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

console.log('\n🚀 Starting HTTP server...\n');
console.log(`Listening on: 0.0.0.0:${port}`);

// Create HTTP server with timeout settings
const server = http.createServer((req, res) => {
  // Health check endpoint - respond immediately
  if (req.url === '/health' || req.url === '/healthcheck') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: Date.now() }));
    return;
  }

  // Set timeout to prevent Cloudflare 524 errors (reduced to 5 seconds for faster response)
  req.setTimeout(5000, () => {
    if (!res.headersSent) {
      res.writeHead(504, { 'Content-Type': 'text/plain' });
      res.end('Gateway Timeout');
    }
  });
  
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  let filePath = path.join(buildDir, parsedUrl.pathname === '/' ? 'index.html' : parsedUrl.pathname);

  // Security: prevent directory traversal
  if (!filePath.startsWith(buildDir)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // If file doesn't exist and it's not a file extension, try index.html (SPA routing)
  try {
    if (!fs.existsSync(filePath)) {
      filePath = path.join(buildDir, 'index.html');
    } else {
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        filePath = path.join(buildDir, 'index.html');
      }
    }
  } catch (err) {
    // If stat fails, default to index.html
    filePath = path.join(buildDir, 'index.html');
  }

  // Get file extension for content type
  const ext = path.extname(filePath).toLowerCase();
  const contentTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
  };

  const contentType = contentTypes[ext] || 'application/octet-stream';

  // Use async file reading for better error handling
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found, serve index.html for SPA routing
        fs.readFile(path.join(buildDir, 'index.html'), (err2, data2) => {
          if (err2) {
            console.error('Error reading index.html:', err2);
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
          } else {
            res.writeHead(200, { 
              'Content-Type': 'text/html',
              'Cache-Control': 'no-cache'
            });
            res.end(data2);
          }
        });
      } else {
        console.error('Error reading file:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    } else {
      const headers = {
        'Content-Type': contentType,
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY'
      };

      // Add Accept-Ranges for video files
      if (ext === '.mp4') {
        headers['Accept-Ranges'] = 'bytes';
      }

      res.writeHead(200, headers);
      res.end(data);
    }
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server running at http://0.0.0.0:${port}/`);
  console.log(`✅ Health check available at http://0.0.0.0:${port}/health`);
  console.log(`✅ Ready to serve requests`);
});

// Set server timeout (increased for Railway stability)
server.timeout = 30000; // 30 seconds - enough time for file operations
server.keepAliveTimeout = 65000; // 65 seconds (Railway default)
server.headersTimeout = 66000; // 66 seconds (slightly more than keepAliveTimeout)

server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

