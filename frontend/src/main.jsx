import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import 'react-toastify/dist/ReactToastify.css';

// Importamos el nuevo proveedor que creamos
import { ThemeContextProvider } from './context/ThemeContext.jsx';

// ❌ Ya no necesitamos tu viejo initializeTheme(), porque 
// ThemeContextProvider ahora se encarga de todo de forma automática.

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Envolvemos toda la app aquí */}
    <ThemeContextProvider>
      <App />
    </ThemeContextProvider>
  </StrictMode>,
)