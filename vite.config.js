import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode }) => {
  const isProduction = mode === 'production'
  const isDevelopment = mode === 'development'
  
  // API Configuration - Use ngrok URL in production
  const API_URL = isDevelopment 
    ? 'https://732e-168-120-248-4.ngrok-free.app'  // Local development
    : process.env.VITE_API_URL || 'https://hammerhead-app-2s5sw.ondigitalocean.app/' // Production backend URL from env or ngrok
  
  console.log(`🔧 Vite build mode: ${mode}`)
  console.log(`🔧 Command: ${command}`)
  console.log(`🌐 API URL: ${API_URL}`)
  
  return {
    plugins: [
      react({
        jsxRuntime: 'automatic'
      })
    ],
    base: '/', // Important for Vercel deployment
    server: {
      port: 3000,
      open: true,
      host: true,
      hmr: {
        overlay: true
      },
      proxy: isDevelopment ? {
        // Only use proxy in development
        '/api': {
          target: 'http://localhost:4000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path
        }
      } : undefined
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            animations: ['framer-motion']
          }
        }
      },
      minify: isProduction,
      chunkSizeWarningLimit: 1000,
      target: 'esnext',
      cssCodeSplit: true,
      assetsDir: 'assets',
      emptyOutDir: true
    },
    css: {
      devSourcemap: isDevelopment
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'framer-motion'],
      exclude: []
    },
    define: {
      __APP_VERSION__: JSON.stringify('2.0.0'),
      __IS_PRODUCTION__: JSON.stringify(isProduction),
      __IS_DEVELOPMENT__: JSON.stringify(isDevelopment),
      __API_URL__: JSON.stringify(API_URL) // Make API URL available globally
    },
    preview: {
      port: 4173,
      host: true
    },
    envPrefix: 'VITE_',
    resolve: {
      alias: {
        '@': '/src',
        '@components': '/src/components',
        '@assets': '/src/assets'
      }
    },
    publicDir: 'public',
    esbuild: {
      drop: isProduction ? ['console', 'debugger'] : [],
      target: 'esnext'
    }
  }
})
