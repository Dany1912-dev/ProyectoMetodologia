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
        public int IdUsuario { get; set; } = 2;
        public List<ProductoDetalleRequest> Productos { get; set; }
    }
}
