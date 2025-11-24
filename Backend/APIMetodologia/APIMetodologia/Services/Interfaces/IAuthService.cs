using APIMetodologia.Models.Request;
using APIMetodologia.Models.Responses;

namespace APIMetodologia.Services.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponse> RegistrarCliente(RegistroClienteRequest request);
        Task<AuthResponse> LoginCliente(LoginRequest request);
        Task<bool> EmailExiste(string email);
    }
}
