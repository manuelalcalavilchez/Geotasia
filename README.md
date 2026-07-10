# 🌍 GeoTasalia - Portal Corporativo y Técnico

Este es el portal corporativo y técnico de GeoTasalia, diseñado con un frontend moderno en React (Vite, Tailwind CSS, Motion) y respaldado por un servidor web en Node.js (Express) para el procesamiento seguro de formularios de consulta técnica y distribución de documentación técnica.

---

## 🚀 Desarrollo y Ejecución con Docker (Recomendado)

Se han configurado un `Dockerfile` multi-etapa y un archivo `docker-compose.yml` para facilitar el desarrollo ágil con recarga en vivo y pruebas de producción idénticas.

### 1. Entorno de Desarrollo (Con Recarga en Vivo)
Levanta la aplicación en modo desarrollo montando el código local. Cualquier cambio en tus archivos del frontend se actualizará automáticamente en tu navegador.

```bash
docker compose up app-dev
```
- **URL**: `http://localhost:3000`
- **Características**: Recarga rápida, soporte para depuración y watch de archivos activo.

### 2. Entorno de Producción (Contenedor Optimizado)
Compila los recursos estáticos del frontend, empaqueta el servidor Express ligero y ejecuta el servicio de forma idéntica a como lo haría en la nube (Easypanel, Cloud Run, VPS).

```bash
docker compose up app-prod
```
- **URL**: `http://localhost:3000`
- **Características**: Código minificado, rendimiento optimizado y servidor estático seguro.

---

## 🛠️ Desarrollo Local sin Docker

Si prefiere ejecutar el proyecto directamente en su máquina con Node.js (se requiere Node 18+):

### 1. Instalar dependencias
```bash
npm install
```

### 2. Iniciar servidor de desarrollo
```bash
npm run dev
```
Acceda a `http://localhost:3000` con recarga rápida de módulos activa.

### 3. Compilar para producción
```bash
npm run build
```

### 4. Ejecutar la compilación de producción
```bash
npm start
```

---

## 📁 Estructura del Proyecto

- `/src/` - Código fuente de React (vistas, componentes, datos de servicios).
- `/src/App.tsx` - Controlador principal y formulario interactivo con uploader seguro de ficheros.
- `/server.js` - Servidor web de producción en Express (ESM).
- `/Dockerfile` - Definición de construcción por capas para desarrollo y producción.
- `/docker-compose.yml` - Orquestador para simplificar el arranque de servicios.

---

## 🔐 Seguridad y RGPD
El formulario de consulta técnica incluye un cargador de archivos seguro y interactivo con barra de progreso para planos, escrituras y notas simples. Las consultas se procesan y preparan conforme al Reglamento General de Protección de Datos (RGPD) para una distribución cómoda, privada y profesional.
