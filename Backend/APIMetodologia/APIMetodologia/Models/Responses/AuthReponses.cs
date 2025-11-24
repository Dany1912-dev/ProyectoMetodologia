namespace APIMetodologia.Models.Responses
{
    public class AuthResponse
    {
        public bool Exito { get; set; }
        public string Mensaje { get; set; }
        public string Token { get; set; }
        public UsuarioInfo Usuario { get; set; }
    }

    public class UsuarioInfo
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Email { get; set; }
        public string Telefono { get; set; }
        public string TipoUsuario { get; set; }
    }
}
