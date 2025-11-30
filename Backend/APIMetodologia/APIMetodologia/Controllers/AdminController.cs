using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using APIMetodologia.Services.Interfaces;
using System.Threading.Tasks;
using System;
using Microsoft.AspNetCore.Http.HttpResults;

namespace APIMetodologia.Controllers
{
    [Authorize(Roles = "Administrador, Empleado")]
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly IReporteService _reporteService;

        public AdminController(IReporteService reporteService)
        {
            _reporteService = reporteService;
        }

        [HttpGet("reporte/ventas-diarias")]
        public async Task<IActionResult> ObtenerReporteVentasDiarias()
        {
            var totaVentas = await _reporteService.ObtenerReporteVentasDiarias();
            return Ok(new
            {
                Exito = true,
                FechaCorte = DateTime.Now,
                Total24Horas = totaVentas
            });
        }
    }
}
