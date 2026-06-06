let listaProductos = [];

// Cargar productos desde el JSON al iniciar la página
document.addEventListener("DOMContentLoaded", () => {
    fetch('productos.json')
        .then(response => response.json())
        .then(data => {
            listaProductos = data;
            mostrarProductos(listaProductos);
        })
        .catch(error => console.error("Error cargando los productos:", error));
});

// Función para renderizar las tarjetas de producto en el HTML
function mostrarProductos(productos) {
    const contenedor = document.getElementById("menu-productos");
    contenedor.innerHTML = ""; // Limpiar contenedor

    if(productos.length === 0) {
        contenedor.innerHTML = `<p style="text-align:center; grid-column: 1/-1; color: #666; margin-top:20px;">No hay productos en esta categoría.</p>`;
        return;
    }

    productos.forEach(producto => {
        const tarjeta = document.createElement("div");
        tarjeta.classList.add("product-card");
        
        tarjeta.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}" class="product-img" onerror="this.src='https://placehold.co/300x200/222/fff?text=Licor'">
            <div class="product-info">
                <div>
                    <h3 class="product-title">${producto.nombre}</h3>
                    <p class="product-desc">${producto.descripcion}</p>
                </div>
                <span class="product-price">${producto.precio}</span>
            </div>
        `;
        contenedor.appendChild(tarjeta);
    });
}

// Función para filtrar por categorías
function filtrarCategoria(categoria, elementoBoton) {
    // 1. Cambiar estado visual en los botones inferiores
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    elementoBoton.classList.add('active');

    // 2. Filtrar lógica de productos
    if (categoria === 'todos') {
        mostrarProductos(listaProductos);
    } else {
        const productosFiltrados = listaProductos.filter(p => p.categoria === categoria);
        mostrarProductos(productosFiltrados);
    }

    // Volver arriba de forma suave al cambiar de sección
    window.scrollTo({ top: 0, behavior: 'smooth' });
}