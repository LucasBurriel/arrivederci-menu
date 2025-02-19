# Caffè Arrivederci - Menú Digital

## Instrucciones para iniciar el proyecto

### 1. Iniciar el Backend (Servidor Flask)

1. Abre una nueva terminal de PowerShell
2. Navega hasta la carpeta del proyecto:
   ```
   cd C:\Users\lalal\Desktop\Lucas\Arrivederci
   ```
3. Entra a la carpeta backend:
   ```
   cd backend
   ```
4. Activa el entorno virtual:
   ```
   .\venv\Scripts\activate.ps1
   ```
5. Si es la primera vez o hay problemas con las dependencias, instálalas:
   ```
   pip install flask flask-sqlalchemy flask-cors Pillow
   ```
6. Inicia el servidor Flask:
   ```
   python app.py
   ```
   El servidor estará corriendo en http://127.0.0.1:5000/

### 2. Iniciar el Frontend (Servidor React)

1. Abre una nueva terminal de PowerShell (mantén la del backend abierta)
2. Navega hasta la carpeta del proyecto:
   ```
   cd C:\Users\lalal\Desktop\Lucas\Arrivederci
   ```
3. Entra a la carpeta frontend:
   ```
   cd frontend
   ```
4. Inicia el servidor de desarrollo:
   ```
   npm run dev
   ```

### 3. Acceder a la aplicación

- **Panel de Administración**: http://localhost:3000/login
- **Menú Digital**: http://localhost:3000

### Notas importantes:
- Ambos servidores (backend y frontend) deben estar corriendo simultáneamente
- Mantén las terminales abiertas mientras uses la aplicación
- Si necesitas detener los servidores, presiona Ctrl+C en cada terminal

## Características

- 📱 Interfaz responsive y moderna
- 🔍 Filtrado de productos por categoría
- 👨‍💼 Panel de administración para gestionar productos
- 💰 Gestión de precios y disponibilidad
- 📸 Soporte para imágenes de productos

## Requisitos

- Python 3.8 o superior
- Node.js 14 o superior
- npm o yarn

## Instalación

1. Clonar el repositorio:
```bash
git clone <url-del-repositorio>
cd caffe-arrivederci
```

2. Instalar dependencias del backend:
```bash
pip install -r requirements.txt
```

3. Instalar dependencias del frontend:
```bash
cd frontend
npm install
```

## Generación del código QR

Para generar el código QR que apunte al menú:

1. Acceder a un generador de códigos QR online
2. Introducir la URL de tu menú (cuando esté desplegado)
3. Descargar el código QR generado
4. Imprimir y colocar en las mesas del café

## Estructura del Proyecto

```
caffe-arrivederci/
├── backend/
│   └── app.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Menu.tsx
│   │   │   └── Admin.tsx
│   │   └── App.tsx
│   ├── package.json
│   └── tsconfig.json
└── requirements.txt
```

## Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles. 