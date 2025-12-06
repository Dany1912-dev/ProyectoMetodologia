namespace APIMetodologia.Models.Request
{
    public class ActualizarDireccionRequest
    {
        public string Calle { get; set; }
        public string? NumeroExterior { get; set; }
        public string? NumeroInterior { get; set; }
        public string Colonia { get; set; }
        public string CodigoPostal { get; set; }
        public string? Referencias { get; set; }
        public int IdCiudad { get; set; } = 1; // Por defecto
    }
}