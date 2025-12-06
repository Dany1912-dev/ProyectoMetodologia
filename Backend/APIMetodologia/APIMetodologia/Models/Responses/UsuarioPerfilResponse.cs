// Models/Response/UsuarioPerfilResponse.cs
namespace APIMetodologia.Models.Response
{
    public class UsuarioPerfilResponse
    {
        public int IdUsuario { get; set; }
        public string Nombre { get; set; }
        public string Apellido1 { get; set; }
        public string? Apellido2 { get; set; }
        public string Email { get; set; }
        public string? Telefono { get; set; }
        public string TipoUsuario { get; set; }
        public DateTime? FechaRegistro { get; set; }
        public DireccionInfo? Direccion { get; set; }
        public EstadisticasUsuario? Estadisticas { get; set; }
    }

    public class DireccionInfo
    {
        public string Calle { get; set; }
        public string? NumeroExterior { get; set; }
        public string? NumeroInterior { get; set; }
        public string Colonia { get; set; }
        public string CodigoPostal { get; set; }
        public string? Referencias { get; set; }
        public string Ciudad { get; set; }
        public string Estado { get; set; }
        public string Pais { get; set; }
    }

    public class EstadisticasUsuario
    {
        public int TotalPedidos { get; set; }
        public int PedidosActivos { get; set; }
        public int PedidosEspeciales { get; set; }
        public decimal TotalGastado { get; set; }
        public decimal PromedioPorPedido { get; set; }
        public DateTime? PrimerPedido { get; set; }
    }
}