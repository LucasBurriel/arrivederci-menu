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

#### 5. Problemas de Conexión en el Menú
- **Estado**: Identificado - En proceso de solución
- **Descripción**: El menú principal falla con error 500 del servidor
- **Detalles**:
  - El componente Menu.tsx se conecta correctamente al backend pero recibe error 500
  - Los logs muestran: `ERROR - Error al obtener productos: (psycopg2.errors.UndefinedColumn) column producto.fecha_creacion does not exist`
  - El error se debe a una discrepancia entre el modelo Producto en el código y la estructura de la tabla en la base de datos
  - El API intenta seleccionar columnas `fecha_creacion` y `fecha_actualizacion` que no existen en la tabla de la base de datos
- **Soluciones implementadas**:
  1. Se ha creado un script `actualizar_schema.py` para añadir las columnas faltantes a la base de datos
  2. Se ha creado un archivo `app_compatible.py` como versión alternativa que no depende de las columnas faltantes
- **Acciones inmediatas**:
  1. Ejecutar el script `actualizar_schema.py` en el servidor para añadir las columnas
  2. O desplegar la versión compatible del backend que no requiere las columnas
  3. Reiniciar el servicio en Railway después de aplicar los cambios
- **Acciones a largo plazo**:
  - Implementar migraciones automáticas de base de datos con Alembic
  - Mejorar el sistema de detección de discrepancias entre modelos y esquema de base de datos
  - Asegurar que los cambios en el modelo siempre vayan acompañados de migraciones

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

#### 2. Implementación de Ramas de Desarrollo (Git Flow)
- **Estado**: Sin resolver
- **Descripción**: El proyecto necesita implementar un flujo de trabajo con ramas para evitar caídas en producción
- **Detalles**:
  - Actualmente se trabaja directamente sobre la rama main/master
  - Los cambios se publican directamente en producción sin pruebas previas
  - Se necesita un flujo de trabajo que permita desarrollo, pruebas y producción separados
- **Impacto**:
  - Cambios como el reciente en Menu.tsx pueden causar caídas del sistema en producción
  - No hay forma de revertir rápidamente a una versión funcional
  - Dificulta el trabajo colaborativo entre múltiples desarrolladores
- **Solución propuesta**:
  1. Implementar Git Flow con las siguientes ramas:
     - `main`: Solo código probado y estable para producción
     - `develop`: Código integrado para pruebas de preproducción
     - `feature/*`: Ramas temporales para nuevas funcionalidades
     - `hotfix/*`: Ramas temporales para correcciones urgentes
  2. Configurar protección de ramas en GitHub:
     - Requerir aprobación de PR antes de fusionar en main
     - Requerir CI/CD pasando pruebas antes de permitir merge
  3. Documentar el flujo de trabajo para todos los colaboradores
- **Próximos pasos**:
  1. Crear rama develop a partir de main
  2. Configurar protecciones en GitHub
  3. Crear documentación en README o en un archivo CONTRIBUTING.md
  4. Implementar primeras feature branches para próximas características

#### 3. Implementación de Migraciones de Base de Datos
- **Estado**: Sin resolver
- **Descripción**: Se necesita un sistema de migraciones para gestionar cambios en la estructura de la base de datos
- **Detalles**:
  - El error actual del menú se debe a la falta de un sistema de migraciones
  - Los cambios en el modelo (como añadir columnas `fecha_creacion` y `fecha_actualizacion`) no se aplican automáticamente
  - Esto causa discrepancias entre el código y la base de datos que provocan errores 500
- **Impacto**:
  - Fallos en producción cuando se modifica la estructura del modelo sin actualizar la base de datos
  - Dificultad para manejar cambios en esquemas de base de datos entre entornos
  - Pérdida de tiempo en solucionar problemas que podrían evitarse
- **Solución propuesta**:
  1. Implementar Alembic para gestionar migraciones SQL
  2. Crear script para detectar cambios en modelos automáticamente
  3. Integrar migraciones en el proceso de despliegue
  4. Documentar el proceso para el equipo
- **Próximos pasos**:
  1. Instalar y configurar Alembic
  2. Crear primera migración con el esquema actual
  3. Documentar cómo crear y aplicar migraciones
  4. Integrar con CI/CD

## Próximas Mejoras

### Funcionalidades

#### 1. Soporte Multilenguaje
- **Prioridad**: Media
- **Descripción**: Implementar soporte para múltiples idiomas (español e inglés)
- **Alcance**:
  - Implementar sistema de i18n con react-i18next
  - Crear archivos de traducción para español e inglés
  - Agregar selector de idioma en la interfaz
  - Aplicar traducciones a todos los textos estáticos

#### 2. Sistema de Comentarios y Valoraciones
- **Prioridad**: Baja
- **Descripción**: Permitir a los clientes dejar comentarios y valoraciones sobre productos
- **Alcance**:
  - Crear esquema de base de datos para comentarios
  - Implementar API para gestión de comentarios
  - Agregar interfaz de usuario para visualizar y añadir comentarios
  - Implementar sistema de moderación en el panel de administración

### Técnicas

#### 1. Implementación de Tests Automatizados
- **Prioridad**: Alta
- **Descripción**: Añadir suite de pruebas para frontend y backend
- **Alcance**:
  - Configurar Jest y React Testing Library para frontend
  - Configurar Pytest para backend
  - Implementar pruebas unitarias para componentes clave
  - Implementar pruebas de integración para flujos críticos
  - Configurar CI/CD para ejecutar pruebas automáticamente

#### 2. PWA (Progressive Web App)
- **Prioridad**: Media
- **Descripción**: Convertir la aplicación en una PWA para mejor experiencia móvil
- **Alcance**:
  - Implementar service worker
  - Configurar manifest.json
  - Implementar estrategias de caché
  - Permitir instalación en dispositivos
  - Habilitar funcionalidad offline básica

#### 3. Optimización de SEO
- **Prioridad**: Media
- **Descripción**: Mejorar el posicionamiento en motores de búsqueda
- **Alcance**:
  - Implementar meta tags dinámicos
  - Generar sitemap.xml
  - Optimizar estructura HTML semántica
  - Mejorar velocidad de carga (Core Web Vitals)
  - Asegurar accesibilidad WCAG nivel AA

### UX/UI

#### 1. Modo Oscuro
- **Prioridad**: Baja
- **Descripción**: Implementar un tema oscuro para la aplicación
- **Alcance**:
  - Definir paleta de colores para modo oscuro
  - Implementar cambio de tema utilizando MUI Theme Provider
  - Agregar botón de cambio de tema
  - Guardar preferencia de tema en localStorage

#### 2. Mejoras en Panel de Administración
- **Prioridad**: Media
- **Descripción**: Mejorar la experiencia del panel administrativo
- **Alcance**:
  - Implementar vista de dashboard con estadísticas
  - Mejorar sistema de gestión de productos con vista previa
  - Implementar sistema de arrastrar y soltar para ordenar productos
  - Añadir gráficos para visualizar datos de ventas/visitas

---

_Última actualización: 23 de junio de 2024_ 