from app import app, db, Categoria

categorias = [
    {"nombre": "Cafetería", "valor": "cafeteria"},
    {"nombre": "Bebidas", "valor": "bebidas"},
    {"nombre": "Postres", "valor": "postres"},
    {"nombre": "Platos Principales", "valor": "platos_principales"}
]

def crear_categorias():
    with app.app_context():
        for cat_data in categorias:
            # Verificar si la categoría ya existe
            categoria_existente = Categoria.query.filter_by(valor=cat_data["valor"]).first()
            if not categoria_existente:
                nueva_categoria = Categoria(
                    nombre=cat_data["nombre"],
                    valor=cat_data["valor"]
                )
                db.session.add(nueva_categoria)
                print(f"Categoría {cat_data['nombre']} creada")
            else:
                print(f"La categoría {cat_data['nombre']} ya existe")
        
        db.session.commit()
        print("Todas las categorías han sido procesadas")

if __name__ == "__main__":
    crear_categorias() 