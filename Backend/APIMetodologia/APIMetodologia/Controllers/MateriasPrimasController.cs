using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using APIMetodologia.Models.Entities;
using APIMetodologia.Services.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace APIMetodologia.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MateriasPrimasController
    {
        private readonly IMateriaPrimaService _materiaPrimaService;

        public MateriasPrimasController(IMateriaPrimaService materiaPrimaService)
        {
            _materiaPrimaService = materiaPrimaService;
        }

        [HttpGet]
        public async Task<IActionResult> ObtenerTodasLasMateriasPrimas()
        {
            var materiasPrimas = await _materiaPrimaService.ObtenerTodasMateriasPrimas();
            return new OkObjectResult(materiasPrimas);
        }

        [HttpPost]
        public async Task<IActionResult> CrearMateriaPrima([FromBody] MateriaPrima nuevaMateriaPrima)
        {
            var materiaCreada = await _materiaPrimaService.CrearMateriaPrima(nuevaMateriaPrima);
            return new CreatedAtActionResult(nameof(ObtenerTodasLasMateriasPrimas), "MateriasPrimas", new { id = materiaCreada.IdMateriaPrima }, materiaCreada);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerMateriaPrimaPorId(int id)
        {
            var materiaPrima = await _materiaPrimaService.ObtenerMateriaPrimaPorId(id);
            if (materiaPrima == null)
            {
                return new NotFoundResult();
            }
            return new OkObjectResult(materiaPrima);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> ActualizarMateriaPrima(int id, [FromBody] MateriaPrima materiaPrimaActualizada)
        {
            if (id != materiaPrimaActualizada.IdMateriaPrima)
            {
                return new BadRequestResult();
            }
            var materiaActualizada = await _materiaPrimaService.ActualizarMateriaPrima(materiaPrimaActualizada);
            if (materiaActualizada == null)
            {
                return new NotFoundResult();
            }
            return new OkObjectResult(materiaActualizada);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarMateriaPrima(int id)
        {
            var resultado = await _materiaPrimaService.EliminarMateriaPrima(id);
            if (!resultado)
            {
                return new NotFoundResult();
            }
            return new NoContentResult();
        }

        [HttpGet("stock-bajo/{umbral}")]
        public async Task<IActionResult> ObtenerMateriasPrimasConStockBajo(int umbral = 10)
        {
            var materiasPrimas = await _materiaPrimaService.ObtenerMateriasPrimasConStockBajo(umbral);
            return new OkObjectResult(materiasPrimas);
        }
    }
}
