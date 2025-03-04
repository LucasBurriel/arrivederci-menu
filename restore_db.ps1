# Script para restaurar un respaldo de la base de datos de Railway
# Usar con precaución - esto sobrescribirá la base de datos actual

param(
    [Parameter(Mandatory=$true)]
    [string]$BackupFile
)

# Verificar que el archivo existe
if (-not (Test-Path -Path $BackupFile)) {
    Write-Host "El archivo de respaldo no existe: $BackupFile"
    exit 1
}

# Obtener las variables de entorno de Railway
Write-Host "Obteniendo variables de entorno de Railway..."
$env = railway variables

# Extraer la URL de la base de datos
$pgUrl = $env | Select-String -Pattern "PGURL" | ForEach-Object { $_ -replace ".*=(.*)", '$1' }

if (-not $pgUrl) {
    Write-Host "No se pudo obtener la URL de PostgreSQL. Asegúrate de estar conectado a Railway."
    exit 1
}

# Confirmar la restauración
Write-Host "¡ADVERTENCIA! Esto sobrescribirá la base de datos actual con el respaldo: $BackupFile"
Write-Host "¿Estás seguro de que quieres continuar? (S/N)"
$confirmation = Read-Host

if ($confirmation -ne "S") {
    Write-Host "Operación cancelada."
    exit 0
}

# Restaurar el respaldo
Write-Host "Restaurando respaldo de la base de datos..."
Write-Host "Ejecutando: psql $pgUrl < $BackupFile"

try {
    # Necesitas tener psql instalado en tu sistema
    Get-Content $BackupFile | psql $pgUrl
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Respaldo restaurado exitosamente."
    } else {
        Write-Host "Error al restaurar el respaldo. Código de salida: $LASTEXITCODE"
    }
} catch {
    Write-Host "Error al ejecutar psql: $_"
} 