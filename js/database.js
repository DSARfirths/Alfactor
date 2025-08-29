// =================================================================
    //  PANEL DE CONTROL DE MÓDULOS Y SERVICIOS
    // =================================================================
    const modulosDB = {
        catalogo: [
            { id: 'cat-01', nombre: 'Setup Catálogo Base', precio: 1800, tipo: 'unico', descripcion: 'Tu portafolio profesional en línea.', imagen: '../assets/catalago.png' },
            { id: 'cat-02', nombre: 'Mantenimiento Mensual', precio: 150, tipo: 'recurrente', descripcion: 'Soporte, seguridad y actualizaciones.', imagen: 'https://via.placeholder.com/800x600.png/6c757d/ffffff?text=Soporte' },
            { id: 'cat-03', nombre: 'Google Maps y Negocio', precio: 350, tipo: 'unico', descripcion: 'Posicionamos tu negocio localmente.', imagen: 'https://via.placeholder.com/800x600.png/17a2b8/ffffff?text=Google+Maps' },
            { id: 'cat-04', nombre: 'Chatbot con IA Básico', precio: 950, tipo: 'unico', descripcion: 'Automatiza respuestas a clientes.', imagen: 'https://via.placeholder.com/800x600.png/ffc107/000000?text=Chatbot+IA' }
        ],
        retail: [
            { id: 'ret-01', nombre: 'E-commerce Completo', precio: 4500, tipo: 'unico', descripcion: 'Vende 24/7 con pasarela de pagos.', imagen: 'https://via.placeholder.com/800x600.png/28a745/ffffff?text=E-commerce' },
            { id: 'ret-02', nombre: 'Sistema POS a Medida', precio: 3200, tipo: 'unico', descripcion: 'Control total de tu punto de venta.', imagen: 'https://via.placeholder.com/800x600.png/fd7e14/ffffff?text=POS' },
            { id: 'ret-03', nombre: 'Mantenimiento E-commerce', precio: 300, tipo: 'recurrente', descripcion: 'Hosting, soporte y actualizaciones.', imagen: 'https://via.placeholder.com/800x600.png/6c757d/ffffff?text=Soporte' },
            { id: 'ret-04', nombre: 'Integración Lector de Barras', precio: 1200, tipo: 'unico', descripcion: 'Agiliza la gestión de tu inventario.', imagen: 'https://via.placeholder.com/800x600.png/dc3545/ffffff?text=Código+Barras' }
        ]
    };
    // =================================================================