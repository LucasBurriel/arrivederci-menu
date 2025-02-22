from app import app, db, Usuario

def init_db():
    with app.app_context():
        # Crear todas las tablas
        db.create_all()
        print("Tablas creadas exitosamente")
        
        # Crear usuario admin si no existe
        admin = Usuario.query.filter_by(username='admin').first()
        if not admin:
            admin = Usuario(username='admin')
            admin.set_password('admin123')  # Cambia esta contraseña
            db.session.add(admin)
            db.session.commit()
            print("Usuario admin creado exitosamente")
        else:
            print("El usuario admin ya existe")

if __name__ == '__main__':
    init_db() 