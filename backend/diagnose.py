#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script de diagnóstico para verificar la conexión a la base de datos
y el estado del backend de Arrivederci Menu.

Uso:
  python diagnose.py

Este script realiza las siguientes comprobaciones:
1. Verifica variables de entorno
2. Prueba la conexión a la base de datos
3. Verifica el espacio en disco
4. Comprueba uso de memoria y CPU
5. Intenta ejecutar operaciones básicas de la API
"""

import os
import sys
import json
import time
import psutil
import logging
import requests
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("diagnose.log"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

def check_env_variables():
    """Verifica las variables de entorno requeridas."""
    logger.info("=== Verificando variables de entorno ===")
    
    # Cargar variables de entorno desde .env si existe
    load_dotenv()
    
    required_vars = ['DATABASE_URL', 'SECRET_KEY', 'FLASK_ENV']
    missing_vars = []
    
    for var in required_vars:
        value = os.environ.get(var)
        if not value:
            missing_vars.append(var)
            logger.error(f"❌ Variable {var} no encontrada")
        else:
            masked_value = value
            if var != 'FLASK_ENV':
                # Enmascarar para seguridad
                masked_value = value[:5] + "..." + value[-5:] if len(value) > 10 else "***"
            logger.info(f"✓ Variable {var}: {masked_value}")
    
    if missing_vars:
        logger.warning(f"Faltan variables de entorno: {', '.join(missing_vars)}")
    else:
        logger.info("✓ Todas las variables de entorno requeridas están presentes")
    
    return len(missing_vars) == 0

def check_database_connection():
    """Prueba la conexión a la base de datos."""
    logger.info("\n=== Verificando conexión a la base de datos ===")
    
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        logger.error("❌ No se puede verificar la conexión: DATABASE_URL no está definida")
        return False
    
    try:
        # Intentar crear una conexión
        logger.info(f"Intentando conectar a la base de datos...")
        engine = create_engine(database_url)
        
        # Medir tiempo de respuesta
        start_time = time.time()
        conn = engine.connect()
        result = conn.execute(text("SELECT 1")).fetchone()
        end_time = time.time()
        
        response_time = (end_time - start_time) * 1000  # en milisegundos
        logger.info(f"✓ Conexión exitosa (tiempo de respuesta: {response_time:.2f}ms)")
        
        # Verificar tablas existentes
        logger.info("Verificando tablas existentes...")
        result = conn.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        """)).fetchall()
        
        tables = [r[0] for r in result]
        logger.info(f"Tablas encontradas: {', '.join(tables)}")
        
        # Contar registros en tablas principales
        for table in ['usuario', 'categoria', 'producto']:
            if table in tables:
                count = conn.execute(text(f"SELECT COUNT(*) FROM {table}")).fetchone()[0]
                logger.info(f"Tabla {table}: {count} registros")
        
        conn.close()
        return True
    except SQLAlchemyError as e:
        logger.error(f"❌ Error de base de datos: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"❌ Error inesperado: {str(e)}")
        return False

def check_system_resources():
    """Verifica recursos del sistema."""
    logger.info("\n=== Verificando recursos del sistema ===")
    
    # Uso de CPU
    cpu_percent = psutil.cpu_percent(interval=1)
    logger.info(f"Uso de CPU: {cpu_percent}%")
    
    # Uso de memoria
    memory = psutil.virtual_memory()
    logger.info(f"Memoria total: {memory.total / (1024 * 1024):.1f} MB")
    logger.info(f"Memoria disponible: {memory.available / (1024 * 1024):.1f} MB")
    logger.info(f"Uso de memoria: {memory.percent}%")
    
    # Espacio en disco
    disk = psutil.disk_usage('/')
    logger.info(f"Espacio total en disco: {disk.total / (1024 * 1024 * 1024):.1f} GB")
    logger.info(f"Espacio disponible: {disk.free / (1024 * 1024 * 1024):.1f} GB")
    logger.info(f"Uso de disco: {disk.percent}%")
    
    # Verificar si hay limitaciones de recursos
    warnings = []
    if cpu_percent > 80:
        warnings.append(f"⚠️ Alto uso de CPU: {cpu_percent}%")
    if memory.percent > 85:
        warnings.append(f"⚠️ Alto uso de memoria: {memory.percent}%")
    if disk.percent > 90:
        warnings.append(f"⚠️ Poco espacio en disco: {disk.percent}% usado")
    
    for warning in warnings:
        logger.warning(warning)
    
    return len(warnings) == 0

def test_api_endpoints():
    """Prueba los endpoints básicos de la API."""
    logger.info("\n=== Probando endpoints de la API ===")
    
    base_url = "http://localhost:5000/api"
    endpoints = [
        "/productos",
        "/categorias"
    ]
    
    success_count = 0
    for endpoint in endpoints:
        url = f"{base_url}{endpoint}"
        try:
            logger.info(f"Probando GET {url}...")
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                count = len(data) if isinstance(data, list) else "N/A"
                logger.info(f"✓ {endpoint}: OK (status: {response.status_code}, items: {count})")
                success_count += 1
            else:
                logger.error(f"❌ {endpoint}: Error (status: {response.status_code})")
                if response.status_code >= 500:
                    try:
                        error_details = response.text
                        logger.error(f"Detalles del error: {error_details}")
                    except:
                        pass
        except requests.RequestException as e:
            logger.error(f"❌ {endpoint}: Error de conexión: {str(e)}")
    
    success_rate = (success_count / len(endpoints)) * 100 if endpoints else 0
    logger.info(f"Tasa de éxito: {success_rate:.1f}% ({success_count}/{len(endpoints)})")
    
    return success_count == len(endpoints)

def main():
    """Función principal que ejecuta todas las verificaciones."""
    logger.info("Iniciando diagnóstico de Arrivederci Menu")
    logger.info("-" * 50)
    
    results = {
        "env_variables": check_env_variables(),
        "database": check_database_connection(),
        "system_resources": check_system_resources()
    }
    
    # Sólo ejecutar pruebas de API si estamos en modo desarrollo o si se especifica
    if os.environ.get('FLASK_ENV') == 'development':
        results["api_endpoints"] = test_api_endpoints()
    
    logger.info("\n=== Resumen del diagnóstico ===")
    all_passed = all(results.values())
    
    for test, passed in results.items():
        status = "✓ Pasó" if passed else "❌ Falló"
        logger.info(f"{test}: {status}")
    
    if all_passed:
        logger.info("\n✅ Todas las verificaciones pasaron correctamente")
        logger.info("El sistema parece estar en buen estado")
    else:
        logger.warning("\n⚠️ Algunas verificaciones fallaron")
        logger.warning("Revise los detalles anteriores para encontrar el problema")
        
        # Sugerencias específicas
        if not results.get("database", True):
            logger.warning("Sugerencia: Verifique la configuración de la base de datos y que el servidor PostgreSQL esté activo")
        if not results.get("env_variables", True):
            logger.warning("Sugerencia: Configure correctamente las variables de entorno requeridas")
        if not results.get("system_resources", True):
            logger.warning("Sugerencia: El servidor podría necesitar más recursos. Considere actualizar su plan en Railway")
    
    logger.info("-" * 50)
    logger.info("Diagnóstico completado")

if __name__ == "__main__":
    main() 