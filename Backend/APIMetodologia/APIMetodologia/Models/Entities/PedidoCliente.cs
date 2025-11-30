using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace APIMetodologia.Models.Entities
{
    [Table("pedido_cliente")]
    public class PedidoCliente
    {
        [Key]
        [Column("id_pedido_cliente")]
        public int IdPedidoCliente { get; set; }

        [Column("id_usuario")]
        public int IdUsuario { get; set; }

        [Column("fecha_pedido")]
        public DateTime FechaPedido { get; set; }

        [Column("estatus")]
        public string Estatus { get; set; }

        [Column("total")]
        public decimal Total { get; set; }

        // Navegación en la BD
        [ForeignKey("IdUsuario")]
        public virtual Usuario? Usuario { get; set; }

        public virtual ICollection<DetallePedidoCliente>? DetallesPedido { get; set; }
    }
}
