using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using APIMetodologia.Models.Request;
using APIMetodologia.Services.Interfaces;
using System.Threading.Tasks;
using System;
using System.Linq;

namespace APIMetodologia.Controllers
{
    [Authorize(Roles = "Administrador, Empleado")]
    [ApiController]
    [Route("api/[controller]")]
    public class PedidosController : ControllerBase
    {
        private readonly IPedidoService _pedidoService;

        public PedidosController(IPedidoService pedidoService)
        {
            _pedidoService = pedidoService;
        }

        [HttpPost("manual")]
        public async Task<IActionResult> RegistrarPedidoManual([FromBody] RegistrarPedidoManualRequest request)
        {
            try
            {
                var pedido = await _pedidoService.RegistrarPedidoManual(request);
                return Ok(pedido);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
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
    }
}
