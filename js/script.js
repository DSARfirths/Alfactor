document.addEventListener('DOMContentLoaded', () => {

    

    // --- ELEMENTOS DEL DOM ---
    const perfilCards = document.querySelectorAll('.perfil-card');
    const opcionesContainer = document.getElementById('opciones-container');
    const modulosCatalogoContainer = document.querySelector('#modulos-catalogo');
    const modulosRetailContainer = document.querySelector('#modulos-retail');
    
    // Elementos del carrito flotante (para mostrar/ocultar)
    const carritoFlotante = document.getElementById('carrito-flotante');
    
    // --- ESTADO Y FORMATO ---
    let seleccion = { perfil: null, modulos: [] };
    const formatCurrency = (value) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);

    
    // --- FUNCIÓN PARA RENDERIZAR MÓDULOS ---
    function renderizarModulos() {
        const renderizar = (container, modulos) => {
            const grid = container.querySelector('.grid');
            grid.innerHTML = '';
            modulos.forEach(modulo => {
                // HTML del módulo con botón "Lo Quiero"
                const moduloHTML = `
                    <div class="modulo-card bg-white rounded-lg shadow-md transition-all duration-300 ease-in-out border-2 border-transparent overflow-hidden relative">
                        <input type="checkbox" class="modulo-check hidden" 
                               data-nombre="${modulo.nombre}" data-precio="${modulo.precio}" 
                               data-tipo="${modulo.tipo}" id="${modulo.id}">
                        
                        <div class="relative">
                            <img src="${modulo.imagen}" alt="${modulo.nombre}" class="rounded-t-lg w-full h-48 object-cover">
                            <div class="zoom-btn" data-img-src="${modulo.imagen}">
                                <i class="fa-solid fa-magnifying-glass-plus"></i>
                            </div>
                        </div>

                        <div class="p-4 flex flex-col justify-between h-[180px]">
                            <div>
                                <h4 class="font-bold">${modulo.nombre}</h4>
                                <p class="text-sm text-gray-500 h-10">${modulo.descripcion}</p>
                                <span class="precio">${(modulo.tipo === 'recurrente') ? formatCurrency(modulo.precio) + '/mes' : formatCurrency(modulo.precio)}</span>
                            </div>
                            <button class="add-to-cart-btn">
                                <i class="fa-solid fa-plus mr-2"></i> Lo Quiero
                            </button>
                        </div>
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
    perfilCards.forEach(card => {
        card.addEventListener('click', () => {
            // Si el perfil ya estaba seleccionado, no hacer nada
            const perfilSeleccionado = card.dataset.perfil;
            if (seleccion.perfil === perfilSeleccionado) return;
            resetCotizador();
            seleccion.perfil = perfilSeleccionado;
            perfilCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            opcionesContainer.classList.remove('hidden');
            if (perfilSeleccionado === 'catalogo') {
                modulosCatalogoContainer.classList.remove('hidden');
            } else {
                modulosRetailContainer.classList.remove('hidden');
            }
        });
    });

    // 2. Clics dentro del contenedor de módulos
    opcionesContainer.addEventListener('click', (event) => {
        const zoomBtn = event.target.closest('.zoom-btn');
        const addToCartBtn = event.target.closest('.add-to-cart-btn');

        // Acción para abrir el visualizador de imagen
        if (zoomBtn) {
            const imgSrc = zoomBtn.dataset.imgSrc;
            basicLightbox.create(`<img src="${imgSrc}" alt="Vista ampliada">`).show();
            return;
        }

        // Acción para el botón "Lo Quiero"
        if (addToCartBtn) {
            const card = addToCartBtn.closest('.modulo-card');
            const checkbox = card.querySelector('.modulo-check');
            checkbox.checked = !checkbox.checked; // Invertir el estado del checkbox
            // Disparamos el evento 'change' para que la otra función lo detecte y actualice el carrito
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
    
    // 3. Detectar Cambios en los Checkboxes
    opcionesContainer.addEventListener('change', (event) => {
        if (!event.target.classList.contains('modulo-check')) return;
        
        const checkbox = event.target;
        const card = checkbox.closest('.modulo-card');
        const button = card.querySelector('.add-to-cart-btn');

        card.classList.toggle('selected', checkbox.checked);
        
        // Cambiar el estilo y texto del botón
        if (checkbox.checked) {
            button.classList.add('added');
            button.innerHTML = `<i class="fa-solid fa-check mr-2"></i> Añadido`;
        } else {
            button.classList.remove('added');
            button.innerHTML = `<i class="fa-solid fa-plus mr-2"></i> Lo Quiero`;
        }

        const moduloData = {
            nombre: checkbox.dataset.nombre,
            precio: parseFloat(checkbox.dataset.precio),
            tipo: checkbox.dataset.tipo,
            id: checkbox.id
        };

        if (checkbox.checked) {
            seleccion.modulos.push(moduloData);
        } else {
            seleccion.modulos = seleccion.modulos.filter(m => m.id !== moduloData.id);
        }
        actualizarResumenYCarrito();
    });

    // 4. Interacciones del Carrito Flotante
    // carritoContraido.addEventListener ...

    // --- FUNCIONES LÓGICAS ---

    function resetCotizador() {
        const allCheckboxes = opcionesContainer.querySelectorAll('.modulo-check');
        allCheckboxes.forEach(cb => {
            cb.checked = false;
            const card = cb.closest('.modulo-card');
            if (card) {
                card.classList.remove('selected');
                // Devolver el botón a su estado original
                const button = card.querySelector('.add-to-cart-btn');
                button.classList.remove('added');
                button.innerHTML = `<i class="fa-solid fa-plus mr-2"></i> Lo Quiero`;
            }
        });
        
        modulosCatalogoContainer.classList.add('hidden');
        modulosRetailContainer.classList.add('hidden');
        opcionesContainer.classList.add('hidden');
        
        seleccion.modulos = [];
        actualizarResumenYCarrito();
    }
    
    // --- INICIALIZACIÓN ---
    renderizarModulos();
    
    const carritoContraido = document.getElementById('carrito-contraido');
    const carritoExpandido = document.getElementById('carrito-expandido');
    const cerrarCarritoBtn = document.getElementById('cerrar-carrito');
    const carritoItemsCount = document.getElementById('carrito-items-count');
    const carritoTotalPreview = document.getElementById('carrito-total-preview');
    const resumenLista = document.getElementById('resumen-lista');
    const totalUnicoElem = document.getElementById('total-unico');
    const totalRecurrenteElem = document.getElementById('total-recurrente');

    carritoContraido.addEventListener('click', () => carritoExpandido.classList.remove('hidden'));
    cerrarCarritoBtn.addEventListener('click', () => carritoExpandido.classList.add('hidden'));

    function actualizarResumenYCarrito() {
        const totalUnico = seleccion.modulos.filter(m => m.tipo === 'unico').reduce((sum, m) => sum + m.precio, 0);
        const totalRecurrente = seleccion.modulos.filter(m => m.tipo === 'recurrente').reduce((sum, m) => sum + m.precio, 0);
        const itemCount = seleccion.modulos.length;
        carritoItemsCount.textContent = `${itemCount} item${itemCount !== 1 ? 's' : ''}`;
        carritoTotalPreview.textContent = formatCurrency(totalUnico);
        totalUnicoElem.textContent = formatCurrency(totalUnico);
        totalRecurrenteElem.textContent = `${formatCurrency(totalRecurrente)}/mes`;
        // --- LÍNEAS NUEVAS A AÑADIR ---
        const btnContrato = document.getElementById('btn-contrato');
        if (itemCount > 0) {
            // Crear la lista de IDs para la URL
            const ids = seleccion.modulos.map(m => m.id);
            const queryString = ids.join(',');
            btnContrato.href = `contrato.html?servicios=${queryString}`;
            btnContrato.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
            // Deshabilitar el botón si no hay nada
            btnContrato.href = '#';
            btnContrato.classList.add('opacity-50', 'cursor-not-allowed');
        }
        // --- FIN DE LAS LÍNEAS NUEVAS ---
        if (itemCount === 0) {
            resumenLista.innerHTML = '<p class="text-gray-500">Aún no has añadido módulos.</p>';
            ocultarCarrito();
        } else {
            let listaHtml = seleccion.modulos.map(m => `<div class="flex justify-between items-center py-2 border-b border-gray-100"><span>${m.nombre}</span><span class="font-semibold">${formatCurrency(m.precio)}</span></div>`).join('');
            resumenLista.innerHTML = listaHtml;
            mostrarCarrito();
        }
    }
    function mostrarCarrito() { carritoFlotante.classList.remove('opacity-0', '-translate-y-10', 'pointer-events-none'); }
    function ocultarCarrito() { carritoFlotante.classList.add('opacity-0', '-translate-y-10', 'pointer-events-none'); carritoExpandido.classList.add('hidden'); }
});