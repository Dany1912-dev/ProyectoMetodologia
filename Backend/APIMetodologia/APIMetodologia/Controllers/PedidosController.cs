using APIMetodologia.Models.Request;
using APIMetodologia.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace APIMetodologia.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PedidosController : ControllerBase
    {
        private readonly IPedidoService _pedidoService;

        public PedidosController(IPedidoService pedidoService)
        {
            _pedidoService = pedidoService;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> RegistrarPedido([FromBody] RegistrarPedidoManualRequest request)
        {
            try
            {
                var usuarioID = ObtenerUsuarioIdDeToken();
                request.IdUsuario = usuarioID;

                var pedido = await _pedidoService.RegistrarPedido(request);

                return Ok(new
                {
                    Exito = true,
                    IdPedido = pedido.IdPedidoCliente,
                    Total = pedido.Total,
                    Fecha = pedido.FechaPedido,
                    EsPedidoEspecial = pedido.EsPedidoEspecial,
                    FechaEntregaEspecial = pedido.FechaEntregaEspecial,
                    Mensaje = pedido.EsPedidoEspecial ? "Pedido Especial creado exitosamente" : "Pedido creado exitosamente"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("mis-pedidos")]
        [Authorize]
        public async Task<IActionResult> ObtenerMisPedidos()
        {
            try
            {
                var clienteId = ObtenerUsuarioIdDeToken();
                var pedidos = await _pedidoService.ObtenerPedidosPorCliente(clienteId);

                return Ok(new
                {
                    Exito = true,
                    Pedidos = pedidos.Select(p => new
                    {
                        p.IdPedidoCliente,
                        p.FechaPedido,
                        p.Total,
                        p.Estatus,
                        p.EsPedidoEspecial,
                        p.FechaEntregaEspecial,
                        p.Notas,
                        Productos = p.DetallesPedido?.Select(d => new
                        {
                            d.IdProducto,
                            d.Cantidad,
                            d.PrecioUnitario,
                            ProductoNombre = d.Producto?.Nombre
                        })
                    })
                });
            } 
            catch (Exception ex)
            {
                return StatusCode(500, new {Exito = false, mensaje = ex.Message});
            }
        }

        [HttpGet("activos")]
        public async Task<IActionResult> ObtenerPedidosActivos()
        {
            var pedidos = await _pedidoService.ObtenerPedidosActivos();
            return Ok(pedidos);
        }

        [HttpPut("{idPedido}/estatus/{nuevoEstatus}")]
        public async Task<IActionResult> ActualizarEstatusPedido(int idPedido, string nuevoEstatus)
        {
            if (string.IsNullOrWhiteSpace(nuevoEstatus))
            {
                return BadRequest(new { message = "El nuevo estatus no puede estar vacío." });
            }

            var pedido = await _pedidoService.ActualizarEstatusPedido(idPedido, nuevoEstatus);

            if (pedido == null)
            {
                return NotFound(new { message = "Pedido no encontrado." });
            }

            return Ok(pedido);
        }

        [HttpGet("{idPedido}")]
        [ApiExplorerSettings(IgnoreApi = true)]
        public async Task<IActionResult> ObtenerPedidoPorId(int idPedido)
        {
            var pedido = await _pedidoService.ObtenerPedidoPorId(idPedido);
            if (pedido == null)
            {
                return NotFound(new { message = "Pedido no encontrado." });
            }
            return Ok(pedido);
        }

        private int ObtenerUsuarioIdDeToken()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
            {
                throw new UnauthorizedAccessException("Usuario no autenticado");
            }

            return int.Parse(userIdClaim);
        }
    }
}
