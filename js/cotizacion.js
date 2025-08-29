document.addEventListener('DOMContentLoaded', () => {
    const formatCurrency = (value) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);

    const params = new URLSearchParams(window.location.search);
    const serviciosIds = params.get('servicios')?.split(',') || [];
    const detalleContainer = document.getElementById('detalle-servicios');

    if (serviciosIds.length === 0) {
        detalleContainer.innerHTML = '<p class="text-red-500 text-center">No se han seleccionado servicios. Por favor, vuelve al cotizador.</p>';
        return;
    }
    
    const todosLosModulos = [...modulosDB.catalogo, ...modulosDB.retail];
    const serviciosSeleccionados = serviciosIds.map(id => {
        return todosLosModulos.find(modulo => modulo.id === id);
    }).filter(Boolean);

    const totalUnico = serviciosSeleccionados.filter(m => m.tipo === 'unico').reduce((sum, m) => sum + m.precio, 0);
    const totalRecurrente = serviciosSeleccionados.filter(m => m.tipo === 'recurrente').reduce((sum, m) => sum + m.precio, 0);

    detalleContainer.innerHTML = '';
    serviciosSeleccionados.forEach(servicio => {
        const servicioHTML = `
            <div class="p-4 border rounded-lg bg-gray-50 flex justify-between items-center">
                <div>
                    <h4 class="font-bold text-lg">${servicio.nombre}</h4>
                    <p class="text-gray-600">${servicio.descripcion}</p>
                </div>
                <div class="text-right flex-shrink-0 ml-4">
                    <p class="font-bold text-lg">${formatCurrency(servicio.precio)}</p>
                    <span class="text-sm ${servicio.tipo === 'recurrente' ? 'text-red-500' : 'text-green-600'}">${servicio.tipo === 'recurrente' ? 'Pago Mensual' : 'Pago Único'}</span>
                </div>
            </div>
        `;
        detalleContainer.innerHTML += servicioHTML;
    });

    document.getElementById('total-unico-contrato').textContent = formatCurrency(totalUnico);
    document.getElementById('total-recurrente-contrato').textContent = `${formatCurrency(totalRecurrente)}/mes`;
    document.getElementById('fecha-actual').textContent = new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' });

    // --- LÓGICA DE WHATSAPP ---
    const tuNumeroDeWhatsApp = '51924281623'; // ¡IMPORTANTE! Reemplaza con tu número.
    let mensaje = `¡Hola Alfactor! 👋\n\nEstoy interesado(a) en contratar los siguientes servicios según la cotización de su sitio web:\n\n`;
    serviciosSeleccionados.forEach(s => {
        mensaje += `• *${s.nombre}* (${formatCurrency(s.precio)}${s.tipo === 'recurrente' ? '/mes' : ''})\n`;
    });
    mensaje += `\n*Resumen de Inversión:*\n`;
    mensaje += `Pagos Únicos: *${formatCurrency(totalUnico)}*\n`;
    mensaje += `Pagos Mensuales: *${formatCurrency(totalRecurrente)}/mes*\n\n`;
    mensaje += `Quedo a la espera de los siguientes pasos. ¡Gracias!`;

    const mensajeCodificado = encodeURIComponent(mensaje);
    document.getElementById('btn-whatsapp').href = `https://wa.me/${tuNumeroDeWhatsApp}?text=${mensajeCodificado}`;
});