// js/script.js

document.addEventListener('DOMContentLoaded', () => {
    const proyectosGrid = document.getElementById('proyectos-grid');
    const filtrosContainer = document.getElementById('filtros-proyectos');

    // Función para renderizar los proyectos en el grid
    const renderizarProyectos = (filtro = 'Todos') => {
        proyectosGrid.style.opacity = '0';

        setTimeout(() => {
            proyectosGrid.innerHTML = ''; // Limpiar el grid

        const proyectosFiltrados = (filtro === 'Todos')
                ? proyectosDB
                : proyectosDB.filter(proyecto => proyecto.categoria === filtro);

            if (proyectosFiltrados.length === 0) {
                proyectosGrid.innerHTML = `<p class="text-gray-500 col-span-full text-center">No hay proyectos en esta categoría.</p>`;
            } else {
                proyectosFiltrados.forEach(proyecto => {
                    const proyectoHTML = `
                        <div class="proyecto-card bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group" data-id="${proyecto.id}">
                            <div class="relative">
                                <img src="${proyecto.imagen}" alt="Imagen de ${proyecto.titulo}" class="w-full h-56 object-cover">
                                <div class="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-0 transition-all duration-300"></div>
                            </div>
                            <div class="p-6 flex flex-col flex-grow">
                                <span class="text-sm font-semibold text-blue-600">${proyecto.categoria}</span>
                                <h3 class="text-xl font-bold mt-2 mb-3">${proyecto.titulo}</h3>
                                <p class="text-gray-600 text-sm mb-4 flex-grow">${proyecto.descripcion.substring(0, 100)}...</p>
                                <a href="${proyecto.url}" target="_blank" class="inline-block bg-gray-800 text-white font-semibold py-2 px-5 rounded-md hover:bg-blue-600 transition-all duration-300 no-underline">
                                    Ver Proyecto <i class="fa-solid fa-arrow-right-long ml-2"></i>
                                </a>
                            </div>
                        </div>
                    `;
                    proyectosGrid.innerHTML += proyectoHTML;
                });
            }
            proyectosGrid.style.opacity = '1';
        }, 400); // Coincide con la duración de la transición en CSS
    };

    // Lógica para los botones de filtro
    filtrosContainer.addEventListener('click', (event) => {
        if (event.target.tagName === 'BUTTON') {
            // Quitar clase 'active' de todos los botones
            filtrosContainer.querySelectorAll('.filtro-btn').forEach(btn => btn.classList.remove('active'));
            // Añadir 'active' al botón clickeado
            event.target.classList.add('active');

            const filtro = event.target.dataset.filtro;
            renderizarProyectos(filtro);
        }
    });

    // Lógica para el modal de proyectos
    proyectosGrid.addEventListener('click', (event) => {
        const card = event.target.closest('.proyecto-card');
        if (card) {
            const proyectoId = card.dataset.id;
            const proyecto = proyectosDB.find(p => p.id === proyectoId);
            if (proyecto) {
                const tagsHTML = proyecto.tags.map(tag => `<span class="bg-gray-200 text-gray-700 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">${tag}</span>`).join('');
                // Botón de cierre en la esquina superior derecha
                const closeButton = `<button class="absolute top-2 right-2 bg-gray-700 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-500 transition-colors duration-200" onclick="basicLightbox.close()"><i class="fa-solid fa-times"></i></button>`;
                const modalContent = `
                    <div class="project-modal bg-white rounded-lg shadow-2xl overflow-hidden w-full max-w-4xl flex flex-col md:flex-row relative">
                        <button class="modal-close-btn" onclick="basicLightbox.close()">
                            <i class="fa-solid fa-times fa-lg"></i>
                        </button>
                        <div class="md:w-1/2">
                            <img src="${proyecto.imagen}" alt="${proyecto.titulo}" class="w-full h-64 md:h-full object-cover">
                        </div>
                        <div class="md:w-1/2 p-6 sm:p-8 flex flex-col modal-content-scroll">
                            <div class="flex-grow">
                                <span class="text-sm font-semibold text-blue-600 uppercase tracking-wider">${proyecto.categoria}</span>
                                <h2 class="text-3xl lg:text-4xl font-bold my-2 text-gray-800">${proyecto.titulo}</h2>
                                <div class="my-4 flex flex-wrap gap-2">
                                    ${tagsHTML}
                                </div>
                                <p class="text-gray-600 leading-relaxed">${proyecto.descripcion}</p>
                            </div>
                            <div class="mt-8 flex-shrink-0">
                                <a href="${proyecto.url}" target="_blank" class="inline-flex items-center justify-center bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300 no-underline w-full sm:w-auto">
                                    Visitar Sitio Web
                                    <i class="fa-solid fa-external-link-alt ml-2"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                `;


                const lightbox = basicLightbox.create(modalContent, {
                    className: 'flex items-center justify-center p-4', // Clases para centrar el modal y añadir padding
                    onShow: (instance) => {
                        // Evita el scroll del body cuando el modal está abierto
                        document.body.style.overflow = 'hidden';
                    },
                    onClose: (instance) => {
                        document.body.style.overflow = 'auto';
                    }
                });
                lightbox.show();
            }
        }
    });

    // Carga inicial de todos los proyectos
    renderizarProyectos('Todos');
    // Lógica para animación de aparición al hacer scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Cuando el elemento es visible, añade la clase 'visible'
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1 // Se activa cuando el 10% del elemento es visible
    });

    // Observar todos los elementos con la clase 'fade-in-up'
    document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el));
});