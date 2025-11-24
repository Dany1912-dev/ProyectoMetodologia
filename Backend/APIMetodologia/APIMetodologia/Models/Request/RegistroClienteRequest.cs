namespace APIMetodologia.Models.Request
{
    public class RegistroClienteRequest
    {
        public string Nombre { get; set; }
        public string Apellido1 { get; set; }
        public string Apellido2 { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string Telefono { get; set; }

        // Datos de dirección simplificados para registro inicial
        public string Calle { get; set; }
        public string Colonia { get; set; }
        public string CodigoPostal { get; set; }
    }
}
