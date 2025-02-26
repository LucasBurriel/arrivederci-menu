# Issues Pendientes

## UI/UX

### Alta Prioridad

#### 1. Notificaciones de Error en Modal de Productos
- **Estado**: Sin resolver
- **Descripción**: Las notificaciones de error al agregar/editar productos no se muestran correctamente
- **Detalles**:
  - El mensaje de error aparece detrás del modal en lugar de dentro o encima de él
  - Se intentó solucionar usando Snackbar de Material-UI pero persiste el problema
  - El mismo sistema funciona correctamente en el modal de categorías
- **Intentos de solución**:
  1. Se intentó usar Alert dentro del DialogContent
  2. Se intentó posicionar el Alert con z-index y position relative
  3. Se implementó un sistema unificado con Snackbar
- **Próximos pasos sugeridos**:
  - Investigar si hay conflictos de z-index en la jerarquía de componentes
  - Considerar implementar un portal para las notificaciones
  - Evaluar usar un sistema de notificaciones diferente
  - Revisar la documentación de Material-UI sobre manejo de modales y notificaciones

#### 2. Animaciones en Dispositivos Móviles
- **Estado**: Sin resolver
- **Descripción**: Las animaciones resultan molestas y problemáticas en dispositivos móviles
- **Detalles**:
  - Al hacer scroll, los productos y categorías se mueven lateralmente
  - Los efectos hover causan problemas en dispositivos táctiles
  - Las animaciones hacen que la experiencia móvil sea menos fluida
- **Intentos de solución**:
  1. Se eliminaron los efectos hover en las tarjetas
  2. Se implementó una media query `@media (hover: none)` para deshabilitar efectos
  3. Se creó una interfaz separada para móviles sin animaciones
- **Próximos pasos sugeridos**:
  - Reconsiderar completamente la implementación de animaciones
  - Evaluar el uso de una biblioteca especializada en animaciones responsivas
  - Simplificar la interfaz para dispositivos móviles
  - Realizar pruebas en diferentes dispositivos móviles

#### 3. Optimización de Imagen de Fondo
- **Estado**: Sin resolver
- **Descripción**: La imagen de fondo (hero image) es demasiado grande y afecta los tiempos de carga
- **Detalles**:
  - La imagen de fondo actual es de alta resolución y pesa varios MB
  - Esto causa que la página inicial tarde más en cargar, especialmente en conexiones lentas
  - No hay versiones optimizadas para diferentes tamaños de pantalla
- **Solución propuesta**:
  1. Comprimir la imagen actual utilizando herramientas como TinyPNG o ImageOptim
  2. Crear múltiples versiones para diferentes resoluciones
  3. Implementar lazy loading para la imagen de fondo
- **Próximos pasos**:
  - Optimizar la imagen reduciendo su tamaño sin perder calidad visual
  - Considerar el uso de formatos modernos como WebP con fallbacks
  - Implementar srcset para servir la imagen apropiada según el dispositivo

#### 4. Implementación de Favicon
- **Estado**: Sin resolver
- **Descripción**: La aplicación carece de un icono en la pestaña del navegador (favicon)
- **Detalles**:
  - Actualmente se muestra el ícono genérico de Vite
  - No hay iconos para distintas plataformas (iOS, Android, Windows)
  - No se ha configurado un manifest.json para PWA
- **Solución propuesta**:
  1. Crear un favicon basado en el logo de Arrivederci
  2. Generar las diferentes versiones necesarias para distintos dispositivos
  3. Configurar el HTML para incluir todas las referencias necesarias
- **Próximos pasos**:
  - Diseñar un favicon que represente la marca (16x16, 32x32, etc.)
  - Generar iconos para dispositivos móviles (192x192, 512x512)
  - Crear y configurar el manifest.json
  - Actualizar el archivo index.html con las referencias correspondientes

## Backend/Infraestructura

### Alta Prioridad

#### 1. Persistencia de Datos en Railway
- **Estado**: Sin resolver
- **Descripción**: Los datos (productos y categorías) se pierden después de cada deploy en Railway
- **Detalles**:
  - La base de datos PostgreSQL en Railway se reinicia con cada nuevo deploy
  - No hay persistencia de datos entre deployments
  - Se necesita configurar un volumen persistente o una base de datos externa
- **Soluciones propuestas**:
  1. Configurar un volumen persistente en Railway para PostgreSQL
  2. Migrar a una base de datos PostgreSQL externa (ej: Railway Postgres dedicado)
  3. Implementar un sistema de migraciones y seeds para mantener datos base
  4. Verificar la conexión actual de la base de datos:
     ```bash
     # Pasos para verificar:
     1. Revisar las variables de entorno en Railway
     2. Confirmar que DATABASE_URL está correctamente configurada
     3. Verificar que la conexión está activa en el backend
     ```
- **Próximos pasos**:
  1. Crear una base de datos PostgreSQL dedicada en Railway
  2. Actualizar las variables de entorno con la nueva conexión
  3. Implementar un sistema de migraciones con datos iniciales
  4. Hacer backup de datos importantes antes de cada deploy

---

_Última actualización: 22 de junio de 2024_ 