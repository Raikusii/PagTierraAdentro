let listaProductos = [];
let datosCargados = false;

const IMG_PLACEHOLDER = `data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="90" height="90"><rect fill="#252525" width="90" height="90"/><text x="45" y="48" text-anchor="middle" fill="#666" font-size="10" font-family="sans-serif">Licor</text></svg>'
)}`;

const contenedor = document.getElementById("menu-productos");
const nav = document.getElementById("bottom-nav");
const modal = document.getElementById("product-modal");
const modalSourceWebp = document.getElementById("modal-source-webp");
const modalImg = document.getElementById("modal-img");
const modalTitle = document.getElementById("modal-title");
const modalDesc = document.getElementById("modal-desc");
const modalPrice = document.getElementById("modal-price");

function rutasImagen(ruta) {
    const nombre = ruta.split("/").pop();
    const base = nombre.replace(/\.[^.]+$/, "");
    return {
        thumbWebp: `assets/thumbs/${base}.webp`,
        thumbJpg: `assets/thumbs/${base}.jpg`,
        mediumWebp: `assets/medium/${base}.webp`,
        mediumJpg: `assets/medium/${base}.jpg`,
        original: ruta
    };
}

function conexionLenta() {
    const red = navigator.connection;
    if (!red) return false;
    if (red.saveData) return true;
    return ["slow-2g", "2g", "3g"].includes(red.effectiveType);
}

function crearImagenLista(producto, indice) {
    const urls = rutasImagen(producto.imagen);
    const prioritaria = indice < 2;
    const loading = prioritaria ? "eager" : "lazy";
    const prioridad = prioritaria ? ' fetchpriority="high"' : "";

    return `
        <picture>
            <source srcset="${urls.thumbWebp}" type="image/webp">
            <img
                src="${urls.thumbJpg}"
                alt="${producto.nombre}"
                class="product-img"
                width="90"
                height="90"
                loading="${loading}"
                decoding="async"${prioridad}
                onerror="this.onerror=null;this.src='${IMG_PLACEHOLDER}'"
            >
        </picture>
    `;
}

function mostrarSkeleton(cantidad = 4) {
    contenedor.innerHTML = "";
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < cantidad; i++) {
        const skeleton = document.createElement("div");
        skeleton.classList.add("skeleton-card");
        skeleton.innerHTML = `
            <div class="skeleton-img"></div>
            <div class="skeleton-body">
                <div class="skeleton-line skeleton-line--title"></div>
                <div class="skeleton-line skeleton-line--desc"></div>
                <div class="skeleton-line skeleton-line--price"></div>
            </div>
        `;
        fragment.appendChild(skeleton);
    }

    contenedor.appendChild(fragment);
}

document.addEventListener("DOMContentLoaded", () => {
    contenedor.classList.add("is-loading");
    mostrarSkeleton();

    nav.addEventListener("click", (e) => {
        const boton = e.target.closest(".nav-item");
        if (!boton) return;
        filtrarCategoria(boton.dataset.categoria, boton);
    });

    contenedor.addEventListener("click", (e) => {
        const tarjeta = e.target.closest(".product-card");
        if (!tarjeta) return;
        const producto = listaProductos.find(p => p.id == tarjeta.dataset.id);
        if (producto) abrirModal(producto);
    });

    modal.addEventListener("click", (e) => {
        if (e.target.closest("[data-close]")) cerrarModal();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("is-open")) cerrarModal();
    });

    fetch("productos.json")
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        })
        .then(data => {
            if (!Array.isArray(data)) throw new Error("Formato de datos inválido");
            listaProductos = data;
            datosCargados = true;
            contenedor.classList.remove("is-loading");
            mostrarProductos(listaProductos);
        })
        .catch(error => {
            console.error("Error cargando los productos:", error);
            contenedor.classList.remove("is-loading");
            contenedor.innerHTML = `<p class="menu-empty">No se pudo cargar el menú. Intenta recargar la página.</p>`;
        });
});

function mostrarProductos(productos) {
    contenedor.innerHTML = "";

    if (productos.length === 0) {
        contenedor.innerHTML = `<p class="menu-empty">No hay productos en esta categoría.</p>`;
        return;
    }

    const fragment = document.createDocumentFragment();

    productos.forEach((producto, indice) => {
        const tarjeta = document.createElement("div");
        tarjeta.classList.add("product-card");
        tarjeta.dataset.id = producto.id;

        tarjeta.innerHTML = `
            <div class="product-img-wrap">
                ${crearImagenLista(producto, indice)}
            </div>
            <div class="product-info">
                <div>
                    <h3 class="product-title">${producto.nombre}</h3>
                    <p class="product-desc">${producto.descripcion}</p>
                </div>
                <span class="product-price">${producto.precio}</span>
            </div>
        `;
        fragment.appendChild(tarjeta);
    });

    contenedor.appendChild(fragment);
}

function abrirModal(producto) {
    const urls = rutasImagen(producto.imagen);
    const lenta = conexionLenta();

    modalSourceWebp.srcset = lenta ? urls.thumbWebp : urls.mediumWebp;
    modalImg.src = lenta ? urls.thumbJpg : urls.mediumJpg;
    modalImg.alt = producto.nombre;

    modalImg.onerror = () => {
        modalImg.onerror = () => {
            modalImg.src = IMG_PLACEHOLDER;
        };
        modalSourceWebp.srcset = urls.original;
        modalImg.src = urls.original;
    };

    modalTitle.textContent = producto.nombre;
    modalDesc.textContent = producto.descripcion;
    modalPrice.textContent = producto.precio;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
}

function cerrarModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");

    modalSourceWebp.removeAttribute("srcset");
    modalImg.removeAttribute("src");
}

function filtrarCategoria(categoria, elementoBoton) {
    if (!datosCargados) return;

    document.querySelectorAll(".nav-item").forEach(btn => btn.classList.remove("active"));
    elementoBoton.classList.add("active");

    const productosFiltrados = categoria === "todos"
        ? listaProductos
        : listaProductos.filter(p => p.categoria === categoria);

    contenedor.classList.add("is-fading");

    requestAnimationFrame(() => {
        setTimeout(() => {
            mostrarProductos(productosFiltrados);
            contenedor.classList.remove("is-fading");
            contenedor.scrollTo({ top: 0, behavior: "smooth" });
        }, 150);
    });
}
