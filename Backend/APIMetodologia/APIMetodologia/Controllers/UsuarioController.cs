// Controllers/UsuariosController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using APIMetodologia.Services.Interfaces;
using APIMetodologia.Models.Request;
using APIMetodologia.Models.Response;
using System.Security.Claims;

namespace APIMetodologia.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsuariosController : ControllerBase
    {
        private readonly IUsuarioService _usuarioService;

        public UsuariosController(IUsuarioService usuarioService)
        {
            _usuarioService = usuarioService;
        }

        [HttpGet("perfil")]
        public async Task<IActionResult> ObtenerPerfil()
        {
            try
            {
                var usuarioId = ObtenerUsuarioIdDeToken();
                var perfil = await _usuarioService.ObtenerPerfil(usuarioId);

                return Ok(new
                {
                    Exito = true,
                    Mensaje = "Perfil obtenido exitosamente",
                    Perfil = perfil
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Exito = false, Mensaje = ex.Message });
            }
        }

        [HttpPut("perfil")]
        public async Task<IActionResult> ActualizarPerfil([FromBody] ActualizarPerfilRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { Exito = false, Mensaje = "Datos inválidos" });

                var usuarioId = ObtenerUsuarioIdDeToken();
                var usuario = await _usuarioService.ActualizarPerfil(usuarioId, request);

                return Ok(new
                {
                    Exito = true,
                    Mensaje = "Perfil actualizado exitosamente",
                    Usuario = new
                    {
                        usuario.Nombre,
                        usuario.Apellido1,
                        usuario.Apellido2,
                        usuario.Telefono
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Exito = false, Mensaje = ex.Message });
            }
        }

        [HttpPut("direccion")]
        public async Task<IActionResult> ActualizarDireccion([FromBody] ActualizarDireccionRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { Exito = false, Mensaje = "Datos inválidos" });

                var usuarioId = ObtenerUsuarioIdDeToken();
                var direccion = await _usuarioService.ActualizarDireccion(usuarioId, request);

                return Ok(new
                {
                    Exito = true,
                    Mensaje = "Dirección actualizada exitosamente",
                    Direccion = new
                    {
                        direccion.Calle,
                        direccion.NumeroExterior,
                        direccion.NumeroInterior,
                        direccion.Colonia,
                        direccion.CodigoPostal,
                        direccion.Referencias
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Exito = false, Mensaje = ex.Message });
            }
        }

        [HttpPost("cambiar-password")]
        public async Task<IActionResult> CambiarPassword([FromBody] CambiarPasswordRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { Exito = false, Mensaje = "Datos inválidos" });

                var usuarioId = ObtenerUsuarioIdDeToken();
                var resultado = await _usuarioService.CambiarPassword(usuarioId, request);

                return Ok(new
                {
                    Exito = true,
                    Mensaje = "Contraseña cambiada exitosamente"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Exito = false, Mensaje = ex.Message });
            }
        }

        [HttpGet("estadisticas")]
        public async Task<IActionResult> ObtenerEstadisticas()
        {
            try
            {
                var usuarioId = ObtenerUsuarioIdDeToken();
                var estadisticas = await _usuarioService.ObtenerEstadisticas(usuarioId);

                return Ok(new
                {
                    Exito = true,
                    Mensaje = "Estadísticas obtenidas exitosamente",
                    Estadisticas = estadisticas
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Exito = false, Mensaje = ex.Message });
            }
        }

        private int ObtenerUsuarioIdDeToken()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
                throw new UnauthorizedAccessException("Usuario no autenticado");

            return int.Parse(userIdClaim);
        }
    }
}