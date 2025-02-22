from app import app, db, Usuario
from crear_datos_ejemplo import crear_categorias_ejemplo, crear_productos_ejemplo

def init_db():
    with app.app_context():
        # Crear todas las tablas
        db.create_all()
        
        # Crear usuario admin si no existe
        admin = Usuario.query.filter_by(username='admin').first()
        if not admin:
            admin = Usuario(username='admin')
            admin.set_password('admin123')  # Cambia esta contraseña
            db.session.add(admin)
            db.session.commit()
            print("Usuario admin creado exitosamente")
        
        # Crear datos de ejemplo
        crear_categorias_ejemplo()
        crear_productos_ejemplo()
        print("Datos de ejemplo creados exitosamente")

if __name__ == '__main__':
    init_db() 