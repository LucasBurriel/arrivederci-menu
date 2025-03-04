# Flujo de Trabajo para el Proyecto Arrivederci

Este documento describe el flujo de trabajo para desarrollar y mantener el proyecto Arrivederci.

## Estructura de Ramas

El proyecto utiliza dos ramas principales:

- **main**: Contiene el código en producción
- **desarrollo**: Rama para desarrollo y pruebas

## Proceso de Desarrollo

### 1. Desarrollo de Nuevas Características

```bash
# Asegúrate de estar en la rama de desarrollo
git checkout desarrollo

# Desarrolla y prueba localmente
# ...

# Cuando termines, guarda los cambios
git add .
git commit -m "Descripción del cambio"
git push origin desarrollo
```

### 2. Pruebas

- Prueba los cambios localmente primero
- Para cambios en la base de datos o críticos:
  1. Haz un respaldo de la base de datos (ver sección de Respaldos)
  2. Prueba exhaustivamente antes de desplegar a producción

### 3. Despliegue a Producción

```bash
# Antes de desplegar, haz un respaldo de la base de datos
./backup_db.ps1

# Cambia a la rama principal
git checkout main

# Fusiona los cambios de desarrollo
git merge desarrollo

# Sube los cambios a producción
git push origin main
```

### 4. Monitoreo Post-Despliegue

- Verifica que todo funcione correctamente en producción
- Comprueba los logs en busca de errores
- Asegúrate de que las funcionalidades críticas sigan funcionando

## Respaldos de Base de Datos

### Crear un Respaldo

```bash
# Ejecuta el script de respaldo
./backup_db.ps1
```

Los respaldos se guardan en la carpeta `./backups` con la fecha y hora.

### Restaurar un Respaldo

```bash
# Restaura un respaldo específico
./restore_db.ps1 -BackupFile "./backups/nombre-del-archivo.sql"
```

**¡IMPORTANTE!** La restauración sobrescribirá la base de datos actual. Úsala con precaución.

## Requisitos

Para usar estos scripts necesitas:
- PostgreSQL instalado localmente (para pg_dump y psql)
- Railway CLI instalado (`npm install -g @railway/cli`)
- Estar autenticado en Railway (`railway login`)

## Respaldos Automáticos

Para configurar respaldos automáticos:

1. Accede a la interfaz web de Railway: https://railway.app
2. Selecciona tu proyecto y el servicio de PostgreSQL
3. Ve a la pestaña "Backups"
4. Configura la frecuencia de los respaldos automáticos

## Solución de Problemas Comunes

### Error al Desplegar

1. Verifica los logs en Railway y Vercel
2. Asegúrate de que todas las dependencias estén instaladas
3. Si es necesario, restaura el último respaldo funcional

### Conflictos al Fusionar Ramas

1. Resuelve los conflictos manualmente
2. Prueba exhaustivamente después de resolver conflictos
3. Si los conflictos son demasiado complejos, considera hacer cherry-pick de cambios específicos 