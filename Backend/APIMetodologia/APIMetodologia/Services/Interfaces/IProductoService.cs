using APIMetodologia.Models.Entities;

namespace APIMetodologia.Services.Interfaces
{
    public interface IProductoService
    {
        Task<List<Producto>> ObtenerTodosLosProductos();
        Task<Producto?> ObtenerProductoPorId(int id);
        Task<List<CategoriaProducto>> ObtenerTodasLasCategorias();
        Task<List<Producto>> ObtenerProductosPorCategoria(int categoriaId);
    }
}