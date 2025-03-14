from flask import Flask, jsonify, request, session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from typing import List, Dict, Any, Optional
from werkzeug.security import generate_password_hash, check_password_hash
import logging
from datetime import timedelta
from functools import wraps
import os
from dotenv import load_dotenv
from crear_datos_ejemplo import crear_datos_ejemplo
from sqlalchemy import text

# Cargar variables de entorno
load_dotenv()

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configuración CORS más permisiva para debugging
CORS(app, 
     supports_credentials=True,
     resources={
         r"/api/*": {
             "origins": ["https://arrivederci-cafe-git-main-lucasburriels-projects.vercel.app",
                        "https://arrivederci-cafe.vercel.app",
                        "http://localhost:3000"],
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization"],
             "expose_headers": ["Content-Type"],
             "supports_credentials": True,
             "send_wildcard": False
         }
     })

@app.after_request
def after_request(response):
    logger.info(f"Request to {request.path} - Response status: {response.status}")
    origin = request.headers.get('Origin')
    
    if origin in ["https://arrivederci-cafe-git-main-lucasburriels-projects.vercel.app",
                 "https://arrivederci-cafe.vercel.app",
                 "http://localhost:3000"]:
        cors_headers = {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '3600'
        }
        response.headers.update(cors_headers)
        
        if request.method == 'OPTIONS':
            response.status_code = 204
            return response
    
    logger.info(f"Headers de respuesta CORS: {dict(response.headers)}")
    return response

# Configuración de la base de datos y seguridad
app.config.update(
    SQLALCHEMY_DATABASE_URI=os.getenv('DATABASE_URL', 'sqlite:///menu.db'),
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
    SECRET_KEY=os.getenv('SECRET_KEY', 'clave_desarrollo_temporal'),
    PERMANENT_SESSION_LIFETIME=timedelta(hours=1),
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='None',
    SESSION_COOKIE_PATH='/',
    SESSION_COOKIE_DOMAIN=None
)

db = SQLAlchemy(app)

# Modelos
class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    ultimo_acceso = db.Column(db.DateTime)

    def set_password(self, password: str) -> None:
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

class Categoria(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), nullable=False, unique=True)
    valor = db.Column(db.String(50), nullable=False, unique=True)
    productos = db.relationship('Producto', backref='categoria_rel', lazy=True)

    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'nombre': self.nombre,
            'valor': self.valor
        }

class Producto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text)
    precio = db.Column(db.Float, nullable=False)
    categoria = db.Column(db.String(50), db.ForeignKey('categoria.valor'), nullable=False)
    disponible = db.Column(db.Boolean, default=True)
    imagen_url = db.Column(db.String(200))

    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'precio': self.precio,
            'categoria': self.categoria,
            'disponible': self.disponible,
            'imagen_url': self.imagen_url
        }

# Middleware mejorado
def requiere_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            if 'user_id' not in session:
                logger.warning(f"Intento de acceso no autorizado a {request.path}")
                return jsonify({'error': 'No autorizado'}), 401
            return f(*args, **kwargs)
        except Exception as e:
            logger.error(f"Error en middleware de autenticación: {str(e)}")
            return jsonify({'error': 'Error interno del servidor'}), 500
    return decorated

# Manejador de errores global
@app.errorhandler(Exception)
def handle_error(e):
    logger.error(f"Error no manejado: {str(e)}")
    return jsonify({'error': 'Error interno del servidor'}), 500

# Rutas de autenticación mejoradas
@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        logger.info("Intento de login recibido")
        datos = request.json
        logger.info(f"Datos recibidos: {datos}")
        
        if not datos or 'username' not in datos or 'password' not in datos:
            logger.warning("Datos de login incompletos")
            return jsonify({'error': 'Datos de login incompletos'}), 400

        usuario = Usuario.query.filter_by(username=datos['username']).first()
        if usuario and usuario.check_password(datos['password']):
            session.permanent = True
            session['user_id'] = usuario.id
            logger.info(f"Login exitoso para usuario: {datos['username']}")
            return jsonify({'mensaje': 'Login exitoso'})

        logger.warning(f"Intento de login fallido para usuario: {datos.get('username')}")
        return jsonify({'error': 'Usuario o contraseña incorrectos'}), 401
    except Exception as e:
        logger.error(f"Error en login: {str(e)}")
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    try:
        user_id = session.pop('user_id', None)
        if user_id:
            logger.info(f"Logout exitoso para usuario ID: {user_id}")
        return jsonify({'mensaje': 'Logout exitoso'})
    except Exception as e:
        logger.error(f"Error en logout: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@app.route('/api/auth/check', methods=['GET'])
def check_auth():
    return jsonify({'autenticado': 'user_id' in session})

# Rutas de Categorías
@app.route('/api/categorias', methods=['GET'])
def obtener_categorias():
    categorias = Categoria.query.all()
    return jsonify([c.to_dict() for c in categorias])

@app.route('/api/categorias', methods=['POST'])
@requiere_auth
def crear_categoria():
    datos = request.json
    nueva_categoria = Categoria(
        nombre=datos['nombre'],
        valor=datos['valor'].lower().replace(' ', '_')
    )
    try:
        db.session.add(nueva_categoria)
        db.session.commit()
        return jsonify({'mensaje': 'Categoría creada exitosamente'}), 201
    except Exception:
        db.session.rollback()
        return jsonify({'error': 'La categoría ya existe'}), 400

@app.route('/api/categorias/<int:id>', methods=['DELETE'])
@requiere_auth
def eliminar_categoria(id: int):
    categoria = Categoria.query.get_or_404(id)
    if Producto.query.filter_by(categoria=categoria.valor).first():
        return jsonify({'error': 'No se puede eliminar una categoría con productos'}), 400
    db.session.delete(categoria)
    db.session.commit()
    return jsonify({'mensaje': 'Categoría eliminada exitosamente'})

# Rutas de Productos
@app.route('/api/productos', methods=['GET'])
def obtener_productos():
    try:
        logger.info("Iniciando obtención de productos")
        productos = Producto.query.all()
        resultado = [p.to_dict() for p in productos]
        logger.info(f"Productos obtenidos exitosamente: {len(resultado)} productos")
        return jsonify(resultado)
    except Exception as e:
        logger.error(f"Error al obtener productos: {str(e)}")
        return jsonify({'error': 'Error al obtener productos'}), 500

@app.route('/api/productos', methods=['POST'])
@requiere_auth
def crear_producto():
    try:
        datos = request.json
        # Validar que todos los campos requeridos estén presentes
        campos_requeridos = ['nombre', 'descripcion', 'precio', 'categoria']
        campos_faltantes = [campo for campo in campos_requeridos if campo not in datos or not datos[campo]]
        
        if campos_faltantes:
            return jsonify({
                'error': f'Faltan campos requeridos: {", ".join(campos_faltantes)}'
            }), 400

        # Validar que la categoría existe
        categoria = Categoria.query.filter_by(valor=datos['categoria']).first()
        if not categoria:
            return jsonify({
                'error': 'La categoría seleccionada no existe'
            }), 400

        nuevo_producto = Producto(
            nombre=datos['nombre'],
            descripcion=datos['descripcion'],
            precio=datos['precio'],
            categoria=datos['categoria'],
            disponible=datos.get('disponible', True),
            imagen_url=datos.get('imagen_url')
        )
        db.session.add(nuevo_producto)
        db.session.commit()
        return jsonify({'mensaje': 'Producto creado exitosamente'}), 201
    except Exception as e:
        logger.error(f"Error al crear producto: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Error al crear el producto. Por favor, verifica los datos ingresados.'}), 400

@app.route('/api/productos/<int:id>', methods=['PUT'])
@requiere_auth
def actualizar_producto(id: int):
    producto = Producto.query.get_or_404(id)
    datos = request.json
    for campo in ['nombre', 'descripcion', 'precio', 'categoria', 'disponible', 'imagen_url']:
        if campo in datos:
            setattr(producto, campo, datos[campo])
    db.session.commit()
    return jsonify({'mensaje': 'Producto actualizado exitosamente'})

@app.route('/api/productos/<int:id>', methods=['DELETE'])
@requiere_auth
def eliminar_producto(id: int):
    producto = Producto.query.get_or_404(id)
    db.session.delete(producto)
    db.session.commit()
    return jsonify({'mensaje': 'Producto eliminado exitosamente'})

# Después de crear las tablas
with app.app_context():
    try:
        logger.info("Intentando conectar a la base de datos...")
        db.create_all()
        logger.info("✅ Tablas creadas exitosamente")
        
        # Verificar la conexión
        db.session.execute(text('SELECT 1'))
        logger.info("✅ Conexión a la base de datos verificada")
        
        crear_datos_ejemplo(app, db, Categoria, Producto)
    except Exception as e:
        logger.error(f"❌ Error al inicializar la base de datos: {str(e)}")
        raise

if __name__ == '__main__':
    app.run(debug=True) 