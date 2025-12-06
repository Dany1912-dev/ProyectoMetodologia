namespace APIMetodologia.Models.Request
{
    public class ProductoDetalleRequest
    {
        public int IdProducto { get; set; }
        public int Cantidad { get; set; }
    }

    public class RegistrarPedidoManualRequest
    {
        //ID de usuario encargado de ventas, es obligatorio en la BD por la FK
        public int IdUsuario { get; set; }
        public List<ProductoDetalleRequest> Productos { get; set; }

        public string? Notas { get; set; }
        public bool EsPedidoEspecial { get; set; } = false;
        public DateTime? FechaEntregaEspecial { get; set; }
    }
}
