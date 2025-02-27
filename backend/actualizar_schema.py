#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script para actualizar el esquema de la base de datos de Railway.
Este script añade las columnas fecha_creacion y fecha_actualizacion 
a la tabla producto si no existen.
"""

import os
import sys
import logging
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("actualizar_schema.log"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

def actualizar_schema():
    """Actualiza el esquema de la base de datos añadiendo columnas faltantes."""
    # Cargar variables de entorno
    load_dotenv()
    
    # Obtener URL de la base de datos
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        logger.error("❌ No se puede conectar: DATABASE_URL no está definida")
        return False
    
    logger.info(f"Conectando a la base de datos...")
    engine = create_engine(database_url)
    
    try:
        with engine.connect() as conn:
            # Verificar si las columnas ya existen
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'producto' 
                AND column_name IN ('fecha_creacion', 'fecha_actualizacion')
            """))
            
            existing_columns = [row[0] for row in result]
            logger.info(f"Columnas existentes: {existing_columns}")
            
            # Añadir fecha_creacion si no existe
            if 'fecha_creacion' not in existing_columns:
                logger.info("Añadiendo columna fecha_creacion...")
                conn.execute(text("""
                    ALTER TABLE producto 
                    ADD COLUMN fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                """))
                logger.info("✅ Columna fecha_creacion añadida correctamente")
            
            # Añadir fecha_actualizacion si no existe
            if 'fecha_actualizacion' not in existing_columns:
                logger.info("Añadiendo columna fecha_actualizacion...")
                conn.execute(text("""
                    ALTER TABLE producto 
                    ADD COLUMN fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                """))
                logger.info("✅ Columna fecha_actualizacion añadida correctamente")
            
            # Confirmar transacción
            conn.commit()
            
            # Verificar que las columnas se hayan añadido correctamente
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'producto' 
                AND column_name IN ('fecha_creacion', 'fecha_actualizacion')
            """))
            
            updated_columns = [row[0] for row in result]
            logger.info(f"Columnas después de la actualización: {updated_columns}")
            
            if len(updated_columns) == 2:
                logger.info("✅ Esquema actualizado correctamente")
                return True
            else:
                logger.error("❌ No se pudieron añadir todas las columnas")
                return False
                
    except Exception as e:
        logger.error(f"❌ Error al actualizar el esquema: {str(e)}")
        return False

if __name__ == "__main__":
    logger.info("=== Iniciando actualización del esquema de la base de datos ===")
    success = actualizar_schema()
    
    if success:
        logger.info("✅ Proceso completado exitosamente")
        sys.exit(0)
    else:
        logger.error("❌ El proceso falló")
        sys.exit(1) 