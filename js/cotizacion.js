document.addEventListener('DOMContentLoaded', () => {
    const formatCurrency = (value) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);

    // --- ELEMENTOS DEL DOM ---
    const detalleContainer = document.getElementById('detalle-servicios-body');
    const form = document.getElementById('propuesta-form');
    const btnAceptar = form.querySelector('button[type="submit"]');
    const btnDescargar = document.getElementById('btn-descargar-pdf');
    const botonesContainer = document.getElementById('botones-accion');
    const canvas = document.getElementById('signature-canvas');
    const signaturePad = new SignaturePad(canvas, {
        backgroundColor: 'rgb(249, 250, 251)' // Coincide con bg-gray-50
    });

    // --- INICIALIZACIÓN DE DATOS ---
    const params = new URLSearchParams(window.location.search);
    const serviciosIds = params.get('servicios')?.split(',') || [];

    if (serviciosIds.length === 0) {
        // Deshabilitar botones si no hay servicios
        btnAceptar.disabled = true;
        btnDescargar.disabled = true;
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

    // --- LÓGICA DE WHATSAPP Y FORMULARIO ---
    const tuNumeroDeWhatsApp = '51924281623';

    // Poblar campos ocultos
    const serviciosParaForm = serviciosSeleccionados.map(s => `${s.nombre} (${formatCurrency(s.precio)}${s.tipo === 'recurrente' ? '/mes' : ''})`).join('; ');
    document.getElementById('hidden-servicios').value = serviciosParaForm;
    document.getElementById('hidden-total-unico').value = formatCurrency(totalUnico);
    document.getElementById('hidden-total-recurrente').value = `${formatCurrency(totalRecurrente)}/mes`;
    
    // Construir URL de redirección a WhatsApp
    const listaServiciosWhatsApp = serviciosSeleccionados.map(s => `- ${s.nombre} (${formatCurrency(s.precio)}${s.tipo === 'recurrente' ? '/mes' : ''})`).join('\n');
    const mensajeWhatsApp = `¡Hola Alfactor! 👋\n\nAcabo de aceptar la propuesta desde la web. Este es un resumen:\n\n*Servicios Contratados:*\n${listaServiciosWhatsApp}\n\n*Inversión Total:*\nPago Único: ${formatCurrency(totalUnico)}\nPago Mensual: ${formatCurrency(totalRecurrente)}/mes\n\nMis datos de contacto ya fueron enviados. Quedo a la espera de los siguientes pasos. ¡Gracias!`;
    const urlWhatsApp = `https://wa.me/${tuNumeroDeWhatsApp}?text=${encodeURIComponent(mensajeWhatsApp)}`;
    document.getElementById('hidden-next-url').value = urlWhatsApp;

    // --- FUNCIÓN DE VALIDACIÓN ---
    function validarDatosCliente() {
        const nombre = document.getElementById('cliente_nombre');
        const documento = document.getElementById('cliente_documento');
        const direccion = document.getElementById('cliente_direccion');
        const email = document.getElementById('cliente_email');
        
        // La validación HTML5 se encarga de la mayoría, pero comprobamos aquí para la descarga de PDF
        if (!nombre.checkValidity() || !documento.checkValidity() || !direccion.checkValidity() || !email.checkValidity()) {
            alert('Por favor, completa todos los datos del cliente con el formato correcto antes de continuar.');
            // Opcional: enfocar el primer campo inválido
            form.querySelector(':invalid')?.focus();
            return false;
        }
        return true;
    }

    // --- LÓGICA DE DESCARGA PDF ---
    btnDescargar.addEventListener('click', async () => {
        if (!validarDatosCliente()) {
            return; // Detiene si los datos del cliente no son válidos
        }

        botonesContainer.style.display = 'none';
        btnDescargar.disabled = true;
        btnDescargar.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Generando PDF...';

        try {
            const now = new Date();
            const timestamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
            const filename = `Propuesta-Servicios-Alfactor-${timestamp}.pdf`;
            const elementoParaConvertir = document.getElementById('pdf-content');
            
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'pt',
                format: 'a4'
            });

            await pdf.html(elementoParaConvertir, {
                callback: function (doc) {
                    doc.save(filename);
                },
                margin: [40, 30, 40, 30],
                autoPaging: 'slice', // SOLUCIÓN: Cambiado de 'text' a 'slice'
                html2canvas: {
                    scale: 0.75, // Ajusta la escala para mejor rendimiento y tamaño de archivo
                    useCORS: true,
                    onclone: (clonedDocument) => {
                        // Ocultar elementos no deseados en el PDF
                        clonedDocument.getElementById('seccion-siguientes-pasos').style.display = 'none';
                        
                        // Asegurar que la firma se renderice correctamente en el PDF
                        const originalCanvas = document.getElementById('signature-canvas');
                        const clonedCanvas = clonedDocument.getElementById('signature-canvas');
                        if (originalCanvas && clonedCanvas) {
                            clonedCanvas.getContext('2d').drawImage(originalCanvas, 0, 0);
                        }
                    }
                },
                x: 0,
                y: 0,
                width: 595, // Ancho de A4 en puntos
                windowWidth: 1024 // Un ancho de ventana razonable para el renderizado
            });

        } catch (error) {
            console.error("Error al generar el PDF:", error);
            alert("Hubo un error al generar el PDF. Por favor, inténtalo de nuevo.");
        } finally {
            botonesContainer.style.display = 'flex';
            btnDescargar.disabled = false;
            btnDescargar.innerHTML = '<i class="fa-solid fa-file-arrow-down mr-2"></i> Descargar PDF';
        }
    });

    // --- LÓGICA DEL SIGNATURE PAD ---
    function resizeCanvas() {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext("2d").scale(ratio, ratio);
        signaturePad.clear();
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    document.getElementById('clear-signature-btn').addEventListener('click', () => signaturePad.clear());

    // --- ENVÍO DEL FORMULARIO ---
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        // Validar campos de cliente y firma
        if (!validarDatosCliente()) {
            return;
        }
        if (signaturePad.isEmpty()) {
            alert("Por favor, firme en el recuadro para continuar.");
            return;
        }

        document.getElementById('hidden-signature').value = signaturePad.toDataURL('image/png');
        
        const data = new FormData(form);
        const originalButtonText = btnAceptar.innerHTML;

        btnAceptar.disabled = true;
        btnAceptar.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i> Enviando...`;

        fetch(form.action, {
            method: form.method,
            body: data,
            headers: { 'Accept': 'application/json' }
        }).then(response => {
            if (response.ok) {
                btnAceptar.innerHTML = `<i class="fa-solid fa-check mr-2"></i> ¡Enviado! Redirigiendo...`;
                alert('¡Propuesta enviada con éxito! Serás redirigido a WhatsApp para finalizar el contacto.');
                window.location.href = urlWhatsApp;
            } else {
                response.json().then(data => {
                    const errorMessage = data.errors ? data.errors.map(e => e.message).join(', ') : 'Hubo un problema al enviar la propuesta.';
                    alert(errorMessage);
                    btnAceptar.disabled = false;
                    btnAceptar.innerHTML = originalButtonText;
                });
            }
        }).catch(error => {
            alert('Hubo un error de red. Por favor, revisa tu conexión e inténtalo de nuevo.');
            btnAceptar.disabled = false;
            btnAceptar.innerHTML = originalButtonText;
        });
    });
});