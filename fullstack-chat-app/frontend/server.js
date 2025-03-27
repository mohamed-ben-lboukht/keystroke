import { createServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  try {
    const server = await createServer({
      configFile: path.resolve(__dirname, 'vite.config.js'),
      root: __dirname,
      server: {
        port: 5173,
        host: '0.0.0.0',
        strictPort: true,
        open: false,
      },
      logLevel: 'info',
    });
    
    await server.listen();
    server.printUrls();
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
}

startServer(); 