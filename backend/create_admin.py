from typing import Optional
from app import app, db, Usuario

def crear_admin(username: str, password: str) -> Optional[Usuario]:
    """
    Crea un usuario administrador si no existe.
    
    Args:
        username: Nombre de usuario del administrador
        password: Contraseña del administrador
        
    Returns:
        Usuario creado o None si ya existe
    """
    with app.app_context():
        # Crear todas las tablas
        db.create_all()
        
        # Verificar si el usuario ya existe
        if Usuario.query.filter_by(username=username).first():
            print("❌ El usuario ya existe")
            return None
        
        # Crear nuevo usuario
        usuario = Usuario(username=username)
        usuario.set_password(password)
        
        db.session.add(usuario)
        db.session.commit()
        print("✅ Usuario administrador creado exitosamente")
        return usuario

if __name__ == "__main__":
    crear_admin("admin", "admin123") 