// Services/Implementations/UsuarioService.cs
using Microsoft.EntityFrameworkCore;
using APIMetodologia.Data;
using APIMetodologia.Models.Entities;
using APIMetodologia.Models.Request;
using APIMetodologia.Models.Response;
using APIMetodologia.Services.Interfaces;

namespace APIMetodologia.Services.Implementations
{
    public class UsuarioService : IUsuarioService
    {
        private readonly AppDbContext _context;

        public UsuarioService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<UsuarioPerfilResponse> ObtenerPerfil(int usuarioId)
        {
            var usuario = await _context.Usuarios
                .Include(u => u.TipoUsuario)
                .Include(u => u.Direccion)
                    .ThenInclude(d => d.Ciudad)
                        .ThenInclude(c => c.Estado)
                            .ThenInclude(e => e.Pais)
                .FirstOrDefaultAsync(u => u.IdUsuario == usuarioId && u.Estatus == 'A');

            if (usuario == null)
                throw new Exception("Usuario no encontrado");

            // Obtener estadísticas
            var estadisticas = await ObtenerEstadisticas(usuarioId);

            return new UsuarioPerfilResponse
            {
                IdUsuario = usuario.IdUsuario,
                Nombre = usuario.Nombre,
                Apellido1 = usuario.Apellido1,
                Apellido2 = usuario.Apellido2,
                Email = usuario.Email,
                Telefono = usuario.Telefono,
                TipoUsuario = usuario.TipoUsuario?.Nombre ?? "Cliente",
                Direccion = usuario.Direccion != null ? new DireccionInfo
                {
                    Calle = usuario.Direccion.Calle,
                    NumeroExterior = usuario.Direccion.NumeroExterior?.ToString(),
                    NumeroInterior = usuario.Direccion.NumeroInterior?.ToString(),
                    Colonia = usuario.Direccion.Colonia,
                    CodigoPostal = usuario.Direccion.CodigoPostal.ToString(),
                    Referencias = usuario.Direccion.Referencias,
                    Ciudad = usuario.Direccion.Ciudad?.Nombre ?? "No especificada",
                    Estado = usuario.Direccion.Ciudad?.Estado?.Nombre ?? "No especificado",
                    Pais = usuario.Direccion.Ciudad?.Estado?.Pais?.Nombre ?? "No especificado"
                } : null,
                Estadisticas = estadisticas
            };
        }

        public async Task<Usuario> ActualizarPerfil(int usuarioId, ActualizarPerfilRequest request)
        {
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.IdUsuario == usuarioId && u.Estatus == 'A');

            if (usuario == null)
                throw new Exception("Usuario no encontrado");

            // Actualizar campos
            usuario.Nombre = request.Nombre?.Trim() ?? usuario.Nombre;
            usuario.Apellido1 = request.Apellido1?.Trim() ?? usuario.Apellido1;
            usuario.Apellido2 = request.Apellido2?.Trim();
            usuario.Telefono = request.Telefono?.Trim() ?? usuario.Telefono;

            await _context.SaveChangesAsync();
            return usuario;
        }

        public async Task<Direccion> ActualizarDireccion(int usuarioId, ActualizarDireccionRequest request)
        {
            var usuario = await _context.Usuarios
                .Include(u => u.Direccion)
                .FirstOrDefaultAsync(u => u.IdUsuario == usuarioId && u.Estatus == 'A');

            if (usuario == null)
                throw new Exception("Usuario no encontrado");

            // Si el usuario no tiene dirección, crear una nueva
            if (usuario.Direccion == null)
            {
                var nuevaDireccion = new Direccion
                {
                    Calle = request.Calle?.Trim(),
                    NumeroExterior = int.TryParse(request.NumeroExterior, out int numExt) ? numExt : null,
                    NumeroInterior = int.TryParse(request.NumeroInterior, out int numInt) ? numInt : null,
                    Colonia = request.Colonia?.Trim(),
                    CodigoPostal = int.TryParse(request.CodigoPostal, out int cp) ? cp : 0,
                    Referencias = request.Referencias?.Trim(),
                    IdCiudad = request.IdCiudad
                };

                _context.Direcciones.Add(nuevaDireccion);
                await _context.SaveChangesAsync();

                usuario.IdDireccion = nuevaDireccion.IdDireccion;
                await _context.SaveChangesAsync();

                return nuevaDireccion;
            }
            else
            {
                // Actualizar dirección existente
                usuario.Direccion.Calle = request.Calle?.Trim() ?? usuario.Direccion.Calle;
                usuario.Direccion.NumeroExterior = int.TryParse(request.NumeroExterior, out int numExt) ? numExt : usuario.Direccion.NumeroExterior;
                usuario.Direccion.NumeroInterior = int.TryParse(request.NumeroInterior, out int numInt) ? numInt : usuario.Direccion.NumeroInterior;
                usuario.Direccion.Colonia = request.Colonia?.Trim() ?? usuario.Direccion.Colonia;
                usuario.Direccion.CodigoPostal = int.TryParse(request.CodigoPostal, out int cp) ? cp : usuario.Direccion.CodigoPostal;
                usuario.Direccion.Referencias = request.Referencias?.Trim() ?? usuario.Direccion.Referencias;
                usuario.Direccion.IdCiudad = request.IdCiudad;

                await _context.SaveChangesAsync();
                return usuario.Direccion;
            }
        }

        public async Task<bool> CambiarPassword(int usuarioId, CambiarPasswordRequest request)
        {
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.IdUsuario == usuarioId && u.Estatus == 'A');

            if (usuario == null)
                throw new Exception("Usuario no encontrado");

            // Verificar contraseña actual
            if (!BCrypt.Net.BCrypt.Verify(request.PasswordActual, usuario.Pass))
                throw new Exception("La contraseña actual es incorrecta");

            // Validar nueva contraseña
            if (string.IsNullOrWhiteSpace(request.NuevaPassword) || request.NuevaPassword.Length < 6)
                throw new Exception("La nueva contraseña debe tener al menos 6 caracteres");

            // Actualizar contraseña
            usuario.Pass = BCrypt.Net.BCrypt.HashPassword(request.NuevaPassword);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<EstadisticasUsuario> ObtenerEstadisticas(int usuarioId)
        {
            var pedidos = await _context.PedidosClientes
                .Where(p => p.IdUsuario == usuarioId)
                .ToListAsync();

            var totalPedidos = pedidos.Count;
            var pedidosActivos = pedidos.Count(p => p.Estatus == "Pendiente" || p.Estatus == "En Proceso");
            var pedidosEspeciales = pedidos.Count(p => p.EsPedidoEspecial);
            var totalGastado = pedidos.Sum(p => p.Total);
            var promedioPorPedido = totalPedidos > 0 ? totalGastado / totalPedidos : 0;
            var primerPedido = pedidos.Any() ? pedidos.Min(p => p.FechaPedido) : (DateTime?)null;

            return new EstadisticasUsuario
            {
                TotalPedidos = totalPedidos,
                PedidosActivos = pedidosActivos,
                PedidosEspeciales = pedidosEspeciales,
                TotalGastado = totalGastado,
                PromedioPorPedido = promedioPorPedido,
                PrimerPedido = primerPedido
            };
        }
    }
}