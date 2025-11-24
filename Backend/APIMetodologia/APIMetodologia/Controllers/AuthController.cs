using Microsoft.AspNetCore.Mvc;
using APIMetodologia.Models.Request;
using APIMetodologia.Services.Interfaces;
namespace APIMetodologia.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("registro")]
        public async Task<IActionResult> RegistrarCliente([FromBody] RegistroClienteRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var response = await _authService.RegistrarCliente(request);
            if (response.Exito)
            {
                return Ok(response);
            }
            return BadRequest(response);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var response = await _authService.LoginCliente(request);
            if (response.Exito)
            {
                return Ok(response);
            }
            return BadRequest(response);
        }

        [HttpPost("verificar-email/{email}")]
        public async Task<IActionResult> VerificarEmail(string email)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var existe = await _authService.EmailExiste(email);
            return Ok(new { EmailExiste = existe });
        }
    }
}
