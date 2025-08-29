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

    const originalCanvasForPdf = document.getElementById('signature-canvas');
    const btnDescargar = document.getElementById('btn-descargar-pdf');
    const botonesContainer = document.getElementById('botones-accion');

    btnDescargar.addEventListener('click', () => {
        // Ocultar los botones de acción en la página mientras se genera el PDF
        botonesContainer.style.display = 'none';

        // Generar un timestamp para el nombre del archivo
        const now = new Date();
        const timestamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;

        // Apuntamos al div que envuelve el contenido del PDF.
        const elementoParaConvertir = document.getElementById('pdf-content');

        const opciones = {
            margin: [0.5, 0.5, 0.8, 0.5], // Aumentamos el margen inferior a 0.8 para dar espacio al número de página
            filename: `Propuesta-Servicios-Alfactor-${timestamp}.pdf`,
            image: { type: 'jpeg', quality: 0.98 }, 
            html2canvas: { 
                scale: 2, // Mayor resolución
                useCORS: true, 
                logging: false, // Cambiar a true para depurar si es necesario
                onclone: (clonedDocument) => {
                    const clonedContent = clonedDocument.getElementById('pdf-content');
                    const clonedSiguientesPasos = clonedDocument.getElementById('seccion-siguientes-pasos');

                    // 1. Ocultar la sección "Siguientes Pasos" que no es relevante para el PDF.
                    if (clonedSiguientesPasos) {
                        clonedSiguientesPasos.style.display = 'none';
                    }

                    // 2. Ajustar el contenedor padre (el <form>) para que quepa en el PDF.
                    if (clonedContent && clonedContent.parentElement) {
                        const parent = clonedContent.parentElement; // El <form>
                        
                        // Reseteamos el body del clon para eliminar márgenes fantasma.
                        clonedDocument.body.style.margin = '0';
                        clonedDocument.body.style.padding = '0';
                        
                        // Reseteamos el contenedor principal y aplicamos un ancho fijo.
                        // ¡Esta es tu excelente idea en acción!
                        // Forzamos un ancho que sabemos que cabe en una página A4,
                        // lo que hará que el layout responsivo se active y se "comprima".
                        parent.style.margin = '0';
                        parent.style.width = '720px';
                        parent.style.maxWidth = '720px';
                        parent.style.boxShadow = 'none';
                        parent.style.border = 'none';
                    }

                    // 3. Copiar la firma al canvas del documento clonado.
                    const clonedCanvas = clonedDocument.getElementById('signature-canvas');
                    if (originalCanvasForPdf && clonedCanvas) {
                        const ctx = clonedCanvas.getContext('2d');
                        ctx.fillStyle = 'rgb(249, 250, 251)'; // bg-gray-50
                        ctx.fillRect(0, 0, clonedCanvas.width, clonedCanvas.height);
                        ctx.drawImage(originalCanvasForPdf, 0, 0);
                    }
                }
            },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: 'css', after: '.page-break-avoid' }
        };

        // Generamos el PDF, añadimos los números de página y luego guardamos.
        html2pdf().set(opciones).from(elementoParaConvertir).toPdf().get('pdf').then((pdf) => {
            const totalPages = pdf.internal.getNumberOfPages();
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            pdf.setFontSize(10);
            pdf.setTextColor(150);

            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                // Añadir el número de página en el centro del pie de página
                pdf.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 0.5, {
                    align: 'center'
                });
            }
        }).save().finally(() => {
            // Volver a mostrar los botones, sin importar si la descarga fue exitosa o cancelada
            botonesContainer.style.display = 'flex';
        });
    });

    // Lógica del Signature Pad
    const canvas = document.getElementById('signature-canvas');
    const signaturePad = new SignaturePad(canvas, {
        backgroundColor: 'rgb(249, 250, 251)' // Coincide con bg-gray-50
    });
    
    function resizeCanvas() {
        const ratio =  Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext("2d").scale(ratio, ratio);
        signaturePad.clear(); // Limpia el canvas al redimensionar
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    document.getElementById('clear-signature-btn').addEventListener('click', () => {
        signaturePad.clear();
    });

    // Integración con el envío del formulario
    document.getElementById('propuesta-form').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevenir el envío tradicional del formulario

        if (signaturePad.isEmpty()) {
            alert("Por favor, firme en el recuadro para continuar.");
            return; // Detiene la ejecución si no hay firma
        }

        document.getElementById('hidden-signature').value = signaturePad.toDataURL('image/png');
        
        const form = event.target;
        const data = new FormData(form);
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;

        // Deshabilitar botón y mostrar estado de "enviando"
        submitButton.disabled = true;
        submitButton.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i> Enviando...`;

        // Enviar datos con AJAX a Formspree
        fetch(form.action, {
            method: form.method,
            body: data,
            headers: {
                'Accept': 'application/json'
            }
        }).then(response => {
            if (response.ok) {
                // Éxito en el envío
                submitButton.innerHTML = `<i class="fa-solid fa-check mr-2"></i> ¡Enviado! Redirigiendo...`;
                alert('¡Propuesta enviada con éxito! Serás redirigido a WhatsApp para finalizar el contacto.');
                
                // Redirigir a la URL de WhatsApp generada en cotizacion.js
                const whatsAppUrl = document.getElementById('hidden-next-url').value;
                window.location.href = whatsAppUrl;
            } else {
                // Error del servidor de Formspree
                response.json().then(data => {
                    const errorMessage = data.errors ? data.errors.map(e => e.message).join(', ') : 'Hubo un problema al enviar la propuesta.';
                    alert(errorMessage);
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonText;
                });
            }
        }).catch(error => {
            // Error de red
            alert('Hubo un error de red. Por favor, revisa tu conexión e inténtalo de nuevo.');
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        });
    });
});
