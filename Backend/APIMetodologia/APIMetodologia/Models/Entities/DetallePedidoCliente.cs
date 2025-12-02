using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace APIMetodologia.Models.Entities
{
    [Table("detalle_pedidos_clientes")]
    public class DetallePedidoCliente
    {
        [Key]

        [Column("id_detalle_pedido_cliente")]
        public int IdDetallePedidoCliente { get; set; }

        [Column("id_pedido_cliente")]
        public int IdPedidoCliente { get; set; }

        [Column("id_producto")]
        public int IdProducto { get; set; }

        [Column("cantidad")]
        public int Cantidad { get; set; }

        [Column("precio_unitario")]
        public decimal PrecioUnitario { get; set; }

        // Navegación en la BD
        [ForeignKey("IdPedidoCliente")]
        [JsonIgnore]
        public virtual PedidoCliente? PedidoCliente { get; set; }
        [ForeignKey("IdProducto")]
        public virtual Producto? Producto { get; set; }
    }
}
