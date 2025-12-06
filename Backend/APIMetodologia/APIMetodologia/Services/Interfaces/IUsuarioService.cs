using APIMetodologia.Models.Entities;
using APIMetodologia.Models.Request;
using APIMetodologia.Models.Response;

namespace APIMetodologia.Services.Interfaces
{
    public interface IUsuarioService
    {
        Task<UsuarioPerfilResponse> ObtenerPerfil(int usuarioId);
        Task<Usuario> ActualizarPerfil(int usuarioId, ActualizarPerfilRequest request);
        Task<Direccion> ActualizarDireccion(int usuarioId, ActualizarDireccionRequest request);
        Task<bool> CambiarPassword(int usuarioId, CambiarPasswordRequest request);
        Task<EstadisticasUsuario> ObtenerEstadisticas(int usuarioId);
    }
}
