# Sistema de Tienda — Proyecto escolar (Metodologías Ágiles)

> **Proyecto académico desarrollado en equipo de 3 personas** para la materia de Metodologías Ágiles, cursada al mismo tiempo que Lenguajes de Programación. Ambas materias se apoyaron mutuamente: en Lenguajes de Programación se aprendía la parte técnica (ASP.NET, EF, APIs), y en Metodologías Ágiles se practicaba la organización del trabajo en equipo con Kanban + Scrum.
>
> Yo me encargué de la API y de la página web. Un compañero construyó una aplicación de escritorio (Python/Tkinter) que se conectaba a la misma API para el lado del encargado del negocio. El tercer integrante contribuyó en el desarrollo. Ambos clientes, la web y el escritorio, comparten la misma API REST — eso era precisamente lo que queríamos practicar.

![ASP.NET Core](https://img.shields.io/badge/ASP.NET_Core-Web_API-512BD4?logo=dotnet&logoColor=white)
![JavaScript](https://img.shields.io/badge/Frontend-HTML%2FCSS%2FJS-F7DF1E?logo=javascript&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)
![Metodología](https://img.shields.io/badge/Metodología-Kanban%20%2B%20Scrum-0052CC)

---

## Contexto del equipo

| Integrante | Rol |
|------------|-----|
| Yo | API REST (ASP.NET) + página web del cliente (HTML/CSS/JS) |
| Compañero | App de escritorio (Python/Tkinter) para el encargado del negocio |
| Compañero | Colaboración en el desarrollo |

Los dos clientes, web y escritorio, hablan con la misma API. No hay documentación del proceso ágil en el repositorio — no llegó a formalizarse en código, fue algo que se manejó en Trello y de forma verbal entre el equipo.

---

## ¿Qué hace?

Un sistema de tienda con dos perspectivas:

**Para el cliente (página web):**
- Registro e inicio de sesión
- Catálogo de productos con filtro por categoría y búsqueda
- Carrito de compras con cantidad ajustable
- Pedidos normales y pedidos especiales (para eventos, con fecha de entrega mínima de 3 días)
- Historial de pedidos propios
- Gestión de perfil, dirección y contraseña

**Para el encargado (app de escritorio — otro repositorio):**
- Gestión de materias primas con alertas de stock bajo
- Vista de pedidos activos y actualización de estatus
- Reporte diario de ventas
- Notificaciones en tiempo real via socket TCP

---

## Estructura del proyecto

```
ProyectoMetodologia/
│
├── Backend/APIMetodologia/         # API REST — ASP.NET Core + MySQL + EF Core
│   └── APIMetodologia/
│       ├── Controllers/
│       │   ├── AuthController.cs           # Registro, login, verificar email
│       │   ├── ProductosController.cs      # Catálogo y categorías
│       │   ├── PedidosController.cs        # Crear pedido, mis pedidos, activos, estatus
│       │   ├── UsuarioController.cs        # Perfil, dirección, contraseña, estadísticas
│       │   ├── MateriasPrimasController.cs # CRUD inventario + alertas de stock bajo
│       │   └── AdminController.cs          # Reporte de ventas diarias
│       ├── Services/
│       │   ├── Interfaces/
│       │   └── Implementations/
│       ├── Models/
│       │   ├── Entities/                   # Usuario, Producto, PedidoCliente, MateriaPrima...
│       │   ├── Request/                    # LoginRequest, RegistroClienteRequest...
│       │   └── Responses/
│       ├── Data/
│       │   └── AppDbContext.cs
│       └── Services/
│           └── NotificadorSocket.cs        # Envía notificaciones TCP a la app de escritorio
│
└── Frontend/                       # Página web del cliente — HTML + CSS + JS vanilla
    ├── index.html                  # Login y registro
    ├── catalogo.html               # Catálogo + carrito + modal de producto
    ├── MisPedido.html              # Historial de pedidos del cliente
    ├── perfil.html                 # Gestión de perfil y dirección
    ├── js/
    │   ├── api.js                  # Clase APIClient: wrapper fetch con JWT en header
    │   ├── auth.js                 # Lógica de login/registro
    │   ├── carrito.js              # Catálogo, filtros, carrito y procesamiento de pedidos
    │   ├── CarritoManager.js       # Estado del carrito en localStorage
    │   ├── carrito-ui.js           # Renderizado del carrito
    │   ├── mis-pedidos.js          # Historial de pedidos
    │   ├── perfil.js               # Formularios de perfil y dirección
    │   └── utils.js                # Utilidades compartidas
    └── css/                        # Estilos por página
```

---

## Cómo funciona

### Autenticación

JWT en el header `Authorization: Bearer <token>`. El token se guarda en `localStorage` (en la web) y en memoria (en la app de escritorio). Al recibir un `401`, la web redirige al login automáticamente.

### Pedidos especiales

Cuando el cliente hace un pedido marcado como "especial" (para un evento), la API valida que la fecha de entrega tenga al menos 3 días de anticipación respecto al día actual. La web lo gestiona con un flujo de confirmación antes de enviar.

### Notificaciones via socket TCP

La API incluye `NotificadorSocket.cs` que abre una conexión TCP al puerto `65432` y envía un JSON cuando ocurre algún evento relevante. La app de escritorio del compañero tiene un servidor TCP en ese puerto escuchando en un hilo secundario para mostrar alertas en la interfaz.

---

## Requisitos

**Backend:**
- .NET 8+ SDK
- MySQL 8.0
- Cadena de conexión y clave JWT en `appsettings.json`

**Frontend:**
- Cualquier servidor web estático (Live Server de VS Code, por ejemplo)
- La API corriendo en `http://localhost:5000`

## Ejecución

```bash
# Backend
cd Backend/APIMetodologia
dotnet run

# Frontend
# Abrir index.html con Live Server o cualquier servidor estático
```

---

## Tecnologías

| Parte | Tecnología |
|-------|------------|
| API | ASP.NET Core Web API, Entity Framework Core, MySQL |
| Web (clientes) | HTML, CSS, JavaScript vanilla |
| App escritorio (compañero) | Python, Tkinter |
| Auth | JWT (Bearer token) |
| Notificaciones | Sockets TCP |
| Metodología | Kanban + Scrum |
