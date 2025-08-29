// js/script.js

document.addEventListener('DOMContentLoaded', () => {
    const proyectosGrid = document.getElementById('proyectos-grid');
    const filtrosContainer = document.getElementById('filtros-proyectos');

    // Función para renderizar los proyectos en el grid
    const renderizarProyectos = (filtro = 'Todos') => {
        proyectosGrid.innerHTML = ''; // Limpiar el grid

        const proyectosFiltrados = (filtro === 'Todos')
            ? proyectosDB
            : proyectosDB.filter(proyecto => proyecto.categoria === filtro);

        if (proyectosFiltrados.length === 0) {
            proyectosGrid.innerHTML = `<p class="text-gray-500 col-span-full text-center">No hay proyectos en esta categoría.</p>`;
            return;
        }
        
        proyectosFiltrados.forEach(proyecto => {
            const proyectoHTML = `
                <div class="proyecto-card bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group">
                    <div class="relative">
                        <img src="${proyecto.imagen}" alt="Imagen de ${proyecto.titulo}" class="w-full h-56 object-cover">
                        <div class="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-0 transition-all duration-300"></div>
                    </div>
                    <div class="p-6">
                        <span class="text-sm font-semibold text-blue-600">${proyecto.categoria}</span>
                        <h3 class="text-xl font-bold mt-2 mb-3">${proyecto.titulo}</h3>
                        <p class="text-gray-600 text-sm mb-4 h-12">${proyecto.descripcion}</p>
                        <a href="${proyecto.url}" target="_blank" class="inline-block bg-gray-800 text-white font-semibold py-2 px-5 rounded-md hover:bg-blue-600 transition-all duration-300 no-underline">
                            Ver Proyecto <i class="fa-solid fa-arrow-right-long ml-2"></i>
                        </a>
                    </div>
                </div>
            `;
            proyectosGrid.innerHTML += proyectoHTML;
        });
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


    // Carga inicial de todos los proyectos
    renderizarProyectos('Todos');
});