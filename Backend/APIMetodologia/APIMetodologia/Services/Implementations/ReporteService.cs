using APIMetodologia.Data;
using APIMetodologia.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;
using System.Linq;

namespace APIMetodologia.Services.Implementations
{
    public class ReporteService : IReporteService
    {
        private readonly AppDbContext _context;

        public ReporteService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<decimal> ObtenerReporteVentasDiarias()
        {
            var hace24horas = DateTime.Now.AddHours(-24);
            var totalVentas = await _context.PedidosClientes
                .Where(p => p.Estatus == "Completado" && p.FechaPedido >= hace24horas)
                .SumAsync(p => p.Total);
            return totalVentas;
        }
    }
}
