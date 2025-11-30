using Microsoft.EntityFrameworkCore;
using APIMetodologia.Data;
using APIMetodologia.Models.Entities;
using APIMetodologia.Models.Request;
using APIMetodologia.Models.Responses;
using APIMetodologia.Services.Interfaces;

using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.IdentityModel.Tokens;
namespace APIMetodologia.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        public AuthService(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<bool> EmailExiste(string email)
        {
            return await _context.Usuarios.AnyAsync(u => u.Email == email && u.Estatus == 'A');
        }

        public async Task<AuthResponse> RegistrarCliente(RegistroClienteRequest request)
        {
            try
            {
                if (!IsValidEmail(request.Email))
                {
                    return new AuthResponse { Exito = false, Mensaje = "Formato de email inválido" };
                }

                if (request.Password.Length < 6)
                {
                    return new AuthResponse { Exito = false, Mensaje = "La contraseña debe tener al menos 6 caracteres" };
                }
                // Verificar si el email ya existe
                if (await EmailExiste(request.Email))
                {
                    return new AuthResponse { Exito = false, Mensaje = "El email ya está registrado" };
                }

                // TODO: Crear dirección básica (por ahora usaremos una dirección temporal)
                // Esto lo mejoraremos después
                var direccionId = await CrearDireccionBasica(request);

                // Crear el usuario cliente
                var usuario = new Usuario
                {
                    Nombre = request.Nombre,
                    Apellido1 = request.Apellido1,
                    Apellido2 = request.Apellido2,
                    Email = request.Email,
                    Pass = BCrypt.Net.BCrypt.HashPassword(request.Password), // Encriptar contraseña
                    Telefono = request.Telefono,
                    IdDireccion = direccionId,
                    IdTipoUsuario = 2, // 2 = Cliente
                    Estatus = 'A'
                };

                _context.Usuarios.Add(usuario);
                await _context.SaveChangesAsync();
                // En el AuthService - agregar validación simple

                return new AuthResponse
                {
                    Exito = true,
                    Mensaje = "Cliente registrado exitosamente",
                    Usuario = new UsuarioInfo
                    {
                        Id = usuario.IdUsuario,
                        Nombre = $"{usuario.Nombre} {usuario.Apellido1}",
                        Email = usuario.Email,
                        Telefono = usuario.Telefono,
                        TipoUsuario = "Cliente"
                    }
                };
            }
            catch (Exception ex)
            {
                return new AuthResponse { Exito = false, Mensaje = $"Error al registrar: {ex.Message}" };
            }
        }

        public async Task<AuthResponse> LoginCliente(LoginRequest request)
        {
            try
            {
                // Buscar usuario activo con tipo Cliente
                var usuario = await _context.Usuarios
                    .Include(u => u.TipoUsuario)
                    .FirstOrDefaultAsync(u => u.Email == request.Email &&
                                             u.IdTipoUsuario == 2 && // Solo clientes
                                             u.Estatus == 'A');

                if (usuario == null || !BCrypt.Net.BCrypt.Verify(request.Password, usuario.Pass))
                {
                    return new AuthResponse { Exito = false, Mensaje = "Email o contraseña incorrectos" };
                }

                // TODO: Generar JWT token (lo implementaremos después)
                var token = GenerarToken(usuario);

                return new AuthResponse
                {
                    Exito = true,
                    Mensaje = "Login exitoso",
                    Token = token,
                    Usuario = new UsuarioInfo
                    {
                        Id = usuario.IdUsuario,
                        Nombre = $"{usuario.Nombre} {usuario.Apellido1}",
                        Email = usuario.Email,
                        Telefono = usuario.Telefono,
                        TipoUsuario = usuario.TipoUsuario?.Nombre ?? "Cliente"
                    }
                };
            }
            catch (Exception ex)
            {
                return new AuthResponse { Exito = false, Mensaje = $"Error en login: {ex.Message}" };
            }
        }

        private string GenerarToken(Usuario usuario)
        {
            var claims = new List<Claim>
            {
                new Claim (ClaimTypes.NameIdentifier, usuario.IdUsuario.ToString()),
                new Claim (ClaimTypes.Email, usuario.Email),
                new Claim (ClaimTypes.Role, usuario.TipoUsuario.Nombre),
                new Claim ("Nombre Completo", $"{usuario.Nombre} {usuario.Apellido1}")
            };

            var jwtkey = _configuration["Jwt:Key"];
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtkey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(7),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private async Task<int> CrearDireccionBasica(RegistroClienteRequest request)
        {
            // Por ahora creamos una dirección temporal
            // Esto lo mejoraremos con una ciudad/estado/pais por defecto
            var direccion = new Direccion
            {
                Calle = request.Calle,
                Colonia = request.Colonia,
                CodigoPostal = int.Parse(request.CodigoPostal),
                IdCiudad = 1 // Temporal - necesitamos una ciudad por defecto
            };

            _context.Direcciones.Add(direccion);
            await _context.SaveChangesAsync();

            return direccion.IdDireccion;
        }
        private bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }
    }
}
