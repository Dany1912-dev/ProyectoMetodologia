using Microsoft.EntityFrameworkCore;
using APIMetodologia.Data;
using APIMetodologia.Models.Entities;
using APIMetodologia.Services.Interfaces;

namespace APIMetodologia.Services.Implementations
{
    public class ProductoService : IProductoService
    {
        private readonly AppDbContext _context;

        public ProductoService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Producto>> ObtenerTodosLosProductos()
        {
            return await _context.Productos
                .Include(p => p.Categoria)
                .Where(p => p.Precio > 0) // Solo productos activos
                .ToListAsync();
        }

        public async Task<Producto?> ObtenerProductoPorId(int id)
        {
            return await _context.Productos
                .Include(p => p.Categoria)
                .FirstOrDefaultAsync(p => p.IdProducto == id);
        }

        public async Task<List<CategoriaProducto>> ObtenerTodasLasCategorias()
        {
            return await _context.CategoriasProductos.ToListAsync();
        }

        public async Task<List<Producto>> ObtenerProductosPorCategoria(int categoriaId)
        {
            return await _context.Productos
                .Include(p => p.Categoria)
                .Where(p => p.IdCategoria == categoriaId)
                .ToListAsync();
        }
    }
}