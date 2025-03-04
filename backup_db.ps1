# Script para hacer respaldo de la base de datos de Railway
# Ejecutar este script antes de hacer cambios importantes

# Obtener la fecha actual para el nombre del archivo
$date = Get-Date -Format "yyyy-MM-dd-HHmm"
$backupFileName = "backup-$date.sql"

# Obtener las variables de entorno de Railway
Write-Host "Obteniendo variables de entorno de Railway..."
$env = railway variables

# Extraer la URL de la base de datos
$pgUrl = $env | Select-String -Pattern "PGURL" | ForEach-Object { $_ -replace ".*=(.*)", '$1' }

if (-not $pgUrl) {
    Write-Host "No se pudo obtener la URL de PostgreSQL. Asegúrate de estar conectado a Railway."
    exit 1
}

# Crear directorio de respaldos si no existe
if (-not (Test-Path -Path ".\backups")) {
    New-Item -ItemType Directory -Path ".\backups"
}

# Hacer el respaldo usando pg_dump
Write-Host "Creando respaldo de la base de datos..."
Write-Host "Ejecutando: pg_dump $pgUrl > .\backups\$backupFileName"

try {
    # Necesitas tener pg_dump instalado en tu sistema
    pg_dump $pgUrl > ".\backups\$backupFileName"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Respaldo creado exitosamente: .\backups\$backupFileName"
    } else {
        Write-Host "Error al crear el respaldo. Código de salida: $LASTEXITCODE"
    }
} catch {
    Write-Host "Error al ejecutar pg_dump: $_"
} 