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

        public async Task<PedidoCliente> RegistrarPedidoManual(RegistrarPedidoManualRequest request)
        {
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
                Total = totalPedido
            };

            _context.PedidosClientes.Add(pedido);
            await _context.SaveChangesAsync();

            detalles.ForEach(d => d.IdPedidoCliente = pedido.IdPedidoCliente);
            _context.DetallesPedidosClientes.AddRange(detalles);
            await _context.SaveChangesAsync();

            pedido.DetallesPedido = detalles;

            return pedido;
        }

        public async Task<List<PedidoCliente>> ObtenerPedidosActivos()
        {
            var estatusActivos = new List<string> { "Pendiente", "En Proceso", "Listos" };

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
    }
}
