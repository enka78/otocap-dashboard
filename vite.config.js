import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('react') && !id.includes('react-router')) {
            return 'react-vendor';
          }
          if (id.includes('react-router')) {
            return 'router';
          }
          if (id.includes('@supabase')) {
            return 'supabase';
          }
          if (id.includes('@tiptap')) {
            return 'tiptap';
          }
          if (id.includes('lucide-react')) {
            return 'icons';
          }
          
          // Page-specific chunks
          if (id.includes('DashboardPage')) {
            return 'dashboard';
          }
          if (id.includes('OrdersPage') || id.includes('ordersService')) {
            return 'orders';
          }
          if (id.includes('ProductsPage') || id.includes('productsService')) {
            return 'products';
          }
          if (id.includes('BlogsPage') || id.includes('BannersPage') || 
              id.includes('CategoriesPage') || id.includes('BrandsPage')) {
            return 'content-management';
          }
          
          // Default vendor chunk for other node_modules
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})
