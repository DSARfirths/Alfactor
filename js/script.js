document.addEventListener("DOMContentLoaded", () => {
    // =================================================================
    //  PANEL DE CONTROL DE MÓDULOS Y SERVICIOS
    //  Aquí puedes añadir, modificar o eliminar servicios fácilmente.
    // =================================================================
    const modulosDB = {
        catalogo: [
            {
                id: "cat-01",
                nombre: "Setup Catálogo Base",
                precio: 1800,
                tipo: "unico",
                descripcion: "Tu portafolio profesional en línea.",
                imagen:
                    "https://via.placeholder.com/800x600.png/007bff/ffffff?text=Catálogo+Digital",
            },
            {
                id: "cat-02",
                nombre: "Mantenimiento Mensual",
                precio: 150,
                tipo: "recurrente",
                descripcion: "Soporte, seguridad y actualizaciones.",
                imagen:
                    "https://via.placeholder.com/800x600.png/6c757d/ffffff?text=Soporte",
            },
            {
                id: "cat-03",
                nombre: "Google Maps y Negocio",
                precio: 350,
                tipo: "unico",
                descripcion: "Posicionamos tu negocio localmente.",
                imagen:
                    "https://via.placeholder.com/800x600.png/17a2b8/ffffff?text=Google+Maps",
            },
            {
                id: "cat-04",
                nombre: "Chatbot con IA Básico",
                precio: 950,
                tipo: "unico",
                descripcion: "Automatiza respuestas a clientes.",
                imagen:
                    "https://via.placeholder.com/800x600.png/ffc107/000000?text=Chatbot+IA",
            },
        ],
        retail: [
            {
                id: "ret-01",
                nombre: "E-commerce Completo",
                precio: 4500,
                tipo: "unico",
                descripcion: "Vende 24/7 con pasarela de pagos.",
                imagen:
                    "https://via.placeholder.com/800x600.png/28a745/ffffff?text=E-commerce",
            },
            {
                id: "ret-02",
                nombre: "Sistema POS a Medida",
                precio: 3200,
                tipo: "unico",
                descripcion: "Control total de tu punto de venta.",
                imagen:
                    "https://via.placeholder.com/800x600.png/fd7e14/ffffff?text=POS",
            },
            {
                id: "ret-03",
                nombre: "Mantenimiento E-commerce",
                precio: 300,
                tipo: "recurrente",
                descripcion: "Hosting, soporte y actualizaciones.",
                imagen:
                    "https://via.placeholder.com/800x600.png/6c757d/ffffff?text=Soporte",
            },
            {
                id: "ret-04",
                nombre: "Integración Lector de Barras",
                precio: 1200,
                tipo: "unico",
                descripcion: "Agiliza la gestión de tu inventario.",
                imagen:
                    "https://via.placeholder.com/800x600.png/dc3545/ffffff?text=Código+Barras",
            },
        ],
    };
    // =================================================================
    //  FIN DEL PANEL DE CONTROL
    // =================================================================

    // --- ELEMENTOS DEL DOM ---
    const perfilCards = document.querySelectorAll(".perfil-card");
    const opcionesContainer = document.getElementById("opciones-container");
    const modulosCatalogoContainer = document.querySelector("#modulos-catalogo");
    const modulosRetailContainer = document.querySelector("#modulos-retail");

    // Elementos del carrito flotante
    const carritoFlotante = document.getElementById("carrito-flotante");
    const carritoContraido = document.getElementById("carrito-contraido");
    const carritoExpandido = document.getElementById("carrito-expandido");
    const cerrarCarritoBtn = document.getElementById("cerrar-carrito");
    const carritoItemsCount = document.getElementById("carrito-items-count");
    const carritoTotalPreview = document.getElementById("carrito-total-preview");
    const resumenLista = document.getElementById("resumen-lista");
    const totalUnicoElem = document.getElementById("total-unico");
    const totalRecurrenteElem = document.getElementById("total-recurrente");

    // --- ESTADO DE LA APLICACIÓN ---
    let seleccion = {
        perfil: null,
        modulos: [],
    };

    // --- FORMATO DE MONEDA ---
    const formatCurrency = (value) =>
        new Intl.NumberFormat("es-PE", {
            style: "currency",
            currency: "PEN",
        }).format(value);

    // --- FUNCIÓN PARA RENDERIZAR MÓDULOS ---
    function renderizarModulos() {
        const renderizar = (container, modulos) => {
            const grid = container.querySelector(".grid");
            grid.innerHTML = ""; // Limpiar el grid
            modulos.forEach((modulo) => {
                const moduloHTML = `
                                <div class="modulo-card-wrapper">
                                    <label class="modulo-card">
                                        <input type="checkbox" class="modulo-check hidden" 
                                            data-nombre="${modulo.nombre}" 
                                            data-precio="${modulo.precio}" 
                                            data-tipo="${modulo.tipo}" 
                                            id="${modulo.id}">

                                        <div class="relative">
                                            <img src="${modulo.imagen}" alt="${modulo.nombre
                                                }" class="rounded-t-lg w-full h-48 object-cover">
                                            <div class="zoom-btn" data-img-src="${modulo.imagen}">
                                                <i class="fa-solid fa-magnifying-glass-plus"></i>
                                            </div>
                                        </div>

                                        <div class="p-4">
                                            <h4 class="font-bold">${modulo.nombre}</h4>
                                            <p class="text-sm text-gray-500 h-10">${modulo.descripcion}</p>
                                            <span class="precio">${modulo.tipo === "recurrente"
                                                    ? formatCurrency(modulo.precio) + "/mes"
                                                    : formatCurrency(modulo.precio)
                                                }</span>
                                        </div>
                                    </label>
                                </div>
                            `;
                grid.innerHTML += moduloHTML;
            });
        };

        renderizar(modulosCatalogoContainer, modulosDB.catalogo);
        renderizar(modulosRetailContainer, modulosDB.retail);
    }

    // --- MANEJADORES DE EVENTOS ---

    // 1. Selección de Perfil
    perfilCards.forEach((card) => {
        card.addEventListener("click", () => {
            const perfilSeleccionado = card.dataset.perfil;
            if (seleccion.perfil === perfilSeleccionado) return;

            resetCotizador();
            seleccion.perfil = perfilSeleccionado;

            perfilCards.forEach((c) => c.classList.remove("selected"));
            card.classList.add("selected");

            opcionesContainer.classList.remove("hidden");
            if (perfilSeleccionado === "catalogo") {
                modulosCatalogoContainer.classList.remove("hidden");
            } else {
                modulosRetailContainer.classList.remove("hidden");
            }
        });
    });

    // 2. Clics en los Módulos (para Zoom y Selección)
    opcionesContainer.addEventListener("click", (event) => {
        const zoomBtn = event.target.closest(".zoom-btn");
        const cardLabel = event.target.closest(".modulo-card");

        if (zoomBtn) {
            event.preventDefault();
            const imgSrc = zoomBtn.dataset.imgSrc;
            basicLightbox.create(`<img src="${imgSrc}" alt="Vista ampliada">`).show();
            return;
        }

        if (cardLabel) {
            const checkbox = cardLabel.querySelector(".modulo-check");
            if (event.target.tagName !== "INPUT") {
                checkbox.checked = !checkbox.checked;
            }
            checkbox.dispatchEvent(new Event("change", { bubbles: true }));
        }
    });

    // 3. Detectar Cambios en los Checkboxes para actualizar el carrito
    opcionesContainer.addEventListener("change", (event) => {
        if (!event.target.classList.contains("modulo-check")) return;

        const checkbox = event.target;
        const card = checkbox.closest(".modulo-card");
        card.classList.toggle("selected", checkbox.checked);

        const moduloData = {
            nombre: checkbox.dataset.nombre,
            precio: parseFloat(checkbox.dataset.precio),
            tipo: checkbox.dataset.tipo,
            id: checkbox.id,
        };

        if (checkbox.checked) {
            seleccion.modulos.push(moduloData);
        } else {
            seleccion.modulos = seleccion.modulos.filter(
                (m) => m.id !== moduloData.id
            );
        }
        actualizarResumenYCarrito();
    });

    // 4. Interacciones del Carrito Flotante
    carritoContraido.addEventListener("click", () =>
        carritoExpandido.classList.remove("hidden")
    );
    cerrarCarritoBtn.addEventListener("click", () =>
        carritoExpandido.classList.add("hidden")
    );

    // --- FUNCIONES LÓGICAS Y AUXILIARES ---

    function actualizarResumenYCarrito() {
        const totalUnico = seleccion.modulos
            .filter((m) => m.tipo === "unico")
            .reduce((sum, m) => sum + m.precio, 0);

        const totalRecurrente = seleccion.modulos
            .filter((m) => m.tipo === "recurrente")
            .reduce((sum, m) => sum + m.precio, 0);

        const itemCount = seleccion.modulos.length;

        // Actualizar vista contraída del carrito
        carritoItemsCount.textContent = `${itemCount} item${itemCount !== 1 ? "s" : ""
            }`;
        carritoTotalPreview.textContent = formatCurrency(totalUnico);

        // Actualizar vista expandida del carrito
        totalUnicoElem.textContent = formatCurrency(totalUnico);
        totalRecurrenteElem.textContent = `${formatCurrency(totalRecurrente)}/mes`;

        if (itemCount === 0) {
            resumenLista.innerHTML =
                '<p class="text-gray-500">Aún no has añadido módulos.</p>';
            ocultarCarrito();
        } else {
            let listaHtml = seleccion.modulos
                .map(
                    (m) => `
                <div class="flex justify-between items-center py-2 border-b border-gray-100">
                    <span>${m.nombre}</span>
                    <span class="font-semibold">${formatCurrency(
                        m.precio
                    )}</span>
                </div>
            `
                )
                .join("");
            resumenLista.innerHTML = listaHtml;
            mostrarCarrito();
        }
    }

    function mostrarCarrito() {
        carritoFlotante.classList.remove(
            "opacity-0",
            "-translate-y-10",
            "pointer-events-none"
        );
    }

    function ocultarCarrito() {
        carritoFlotante.classList.add(
            "opacity-0",
            "-translate-y-10",
            "pointer-events-none"
        );
        carritoExpandido.classList.add("hidden");
    }

    function resetCotizador() {
        const allCheckboxes = opcionesContainer.querySelectorAll(".modulo-check");
        allCheckboxes.forEach((cb) => {
            cb.checked = false;
            const card = cb.closest(".modulo-card");
            if (card) {
                card.classList.remove("selected");
            }
        });

        modulosCatalogoContainer.classList.add("hidden");
        modulosRetailContainer.classList.add("hidden");
        opcionesContainer.classList.add("hidden");

        seleccion.modulos = [];
        actualizarResumenYCarrito();
    }

    // --- INICIALIZACIÓN ---
    renderizarModulos();
});
