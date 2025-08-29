// js/contrato.js

document.addEventListener('DOMContentLoaded', () => {
    // FORMATEADOR DE MONEDA
    const formatCurrency = (value) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);

    // 1. OBTENER LOS IDs DE LA URL
    const params = new URLSearchParams(window.location.search);
    const serviciosIds = params.get('servicios')?.split(',') || []; // Usamos '?' y '|| []' para evitar errores si no hay parámetros

    if (serviciosIds.length === 0) {
        document.getElementById('detalle-servicios').innerHTML = '<p class="text-red-500">No se han seleccionado servicios. Por favor, vuelve al cotizador.</p>';
        return;
    }
    
    // 2. BUSCAR LOS DETALLES DE CADA SERVICIO EN modulosDB
    const todosLosModulos = [...modulosDB.catalogo, ...modulosDB.retail];
    const serviciosSeleccionados = serviciosIds.map(id => {
        return todosLosModulos.find(modulo => modulo.id === id);
    }).filter(Boolean); // .filter(Boolean) elimina cualquier resultado 'undefined' si un ID no se encontrara

    // 3. CALCULAR TOTALES
    const totalUnico = serviciosSeleccionados
        .filter(m => m.tipo === 'unico')
        .reduce((sum, m) => sum + m.precio, 0);

    const totalRecurrente = serviciosSeleccionados
        .filter(m => m.tipo === 'recurrente')
        .reduce((sum, m) => sum + m.precio, 0);

    // 4. MOSTRAR LOS DATOS EN LA PÁGINA
    const detalleContainer = document.getElementById('detalle-servicios');
    detalleContainer.innerHTML = ''; // Limpiar

    serviciosSeleccionados.forEach(servicio => {
        const servicioHTML = `
            <div class="p-4 border rounded-lg bg-gray-50 flex justify-between items-center">
                <div>
                    <h4 class="font-bold text-lg">${servicio.nombre}</h4>
                    <p class="text-gray-600">${servicio.descripcion}</p>
                </div>
                <div class="text-right">
                    <p class="font-bold text-lg">${formatCurrency(servicio.precio)}</p>
                    <span class="text-sm ${servicio.tipo === 'recurrente' ? 'text-red-500' : 'text-green-600'}">${servicio.tipo === 'recurrente' ? 'Pago Mensual' : 'Pago Único'}</span>
                </div>
            </div>
        `;
        detalleContainer.innerHTML += servicioHTML;
    });

    // Mostrar totales y fecha
    document.getElementById('total-unico-contrato').textContent = formatCurrency(totalUnico);
    document.getElementById('total-recurrente-contrato').textContent = `${formatCurrency(totalRecurrente)}/mes`;
    document.getElementById('fecha-actual').textContent = new Date().toLocaleDateString('es-PE');
});