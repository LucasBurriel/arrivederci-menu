# Caffè Arrivederci - Menú Digital

Sistema de menú digital para un café italiano, con panel de administración para gestionar categorías y productos.

## Características

- 📱 Interfaz responsive y moderna para clientes en dispositivos móviles
- 🔍 Filtrado de productos por categoría
- 👨‍💼 Panel de administración seguro para gestionar productos
- 💰 Gestión de precios y disponibilidad
- 📸 Soporte para imágenes de productos
- 🔒 Autenticación de administradores
- 📊 Base de datos PostgreSQL para almacenamiento persistente

## Requisitos

- Python 3.8 o superior
- Node.js 14 o superior
- npm o yarn
- PostgreSQL (recomendado para producción)

## Tecnologías

- **Frontend**: React, TypeScript, Material-UI, Vite
- **Backend**: Flask, SQLAlchemy
- **Base de datos**: PostgreSQL / SQLite (desarrollo)
- **Despliegue**: Vercel (frontend), Railway (backend y base de datos)

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/LucasBurriel/arrivederci-menu.git
cd arrivederci-menu
```

### 2. Configurar el backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual (Windows)
.\venv\Scripts\activate.ps1
# Activar entorno virtual (Linux/Mac)
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con los valores apropiados
```

### 3. Configurar el frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con los valores apropiados
```

## Instrucciones para iniciar el proyecto localmente

### 1. Iniciar el Backend (Servidor Flask)

1. Abre una nueva terminal
2. Navega hasta la carpeta del proyecto: `cd arrivederci-menu`
3. Entra a la carpeta backend: `cd backend`
4. Activa el entorno virtual:
   - Windows: `.\venv\Scripts\activate.ps1`
   - Linux/Mac: `source venv/bin/activate`
5. Inicia el servidor Flask: `python app.py`
   El servidor estará corriendo en http://127.0.0.1:5000/

### 2. Iniciar el Frontend (Servidor React)

1. Abre una nueva terminal (mantén la del backend abierta)
2. Navega hasta la carpeta del proyecto: `cd arrivederci-menu`
3. Entra a la carpeta frontend: `cd frontend`
4. Inicia el servidor de desarrollo: `npm run dev`

### 3. Acceder a la aplicación

- **Panel de Administración**: http://localhost:3000/login
- **Menú Digital**: http://localhost:3000

## Estructura del Proyecto

```
arrivederci-menu/
├── backend/                # Servidor Flask
│   ├── app.py              # Aplicación principal
│   ├── crear_datos_ejemplo.py # Datos de ejemplo
│   ├── requirements.txt    # Dependencias Python
│   └── .env.example        # Ejemplo de configuración
├── frontend/               # Cliente React
│   ├── src/                # Código fuente
│   │   ├── components/     # Componentes React
│   │   │   ├── Menu.tsx    # Menú para clientes
│   │   │   └── Admin.tsx   # Panel de administración
│   │   └── App.tsx         # Componente principal
│   ├── public/             # Archivos estáticos
│   ├── package.json        # Dependencias y scripts
│   └── .env.example        # Ejemplo de configuración
├── ISSUES.md               # Registro de problemas
└── README.md               # Documentación
```

## Configuración avanzada

### Variables de entorno del Backend

- `DATABASE_URL`: URL de conexión a la base de datos PostgreSQL
- `SECRET_KEY`: Clave secreta para sesiones y tokens
- `FLASK_ENV`: Entorno de ejecución (`development` o `production`)

### Variables de entorno del Frontend

- `VITE_API_URL`: URL del API del backend
- `NODE_ENV`: Entorno de ejecución
- `VITE_API_TIMEOUT`: Tiempo máximo de espera para peticiones al API

## Seguridad

El proyecto implementa varias medidas de seguridad:

- Almacenamiento seguro de contraseñas con hashing
- Protección CSRF en formularios
- Headers de seguridad HTTP (HSTS, X-Content-Type-Options, etc.)
- Autenticación basada en sesiones con cookies seguras
- Validación de entradas en backend y frontend

## Despliegue en producción

### Backend (Railway)

1. Crear una cuenta en Railway
2. Crear un nuevo proyecto
3. Configurar la base de datos PostgreSQL
4. Conectar repositorio de GitHub
5. Configurar variables de entorno

### Frontend (Vercel)

1. Crear una cuenta en Vercel
2. Importar proyecto desde GitHub
3. Configurar variables de entorno
4. Desplegar

## Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Hacer cambios y ejecutar pruebas:
   - Frontend: `npm run lint && npm run test`
   - Backend: `pytest`
4. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
5. Push a la rama (`git push origin feature/AmazingFeature`)
6. Abrir un Pull Request

## Generación del código QR

Para generar el código QR que apunte al menú:

1. Acceder a un generador de códigos QR online
2. Introducir la URL de tu menú (cuando esté desplegado)
3. Descargar el código QR generado
4. Imprimir y colocar en las mesas del café

## Mantenimiento

### Actualización de dependencias

- Backend: `pip install -r requirements.txt --upgrade`
- Frontend: `npm update`

### Backup de la base de datos

```bash
pg_dump -U username -d database_name > backup_$(date +%Y-%m-%d).sql
```

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles. 