document.addEventListener('DOMContentLoaded', () => {
    const formatCurrency = (value) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);

    const params = new URLSearchParams(window.location.search);
    const serviciosIds = params.get('servicios')?.split(',') || [];
    const detalleContainer = document.getElementById('detalle-servicios-body');

    if (serviciosIds.length === 0) {
        // Deshabilitar botones si no hay servicios
        document.querySelector('.btn-aceptar-propuesta').disabled = true;
        document.querySelector('.btn-descargar-pdf').disabled = true;
        detalleContainer.innerHTML = '<tr><td colspan="3" class="text-red-500 text-center py-4">No se han seleccionado servicios. Por favor, vuelve al cotizador.</td></tr>';
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
            <tr>
                <td>
                    <p class="font-bold">${servicio.nombre}</p>
                    <p class="text-sm text-gray-500">${servicio.descripcion}</p>
                </td>
                <td class="text-center">
                    <span class="text-xs font-semibold px-2 py-1 rounded-full ${servicio.tipo === 'recurrente' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}">
                        ${servicio.tipo === 'recurrente' ? 'Mensual' : 'Único'}
                    </span>
                </td>
                <td class="text-right font-bold text-gray-800">${formatCurrency(servicio.precio)}</td>
            </tr>
        `;
        detalleContainer.innerHTML += servicioHTML;
    });

    document.getElementById('total-unico-contrato').textContent = formatCurrency(totalUnico);
    document.getElementById('total-recurrente-contrato').textContent = `${formatCurrency(totalRecurrente)}/mes`;
    document.getElementById('fecha-actual').textContent = new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' });

    // --- LÓGICA DEL FORMULARIO Y REDIRECCIÓN A WHATSAPP ---
    const tuNumeroDeWhatsApp = '51924281623';

    // 1. Poblar campos ocultos del formulario para Formspree
    const serviciosParaForm = serviciosSeleccionados.map(s =>
        `${s.nombre} (${formatCurrency(s.precio)}${s.tipo === 'recurrente' ? '/mes' : ''})`
    ).join('; ');

    document.getElementById('hidden-servicios').value = serviciosParaForm;
    document.getElementById('hidden-total-unico').value = formatCurrency(totalUnico);
    document.getElementById('hidden-total-recurrente').value = `${formatCurrency(totalRecurrente)}/mes`;

    // 2. Construir dinámicamente la URL de redirección a WhatsApp para Formspree
    const listaServiciosWhatsApp = serviciosSeleccionados.map(s => 
        `- ${s.nombre} (${formatCurrency(s.precio)}${s.tipo === 'recurrente' ? '/mes' : ''})`
    ).join('\n');

    const mensajeWhatsApp = `¡Hola Alfactor! 👋\n\nAcabo de aceptar la propuesta desde la web. Este es un resumen:\n\n*Servicios Contratados:*\n${listaServiciosWhatsApp}\n\n*Inversión Total:*\nPago Único: ${formatCurrency(totalUnico)}\nPago Mensual: ${formatCurrency(totalRecurrente)}/mes\n\nMis datos de contacto ya fueron enviados. Quedo a la espera de los siguientes pasos. ¡Gracias!`;
    
    const urlWhatsApp = `https://wa.me/${tuNumeroDeWhatsApp}?text=${encodeURIComponent(mensajeWhatsApp)}`;
    
    // Asignamos la URL al campo oculto '_next' que usará Formspree para redirigir.
    const nextUrlInput = document.getElementById('hidden-next-url');
    if (nextUrlInput) {
        nextUrlInput.value = urlWhatsApp;
    } else {
        console.error('El campo oculto con id "hidden-next-url" no se encontró en el HTML. La redirección a WhatsApp no funcionará.');
    }
});