# Sistema de Temas - Light/Dark Mode

## Descripción General
El sistema ha sido actualizado para soportar completamente modos de tema claro y oscuro, con detección automática de la preferencia del sistema y transiciones suaves entre temas.

## Características Implementadas

### ✅ Variables CSS Mejoradas
- **Sistema de colores completo** con paletas para light y dark mode
- **Variables semánticas** que se adaptan automáticamente al tema
- **Transiciones suaves** para cambios de tema sin parpadeos
- **Soporte responsive** completo

### ✅ Utilidades JavaScript
- **`utils/theme.js`**: Conjunto completo de utilidades para manejo de temas
- **Detección automática** del tema preferido del sistema
- **Persistencia** en localStorage
- **Hook personalizado `useTheme()`** para componentes React

### ✅ Interfaz de Usuario
- **Botón de cambio rápido** en el header para alternar entre light/dark
- **Menú completo** con opciones: Claro, Oscuro, y Seguir Sistema
- **Iconos intuitivos** usando React Icons (Heroicons)

### ✅ Componentes Actualizados
- **Header**: Selector de tema integrado
- **LoadingModal**: Estilos adaptativos para ambos modos
- **Sidebar**: Compatible con variables de tema
- **Todos los componentes** usan las nuevas variables CSS

## Uso del Sistema

### Cambio Programático de Tema
```javascript
import { setTheme, toggleTheme, THEMES } from '../utils/theme';

// Cambiar a tema específico
setTheme(THEMES.LIGHT);   // Modo claro
setTheme(THEMES.DARK);    // Modo oscuro
setTheme(THEMES.SYSTEM);  // Seguir sistema

// Alternar entre claro y oscuro
toggleTheme();
```

### Hook de React
```javascript
import { useTheme } from '../utils/theme';

function MiComponente() {
  const { 
    theme,          // Tema configurado (light/dark/system)
    effectiveTheme, // Tema efectivo (light/dark)
    setTheme,       // Función para cambiar tema
    toggleTheme,    // Función para alternar
    isLight,        // Boolean: es modo claro
    isDark,         // Boolean: es modo oscuro
    isSystem        // Boolean: sigue al sistema
  } = useTheme();

  return (
    <div>
      <p>Tema actual: {effectiveTheme}</p>
      <button onClick={toggleTheme}>
        Cambiar a {isLight ? 'Oscuro' : 'Claro'}
      </button>
    </div>
  );
}
```

### Variables CSS Principales
```css
/* Colores base que se adaptan automáticamente */
--color-bg-primary         /* Fondo principal */
--color-bg-secondary       /* Fondo secundario */
--color-text-primary       /* Texto principal */
--color-text-secondary     /* Texto secundario */
--color-border-primary     /* Bordes */
--color-surface-primary    /* Superficies (cards, modales) */

/* Estados */
--color-success            /* Verde para éxito */
--color-warning            /* Amarillo para advertencias */
--color-danger             /* Rojo para errores */
--color-info               /* Azul para información */

/* Transiciones */
--theme-transition         /* Transición suave para cambios */
```

## Implementación Técnica

### Detección Automática
- El sistema detecta automáticamente la preferencia del usuario usando `prefers-color-scheme`
- Se aplica el tema correspondiente al cargar la aplicación
- Escucha cambios en la preferencia del sistema en tiempo real

### Persistencia
- La preferencia del usuario se guarda en `localStorage`
- Se mantiene entre sesiones del navegador
- Sincronización entre múltiples pestañas

### Atributos HTML
- El tema se controla via `data-theme="light|dark"` en el elemento `<html>`
- CSS utiliza selectores de atributo para aplicar estilos específicos
- No requiere recarga de página

## Archivos Modificados

### Nuevos Archivos
- ✅ `src/utils/theme.js` - Utilidades de tema
- ✅ `src/components/ThemeDemo.jsx` - Componente de demostración (temporal)

### Archivos Actualizados
- ✅ `src/styles/root.css` - Variables CSS completamente renovadas
- ✅ `src/layouts/Header.jsx` - Selector de tema integrado
- ✅ `src/styles/layouts/Header.css` - Estilos para selector de tema
- ✅ `src/styles/LoadingModal.css` - Adaptativo para ambos temas
- ✅ `src/main.jsx` - Inicialización de tema

## Temas Disponibles

### 🌞 Modo Claro (light)
- Fondos blancos y grises claros
- Texto oscuro sobre fondos claros
- Sombras sutiles
- Colores vibrantes para estados

### 🌙 Modo Oscuro (dark)
- Fondos oscuros (slate)
- Texto claro sobre fondos oscuros
- Sombras más pronunciadas
- Colores ajustados para mejor contraste

### 💻 Seguir Sistema (system)
- Detecta automáticamente la preferencia del SO
- Cambia dinámicamente cuando el usuario cambia su preferencia
- Ideal para usuarios que cambian según la hora del día

## Compatibilidad
- ✅ Todos los navegadores modernos
- ✅ Soporte completo para `prefers-color-scheme`
- ✅ Fallback graceful para navegadores antiguos
- ✅ Responsive design en ambos temas

## Próximas Mejoras Sugeridas
- [ ] Más variantes de tema (ej: modo de alto contraste)
- [ ] Personalización de colores de acento
- [ ] Tema automático basado en hora del día
- [ ] Animaciones más sofisticadas para transiciones

---

**Nota**: El componente `ThemeDemo.jsx` es temporal y puede ser eliminado una vez verificado el funcionamiento del sistema.
