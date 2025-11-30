using APIMetodologia.Data;
using APIMetodologia.Models.Entities;
using APIMetodologia.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace APIMetodologia.Services.Implementations
{
    public class MateriaPrimaService : IMateriaPrimaService
    {
        private readonly AppDbContext _context;

        public MateriaPrimaService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<MateriaPrima>> ObtenerTodasMateriasPrimas()
        {
            return await _context.MateriasPrimas
                .Include(mp => mp.Proveedor)
                .ToListAsync();
        }

        public async Task<MateriaPrima?> ObtenerMateriaPrimaPorId(int id)
        {
            return await _context.MateriasPrimas
                .Include(mp => mp.Proveedor)
                .FirstOrDefaultAsync(mp => mp.IdMateriaPrima == id);
        }

        public async Task<MateriaPrima> CrearMateriaPrima(MateriaPrima nuevaMateria)
        {
            _context.MateriasPrimas.Add(nuevaMateria);
            await _context.SaveChangesAsync();
            return nuevaMateria;
        }

        public async Task<MateriaPrima?> ActualizarMateriaPrima(MateriaPrima materiaActualizada)
        {
            var materiaExistente = await _context.MateriasPrimas.FindAsync(materiaActualizada.IdMateriaPrima);

            if (materiaExistente == null) return null;

            materiaExistente.Nombre = materiaActualizada.Nombre;
            materiaExistente.Descripcion = materiaActualizada.Descripcion;
            materiaExistente.UnidadDeMedida = materiaActualizada.UnidadDeMedida;
            materiaExistente.StockActual = materiaActualizada.StockActual;
            materiaExistente.IdProveedor = materiaActualizada.IdProveedor;

            await _context.SaveChangesAsync();
            return materiaExistente;
        }

        public async Task<bool> EliminarMateriaPrima(int id)
        {
            var materia = await _context.MateriasPrimas.FindAsync(id);
            if (materia == null) return false;

            _context.MateriasPrimas.Remove(materia);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<MateriaPrima>> ObtenerMateriasPrimasConStockBajo(int umbral = 10)
        {
            return await _context.MateriasPrimas
                .Include(mp => mp.Proveedor)
                .Where(mp => mp.StockActual <= umbral)
                .ToListAsync();
        }
    }
}