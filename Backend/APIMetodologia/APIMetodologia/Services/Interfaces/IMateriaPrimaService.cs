using APIMetodologia.Models.Entities;
namespace APIMetodologia.Services.Interfaces
{
    public interface IMateriaPrimaService
    {
        Task<List<MateriaPrima>> ObtenerTodasMateriasPrimas();
        Task<MateriaPrima?> ObtenerMateriaPrimaPorId(int id);
        Task<MateriaPrima> CrearMateriaPrima(MateriaPrima nuevaMateriaPrima);
        Task<MateriaPrima?> ActualizarMateriaPrima(MateriaPrima materiaPrimaActualizada);
        Task<bool> EliminarMateriaPrima(int id);

        Task<List<MateriaPrima>> ObtenerMateriasPrimasConStockBajo(int umbral = 10);
    }
}
