from typing import List, Dict, Any
from app import app, db, Categoria, Producto

def crear_datos_ejemplo() -> None:
    """Crea datos de ejemplo para la aplicación solo si no existen datos."""
    with app.app_context():
        # Verificar si ya existen datos
        if Categoria.query.first() is not None:
            print('✅ Ya existen datos en la base de datos')
            return

        categorias: List[Dict[str, str]] = [
            {'nombre': 'Cafés', 'valor': 'cafes'},
            {'nombre': 'Postres', 'valor': 'postres'},
            {'nombre': 'Bebidas', 'valor': 'bebidas'},
            {'nombre': 'Sándwiches', 'valor': 'sandwiches'},
            {'nombre': 'Desayunos', 'valor': 'desayunos'}
        ]

        productos: List[Dict[str, Any]] = [
            {
                'nombre': 'Espresso',
                'descripcion': 'Café espresso italiano tradicional',
                'precio': 2.50,
                'categoria': 'cafes',
                'imagen_url': 'https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=500&auto=format'
            },
            {
                'nombre': 'Cappuccino',
                'descripcion': 'Espresso con leche espumada y cacao en polvo',
                'precio': 3.50,
                'categoria': 'cafes',
                'imagen_url': 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&auto=format'
            },
            {
                'nombre': 'Tiramisú',
                'descripcion': 'Postre italiano tradicional con café y mascarpone',
                'precio': 5.00,
                'categoria': 'postres',
                'imagen_url': 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&auto=format'
            },
            {
                'nombre': 'Cannoli',
                'descripcion': 'Dulce siciliano relleno de crema de ricotta',
                'precio': 4.00,
                'categoria': 'postres',
                'imagen_url': 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=500&auto=format'
            },
            {
                'nombre': 'Limonada Casera',
                'descripcion': 'Limonada fresca con menta',
                'precio': 3.00,
                'categoria': 'bebidas',
                'imagen_url': 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=500&auto=format'
            },
            {
                'nombre': 'Panini Caprese',
                'descripcion': 'Sándwich con mozzarella, tomate y albahaca',
                'precio': 6.50,
                'categoria': 'sandwiches',
                'imagen_url': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format'
            },
            {
                'nombre': 'Desayuno Italiano',
                'descripcion': 'Cappuccino, croissant y jugo de naranja',
                'precio': 8.50,
                'categoria': 'desayunos',
                'imagen_url': 'https://images.unsplash.com/photo-1495214783159-3503fd1b572d?w=500&auto=format'
            },
            {
                'nombre': 'Latte',
                'descripcion': 'Café con leche cremosa',
                'precio': 3.00,
                'categoria': 'cafes',
                'imagen_url': 'https://images.unsplash.com/photo-1561047029-3000c68339ca?w=500&auto=format'
            },
            {
                'nombre': 'Mocaccino',
                'descripcion': 'Café con chocolate y leche espumada',
                'precio': 4.00,
                'categoria': 'cafes',
                'imagen_url': 'https://images.unsplash.com/photo-1534687941688-651ccaafbff8?w=500&auto=format'
            },
            {
                'nombre': 'Panna Cotta',
                'descripcion': 'Postre cremoso con salsa de frutos rojos',
                'precio': 4.50,
                'categoria': 'postres',
                'imagen_url': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format'
            }
        ]

        try:
            # Crear categorías
            for cat in categorias:
                categoria = Categoria(nombre=cat['nombre'], valor=cat['valor'])
                db.session.add(categoria)
            db.session.commit()
            
            # Crear productos
            for prod in productos:
                producto = Producto(
                    nombre=prod['nombre'],
                    descripcion=prod['descripcion'],
                    precio=prod['precio'],
                    categoria=prod['categoria'],
                    disponible=True,
                    imagen_url=prod['imagen_url']
                )
                db.session.add(producto)
            db.session.commit()
            
            print('✅ Datos de ejemplo creados exitosamente')
        except Exception as e:
            db.session.rollback()
            print(f'❌ Error al crear datos de ejemplo: {str(e)}')

if __name__ == '__main__':
    crear_datos_ejemplo() 