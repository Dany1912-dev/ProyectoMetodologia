using Microsoft.AspNetCore.Mvc;
using APIMetodologia.Models.Entities;
using APIMetodologia.Services.Interfaces;

namespace APIMetodologia.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductosController : ControllerBase
    {
        private readonly IProductoService _productoService;

        public ProductosController(IProductoService productoService)
        {
            _productoService = productoService;
        }

        [HttpGet]
        public async Task<IActionResult> ObtenerTodosLosProductos()
        {
            var productos = await _productoService.ObtenerTodosLosProductos();
            return Ok(productos);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerProductoPorId(int id)
        {
            var producto = await _productoService.ObtenerProductoPorId(id);

            if (producto == null)
                return NotFound($"Producto con ID {id} no encontrado");

            return Ok(producto);
        }

        [HttpGet("categorias")]
        public async Task<IActionResult> ObtenerTodasLasCategorias()
        {
            var categorias = await _productoService.ObtenerTodasLasCategorias();
            return Ok(categorias);
        }

        [HttpGet("categoria/{categoriaId}")]
        public async Task<IActionResult> ObtenerProductosPorCategoria(int categoriaId)
        {
            var productos = await _productoService.ObtenerProductosPorCategoria(categoriaId);
            return Ok(productos);
        }
    }
}