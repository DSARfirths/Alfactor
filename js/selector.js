document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const perfil = params.get('perfil');

    if (!perfil || !['catalogo', 'retail'].includes(perfil)) {
        window.location.href = 'index.html';
        return;
    }

    const tituloSelector = document.getElementById('titulo-selector');
    const modulosContainer = document.getElementById(`modulos-${perfil}`);
    
    tituloSelector.textContent = `Personaliza tu solución de ${perfil === 'catalogo' ? 'Catálogo Digital' : 'E-commerce'}`;
    modulosContainer.classList.remove('hidden');
    
    const opcionesContainer = document.getElementById('opciones-container');
    const carritoFlotante = document.getElementById('carrito-flotante');
    const carritoContraido = document.getElementById('carrito-contraido');
    const carritoExpandido = document.getElementById('carrito-expandido');
    const cerrarCarritoBtn = document.getElementById('cerrar-carrito');
    const carritoItemsCount = document.getElementById('carrito-items-count');
    const carritoTotalPreview = document.getElementById('carrito-total-preview');
    const resumenLista = document.getElementById('resumen-lista');
    const totalUnicoElem = document.getElementById('total-unico');
    const totalRecurrenteElem = document.getElementById('total-recurrente');

    let seleccion = { perfil: perfil, modulos: [] };
    const formatCurrency = (value) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);

    function renderizarModulos() {
        const grid = modulosContainer.querySelector('.grid');
        grid.innerHTML = '';
        const modulos = modulosDB[perfil];
        modulos.forEach(modulo => {
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

                    <div class="p-4 flex flex-col justify-between" style="height: 180px;">
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
    }

    opcionesContainer.addEventListener('click', (event) => {
        const zoomBtn = event.target.closest('.zoom-btn');
        const addToCartBtn = event.target.closest('.add-to-cart-btn');

        if (zoomBtn) {
            const imgSrc = zoomBtn.dataset.imgSrc;
            basicLightbox.create(`<img src="${imgSrc}" alt="Vista ampliada">`).show();
            return;
        }

        if (addToCartBtn) {
            const card = addToCartBtn.closest('.modulo-card');
            const checkbox = card.querySelector('.modulo-check');
            checkbox.checked = !checkbox.checked;
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
    
    opcionesContainer.addEventListener('change', (event) => {
        if (!event.target.classList.contains('modulo-check')) return;
        
        const checkbox = event.target;
        const card = checkbox.closest('.modulo-card');
        const button = card.querySelector('.add-to-cart-btn');

        card.classList.toggle('selected', checkbox.checked);
        
        if (checkbox.checked) {
            button.classList.add('added');
            button.innerHTML = `<i class="fa-solid fa-check mr-2"></i> Añadido`;
        } else {
            button.classList.remove('added');
            button.innerHTML = `<i class="fa-solid fa-plus mr-2"></i> Lo Quiero`;
        }

        const moduloData = { id: checkbox.id, nombre: checkbox.dataset.nombre, precio: parseFloat(checkbox.dataset.precio), tipo: checkbox.dataset.tipo };

        if (checkbox.checked) {
            seleccion.modulos.push(moduloData);
        } else {
            seleccion.modulos = seleccion.modulos.filter(m => m.id !== moduloData.id);
        }
        actualizarResumenYCarrito();
    });

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

        const btnContrato = document.getElementById('btn-contrato');
        if (itemCount > 0) {
            const ids = seleccion.modulos.map(m => m.id);
            const queryString = ids.join(',');
            btnContrato.href = `cotizacion.html?servicios=${queryString}`;
            btnContrato.classList.remove('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
            resumenLista.innerHTML = seleccion.modulos.map(m => `<div class="flex justify-between items-center py-2 border-b border-gray-100"><span>${m.nombre}</span><span class="font-semibold">${formatCurrency(m.precio)}</span></div>`).join('');
            mostrarCarrito();
        } else {
            btnContrato.href = '#';
            btnContrato.classList.add('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
            resumenLista.innerHTML = '<p class="text-gray-500">Aún no has añadido módulos.</p>';
            ocultarCarrito();
        }
    }

    function mostrarCarrito() { carritoFlotante.classList.remove('opacity-0', '-translate-y-10', 'pointer-events-none'); }
    function ocultarCarrito() { carritoFlotante.classList.add('opacity-0', '-translate-y-10', 'pointer-events-none'); carritoExpandido.classList.add('hidden'); }
    
    renderizarModulos();
    actualizarResumenYCarrito(); // Para estado inicial del botón de cotización
});