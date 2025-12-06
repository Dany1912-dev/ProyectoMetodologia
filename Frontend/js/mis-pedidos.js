// mis-pedidos.js - VERSIÓN COMPLETA CON CANCELACIÓN DE PEDIDOS
document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 mis-pedidos.js cargado');
    
    // ========== VARIABLES ==========
    const loadingPedidos = document.getElementById('loadingPedidos');
    const noPedidos = document.getElementById('noPedidos');
    const pedidosLista = document.getElementById('pedidosLista');
    const logoutBtn = document.getElementById('logoutBtn');
    const userName = document.getElementById('userName');
    const volverCatalogoBtn = document.querySelector('.btn-volver, [href="catalogo.html"]');
    
    // ========== VERIFICACIONES ==========
    if (!api.token) {
        console.warn('⚠️ No hay token, redirigiendo a login');
        window.location.href = 'index.html';
        return;
    }
    
    // Mostrar nombre de usuario
    const usuario = JSON.parse(localStorage.getItem('userInfo') || '{}');
    if (usuario.nombre && userName) {
        userName.textContent = usuario.nombre;
    }
    
    // ========== EVENT LISTENERS ==========
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            api.clearToken();
            window.location.href = 'index.html';
        });
    }
    
    if (volverCatalogoBtn) {
        volverCatalogoBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'catalogo.html';
        });
    }
    
    // ========== CARGAR PEDIDOS ==========
    cargarMisPedidos();
    
    // ========== FUNCIONES PRINCIPALES ==========
    async function cargarMisPedidos() {
        try {
            console.log('🔄 Cargando pedidos del usuario...');
            
            // Mostrar loading
            if (loadingPedidos) loadingPedidos.classList.remove('hidden');
            if (noPedidos) noPedidos.classList.add('hidden');
            if (pedidosLista) pedidosLista.classList.add('hidden');
            
            // Obtener pedidos desde la API
            const respuesta = await api.obtenerMisPedidos();
            console.log('📦 Respuesta de la API:', respuesta);
            
            // Verificar si la respuesta tiene la estructura esperada
            if (!respuesta || !respuesta.exito) {
                throw new Error(respuesta?.mensaje || 'Error al obtener pedidos');
            }
            
            const pedidos = respuesta.pedidos || [];
            console.log(`✅ ${pedidos.length} pedidos encontrados`);
            
            // Mostrar resultados
            if (pedidos.length === 0) {
                mostrarSinPedidos();
            } else {
                mostrarPedidos(pedidos);
            }
            
        } catch (error) {
            console.error('❌ Error cargando pedidos:', error);
            mostrarMensaje(`Error al cargar tus pedidos: ${error.message}`, 'error');
            mostrarSinPedidos();
        } finally {
            // Ocultar loading
            if (loadingPedidos) loadingPedidos.classList.add('hidden');
        }
    }
    
    function mostrarSinPedidos() {
        console.log('📭 Mostrando vista sin pedidos');
        if (noPedidos) noPedidos.classList.remove('hidden');
        if (pedidosLista) pedidosLista.classList.add('hidden');
    }
    
    function mostrarPedidos(pedidos) {
        console.log('📋 Mostrando lista de pedidos');
        
        if (!pedidosLista) {
            console.error('❌ No se encontró #pedidosLista');
            return;
        }
        
        // Ordenar pedidos por fecha (más recientes primero)
        pedidos.sort((a, b) => new Date(b.fechaPedido) - new Date(a.fechaPedido));
        
        // Generar HTML para cada pedido
        pedidosLista.innerHTML = pedidos.map(pedido => {
            // Formatear fechas
            const fechaPedido = new Date(pedido.fechaPedido).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const fechaEntrega = pedido.fechaEntregaEspecial 
                ? new Date(pedido.fechaEntregaEspecial).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })
                : null;
            
            // Determinar clase CSS para el estatus
            const estatusClass = `estatus-${pedido.estatus.toLowerCase().replace(' ', '')}`;
            
            // Calcular cantidad total de productos
            const totalProductos = pedido.productos 
                ? pedido.productos.reduce((sum, prod) => sum + (prod.cantidad || 0), 0)
                : 0;
            
            // Determinar si se puede cancelar (solo pedidos Pendiente o En Proceso)
            const sePuedeCancelar = 
                pedido.estatus === 'Pendiente' || 
                pedido.estatus === 'En Proceso';
            
            // Calcular horas desde el pedido (para mostrar advertencia de tiempo)
            const fechaPedidoObj = new Date(pedido.fechaPedido);
            const horasDesdePedido = (Date.now() - fechaPedidoObj.getTime()) / (1000 * 60 * 60);
            const mostrarAdvertenciaTiempo = sePuedeCancelar && horasDesdePedido > 22;
            const horasRestantes = mostrarAdvertenciaTiempo ? Math.ceil(24 - horasDesdePedido) : 0;
            
            return `
                <div class="pedido-card ${pedido.esPedidoEspecial ? 'pedido-especial' : ''}" 
                     data-pedido-id="${pedido.idPedidoCliente}"
                     data-estatus="${pedido.estatus}">
                    
                    <!-- ENCABEZADO DEL PEDIDO -->
                    <div class="pedido-header">
                        <div>
                            <h3>${pedido.esPedidoEspecial ? '🎉 Pedido Especial' : 'Pedido'}</h3>
                            <small>${fechaPedido}</small>
                        </div>
                        <span class="estatus-badge ${estatusClass}">
                            ${pedido.estatus}
                        </span>
                    </div>
                    
                    <!-- INFORMACIÓN DEL PEDIDO -->
                    <div class="pedido-info">
                        <div>
                            <div class="info-label">Total</div>
                            <div class="info-value">$${pedido.total.toFixed(2)}</div>
                        </div>
                        
                        <div>
                            <div class="info-label">Productos</div>
                            <div class="info-value">${totalProductos} items</div>
                        </div>
                        
                        ${pedido.esPedidoEspecial && fechaEntrega ? `
                            <div>
                                <div class="info-label">Fecha de entrega</div>
                                <div class="info-value">${fechaEntrega}</div>
                            </div>
                        ` : ''}
                        
                        ${pedido.notas ? `
                            <div style="grid-column: 1 / -1;">
                                <div class="info-label">Notas</div>
                                <div class="info-value">${pedido.notas}</div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- DETALLES DE PRODUCTOS (con acordeón) -->
                    ${pedido.productos && pedido.productos.length > 0 ? `
                        <details class="pedido-detalles">
                            <summary>
                                <span>Ver productos (${pedido.productos.length})</span>
                                <span class="detalles-toggle">▼</span>
                            </summary>
                            <div class="pedido-productos">
                                <ul>
                                    ${pedido.productos.map(producto => `
                                        <li>
                                            <span class="producto-nombre">${producto.productoNombre || 'Producto'}</span>
                                            <span class="producto-cantidad">×${producto.cantidad}</span>
                                            <span class="producto-subtotal">$${(producto.precioUnitario * producto.cantidad).toFixed(2)}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        </details>
                    ` : ''}
                    
                    <!-- ADVERTENCIA DE TIEMPO (si aplica) -->
                    ${mostrarAdvertenciaTiempo ? `
                        <div class="advertencia-tiempo">
                            ⏰ <strong>Atención:</strong> Solo puedes cancelar en las próximas ${horasRestantes} horas
                        </div>
                    ` : ''}
                    
                    <!-- BOTONES DE ACCIÓN -->
                    ${sePuedeCancelar ? `
                        <div class="pedido-acciones">
                            <button class="btn-cancelar" 
                                    onclick="cancelarPedido(${pedido.idPedidoCliente}, this)"
                                    title="Cancelar este pedido">
                                <span class="btn-icon">❌</span>
                                <span class="btn-text">Cancelar Pedido</span>
                            </button>
                        </div>
                    ` : ''}
                    
                    ${pedido.estatus === 'Cancelado' ? `
                        <div class="pedido-cancelado-info">
                            <span class="cancelado-icon">🚫</span>
                            <span>Este pedido ha sido cancelado</span>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
        
        // Configurar eventos para los acordeones de detalles
        configurarAcordeones();
        
        // Mostrar la lista
        noPedidos.classList.add('hidden');
        pedidosLista.classList.remove('hidden');
        
        console.log('✅ Lista de pedidos renderizada');
    }
    
    function configurarAcordeones() {
        const detalles = document.querySelectorAll('.pedido-detalles');
        detalles.forEach(detalle => {
            const toggle = detalle.querySelector('.detalles-toggle');
            if (toggle) {
                detalle.addEventListener('toggle', function() {
                    toggle.textContent = this.open ? '▲' : '▼';
                });
            }
        });
    }
    
    // ========== FUNCIONES GLOBALES (accesibles desde HTML) ==========
    
    /**
     * Cancelar un pedido específico
     * @param {number} idPedido - ID del pedido a cancelar
     * @param {HTMLElement} botonElement - Elemento del botón que disparó la acción
     */
    window.cancelarPedido = async function(idPedido, botonElement) {
        console.log(`🔄 Intentando cancelar pedido #${idPedido}`);
        
        // Obtener información del pedido para el mensaje de confirmación
        const pedidoCard = botonElement.closest('.pedido-card');
        const total = pedidoCard ? pedidoCard.querySelector('.info-value')?.textContent : '';
        
        // Mostrar diálogo de confirmación
        const confirmacion = confirm(
            `¿Estás seguro de que quieres cancelar este pedido?\n\n` +
            `Total: ${total}\n\n` +
            `Esta acción no se puede deshacer.`
        );
        
        if (!confirmacion) {
            console.log('❌ Cancelación cancelada por el usuario');
            return;
        }
        
        // Opcional: Pedir motivo de cancelación
        const motivo = prompt(
            '¿Podrías indicarnos brevemente el motivo de la cancelación?\n' +
            '(Esta información nos ayuda a mejorar nuestro servicio)',
            ''
        );
        
        if (motivo === null) {
            console.log('❌ Cancelación cancelada por el usuario (sin motivo)');
            return;
        }
        
        try {
            // Deshabilitar botón mientras se procesa
            if (botonElement) {
                botonElement.disabled = true;
                botonElement.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Cancelando...</span>';
                botonElement.classList.add('procesando');
            }
            
            console.log(`📤 Enviando solicitud de cancelación para pedido #${idPedido}`);
            
            // Llamar a la API para cancelar
            const resultado = await api.cancelarPedido(idPedido);
            
            console.log('✅ Respuesta de cancelación:', resultado);
            
            if (resultado) {
                mostrarMensaje('✅ Pedido cancelado exitosamente', 'success');
                
                // Agregar animación de eliminación
                if (pedidoCard) {
                    pedidoCard.style.transition = 'all 0.5s ease';
                    pedidoCard.style.opacity = '0.5';
                    pedidoCard.style.transform = 'scale(0.98)';
                    
                    setTimeout(() => {
                        pedidoCard.style.maxHeight = '0';
                        pedidoCard.style.padding = '0';
                        pedidoCard.style.margin = '0';
                        pedidoCard.style.overflow = 'hidden';
                    }, 300);
                }
                
                // Recargar la lista de pedidos después de 1.5 segundos
                setTimeout(() => {
                    cargarMisPedidos();
                }, 1500);
                
            } else {
                throw new Error('No se recibió respuesta del servidor');
            }
            
        } catch (error) {
            console.error('❌ Error cancelando pedido:', error);
            
            let mensajeError = 'Error al cancelar el pedido';
            if (error.message.includes('entregado')) {
                mensajeError = 'No se puede cancelar un pedido ya entregado';
            } else if (error.message.includes('cancelado')) {
                mensajeError = 'El pedido ya está cancelado';
            } else if (error.message.includes('anticipación')) {
                mensajeError = 'Los pedidos especiales no se pueden cancelar con menos de 2 días de anticipación';
            } else {
                mensajeError = `Error: ${error.message}`;
            }
            
            mostrarMensaje(mensajeError, 'error');
            
            // Rehabilitar botón si hay error
            if (botonElement) {
                botonElement.disabled = false;
                botonElement.innerHTML = '<span class="btn-icon">❌</span><span class="btn-text">Cancelar Pedido</span>';
                botonElement.classList.remove('procesando');
            }
        }
    };
    
    /**
     * Función para recargar la lista de pedidos
     * Puede ser llamada desde la consola si es necesario
     */
    window.recargarPedidos = function() {
        cargarMisPedidos();
    };
    
    /**
     * Función para exportar pedidos (opcional, para futuro)
     */
    window.exportarPedidos = function() {
        console.log('📤 Función de exportación de pedidos');
        // Implementación futura para exportar a PDF o Excel
        mostrarMensaje('Función de exportación en desarrollo', 'info');
    };
    
    console.log('✅ mis-pedidos.js inicializado correctamente');
});

// ========== FUNCIONES AUXILIARES ==========

/**
 * Mostrar mensaje emergente al usuario
 * @param {string} mensaje - Texto del mensaje
 * @param {string} tipo - Tipo de mensaje: 'success', 'error', 'info', 'warning'
 */
function mostrarMensaje(mensaje, tipo = 'info') {
    // Remover mensajes anteriores del mismo tipo
    const mensajesAnteriores = document.querySelectorAll(`.mensaje.mensaje-${tipo}`);
    mensajesAnteriores.forEach(m => {
        m.style.animation = 'fadeOut 0.3s';
        setTimeout(() => m.remove(), 300);
    });
    
    // Crear nuevo mensaje
    const mensajeDiv = document.createElement('div');
    mensajeDiv.className = `mensaje mensaje-${tipo}`;
    mensajeDiv.textContent = mensaje;
    
    // Estilos según tipo
    const estilos = {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '8px',
        color: 'white',
        zIndex: '10000',
        fontWeight: 'bold',
        fontSize: '14px',
        maxWidth: '350px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        animation: 'fadeIn 0.3s',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    };
    
    // Color de fondo según tipo
    switch(tipo) {
        case 'success':
            estilos.background = 'linear-gradient(135deg, #28a745, #20c997)';
            estilos.borderLeft = '4px solid #1e7e34';
            break;
        case 'error':
            estilos.background = 'linear-gradient(135deg, #dc3545, #e83e8c)';
            estilos.borderLeft = '4px solid #bd2130';
            break;
        case 'warning':
            estilos.background = 'linear-gradient(135deg, #ffc107, #fd7e14)';
            estilos.borderLeft = '4px solid #d39e00';
            break;
        default: // info
            estilos.background = 'linear-gradient(135deg, #17a2b8, #20c997)';
            estilos.borderLeft = '4px solid #138496';
    }
    
    // Aplicar estilos
    Object.assign(mensajeDiv.style, estilos);
    
    // Agregar ícono según tipo
    const icono = document.createElement('span');
    switch(tipo) {
        case 'success': icono.textContent = '✅'; break;
        case 'error': icono.textContent = '❌'; break;
        case 'warning': icono.textContent = '⚠️'; break;
        default: icono.textContent = 'ℹ️';
    }
    mensajeDiv.prepend(icono);
    
    // Agregar botón de cerrar
    const cerrarBtn = document.createElement('button');
    cerrarBtn.textContent = '×';
    cerrarBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        margin-left: auto;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.8;
    `;
    cerrarBtn.addEventListener('click', () => {
        mensajeDiv.style.animation = 'fadeOut 0.3s';
        setTimeout(() => mensajeDiv.remove(), 300);
    });
    
    mensajeDiv.appendChild(cerrarBtn);
    document.body.appendChild(mensajeDiv);
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        if (mensajeDiv.parentNode) {
            mensajeDiv.style.animation = 'fadeOut 0.3s';
            setTimeout(() => mensajeDiv.remove(), 300);
        }
    }, 5000);
}

// Agregar animaciones CSS si no existen
if (!document.querySelector('#animations-css')) {
    const style = document.createElement('style');
    style.id = 'animations-css';
    style.textContent = `
        @keyframes fadeIn {
            from { 
                opacity: 0; 
                transform: translateY(-20px) translateX(20px); 
            }
            to { 
                opacity: 1; 
                transform: translateY(0) translateX(0); 
            }
        }
        
        @keyframes fadeOut {
            from { 
                opacity: 1; 
                transform: translateY(0) translateX(0); 
            }
            to { 
                opacity: 0; 
                transform: translateY(-20px) translateX(20px); 
            }
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        .btn-cancelar.procesando {
            animation: pulse 1.5s infinite;
        }
    `;
    document.head.appendChild(style);
}

// Inicialización global
console.log('🚀 mis-pedidos.js listo para usar');