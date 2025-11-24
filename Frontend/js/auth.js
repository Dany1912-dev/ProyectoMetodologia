document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registroForm = document.getElementById('registroForm');
    const registroLink = document.getElementById('registroLink');
    const registroSection = document.getElementById('registroSection');

    // Mostrar/ocultar formulario de registro
    registroLink.addEventListener('click', function(e) {
        e.preventDefault();
        registroSection.classList.toggle('hidden');
    });

    // Login
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
    
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const resultado = await api.login(email, password);
            
            if (resultado.exito) {
                api.setToken(resultado.token);
                localStorage.setItem('userInfo', JSON.stringify(resultado.usuario));
                mostrarMensaje('¡Bienvenido! Redirigiendo al catálogo...', 'success');
                
                setTimeout(() => {
                    window.location.href = 'catalogo.html';
                }, 1500);
                
            } else {
                let mensajeError = 'Error al iniciar sesión';
                if (resultado.mensaje.includes('incorrectos')) {
                    mensajeError = 'Email o contraseña incorrectos';
                } else if (resultado.mensaje.includes('encontró')) {
                    mensajeError = 'Usuario no encontrado';
                }
                mostrarMensaje(mensajeError, 'error');
            }
        } catch (error) {
            let mensajeError = 'Error de conexión';
            if (error.message.includes('Failed to fetch')) {
                mensajeError = 'No se pudo conectar al servidor. Verifica que la API esté ejecutándose.';
            } else if (error.message.includes('404')) {
                mensajeError = 'Servicio no disponible';
            } else {
                mensajeError = error.message;
            }
            mostrarMensaje(mensajeError, 'error');
        }
    });

    // Registro
    registroForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const datosRegistro = {
            nombre: document.getElementById('regNombre').value,
            apellido1: document.getElementById('regApellido1').value,
            apellido2: document.getElementById('regApellido2').value,
            email: document.getElementById('regEmail').value,
            password: document.getElementById('regPassword').value,
            telefono: document.getElementById('regTelefono').value,
            calle: "Por definir",
            colonia: "Por definir",
            codigoPostal: "00000"
        };

        if (datosRegistro.password.length < 6) {
            mostrarMensaje('La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }

        if (!isValidEmail(datosRegistro.email)) {
            mostrarMensaje('Formato de email inválido', 'error');
            return;
        }

        try {
            const resultado = await api.registro(datosRegistro);
            
            if (resultado.exito) {
                mostrarMensaje('¡Registro exitoso! Ahora puedes iniciar sesión.', 'success');
                registroForm.reset();
                registroSection.classList.add('hidden');
            } else {
                let mensajeError = 'Error en el registro';
                if (resultado.mensaje.includes('email')) {
                    mensajeError = 'El email ya está registrado o es inválido';
                } else if (resultado.mensaje.includes('contraseña')) {
                    mensajeError = 'La contraseña no cumple los requisitos';
                }
                mostrarMensaje(mensajeError, 'error');
            }
        } catch (error) {
            mostrarMensaje('Error de conexión: ' + error.message, 'error');
        }
    });

    // Verificar si ya está logueado
    if (api.token && window.location.pathname.endsWith('index.html')) {
        window.location.href = 'catalogo.html';
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function mostrarMensaje(mensaje, tipo = 'info') {
        const mensajeDiv = document.createElement('div');
        mensajeDiv.className = `mensaje mensaje-${tipo}`;
        mensajeDiv.textContent = mensaje;
        
        mensajeDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            z-index: 1000;
            font-weight: bold;
            max-width: 300px;
            ${tipo === 'success' ? 'background: #28a745;' : ''}
            ${tipo === 'error' ? 'background: #dc3545;' : ''}
            ${tipo === 'info' ? 'background: #17a2b8;' : ''}
        `;
        
        document.body.appendChild(mensajeDiv);
        
        setTimeout(() => {
            mensajeDiv.remove();
        }, 4000);
    }
});