using APIMetodologia.Models.Entities;
using APIMetodologia.Models.Request;

namespace APIMetodologia.Services.Interfaces
{
    public interface IPedidoService
    {
        Task<PedidoCliente> RegistrarPedido(RegistrarPedidoManualRequest request);
        Task<List<PedidoCliente>> ObtenerPedidosActivos();
        Task<PedidoCliente?> ActualizarEstatusPedido(int idPedido, string nuevoEstatus);
        Task<PedidoCliente?> ObtenerPedidoPorId(int idPedido);
        Task<List<PedidoCliente>> ObtenerPedidosPorCliente(int clienteId);
    }
}
