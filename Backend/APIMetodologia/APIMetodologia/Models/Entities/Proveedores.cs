using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace APIMetodologia.Models.Entities
{
    [Table("proveedores")]
    public class Proveedores
    {
        [Key]
        [Column("id_proveedor")]
        public int IdProveedor { get; set; }

        [Column("nombre")]
        public string Nombre { get; set; }

        [Column("telefono")]
        public string Telefono { get; set; }

        [Column("email")]
        public string Email { get; set; }

        [Column("id_direccion")]
        public int IdDireccion { get; set; }

        [ForeignKey("IdDireccion")]
        public virtual Direccion? Direccion { get; set; }
    }
}
