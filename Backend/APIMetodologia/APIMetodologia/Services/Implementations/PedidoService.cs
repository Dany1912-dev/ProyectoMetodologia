using APIMetodologia.Data;
using APIMetodologia.Models.Entities;
using APIMetodologia.Models.Request;
using APIMetodologia.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace APIMetodologia.Services.Implementations
{
    public class PedidoService : IPedidoService
    {
        private readonly AppDbContext _context;

        public PedidoService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PedidoCliente> RegistrarPedido(RegistrarPedidoManualRequest request)
        {
            if (request.EsPedidoEspecial)
            {
                if (!request.FechaEntregaEspecial.HasValue)
                {
                    throw new Exception("Los pedidos especiales requieren una fecha de entrega");
                }
                DateTime fechaEntrega = request.FechaEntregaEspecial.Value;
                var fechaAnticipacion = (fechaEntrega.Date - DateTime.Now.Date).Days;

                if (fechaAnticipacion < 3)
                {
                    throw new Exception("Los pedidos especiales requieren al menos 3 dias de anticipacion");
                }
            }

            var idProductos = request.Productos.Select(p => p.IdProducto).ToList();
            var productosDb = await _context.Productos
                .Where(p => idProductos.Contains(p.IdProducto))
                .ToDictionaryAsync(p => p.IdProducto, p => p);

            decimal totalPedido = 0;
            var detalles = new List<DetallePedidoCliente>();

            foreach (var item in request.Productos)
            {
                if (productosDb.TryGetValue(item.IdProducto, out var producto))
                {
                    totalPedido += item.Cantidad * producto.Precio;
                    detalles.Add(new DetallePedidoCliente
                    {
                        IdProducto = item.IdProducto,
                        Cantidad = item.Cantidad,
                        PrecioUnitario = producto.Precio
                    });
                }
            }

            var pedido = new PedidoCliente
            {
                IdUsuario = request.IdUsuario,
                FechaPedido = DateTime.Now,
                Estatus = "Pendiente",
                Total = totalPedido,
                Notas = request.Notas,
                EsPedidoEspecial = request.EsPedidoEspecial,
                FechaEntregaEspecial = request.FechaEntregaEspecial
            };

            _context.PedidosClientes.Add(pedido);
            await _context.SaveChangesAsync();

            detalles.ForEach(d => d.IdPedidoCliente = pedido.IdPedidoCliente);
            _context.DetallesPedidosClientes.AddRange(detalles);
            await _context.SaveChangesAsync();

            NotificadorSocket.EnviarNotificacion("Nuevo Pedido", $"Se ha registrado el pedido #{pedido.IdPedidoCliente} automáticamente.");

            pedido.DetallesPedido = detalles;

            return pedido;
        }

        public async Task<List<PedidoCliente>> ObtenerPedidosActivos()
        {
            var estatusActivos = new List<string> { "Pendiente", "En Proceso", "Completado", "Cancelado" };

            return await _context.PedidosClientes
                .Include(p => p.DetallesPedido)
                .Include(p => p.Usuario)
                .Where(p => estatusActivos.Contains(p.Estatus))
                .OrderByDescending(p => p.FechaPedido)
                .ToListAsync();
        }

        public async Task<PedidoCliente?> ActualizarEstatusPedido(int idPedido, string nuevoEstatus)
        {
            var pedido = await _context.PedidosClientes.FindAsync(idPedido);

            if (pedido == null) return null;

            pedido.Estatus = nuevoEstatus;
            await _context.SaveChangesAsync();

            return pedido;
        }

        public async Task<PedidoCliente?> ObtenerPedidoPorId(int idPedido)
        {
            return await _context.PedidosClientes
                .Include(p => p.DetallesPedido)
                .Include(p => p.Usuario)
                .FirstOrDefaultAsync(p => p.IdPedidoCliente == idPedido);
        }

        public async Task<List<PedidoCliente>> ObtenerPedidosPorCliente(int clienteId)
        {
            return await _context.PedidosClientes
                .Include(p => p.DetallesPedido!)
                .ThenInclude(d => d.Producto!) // Para nombre del producto
                .Where(p => p.IdUsuario == clienteId)
                .OrderByDescending(p => p.FechaPedido) // Más recientes primero
                .ToListAsync();
        }
    }
}
