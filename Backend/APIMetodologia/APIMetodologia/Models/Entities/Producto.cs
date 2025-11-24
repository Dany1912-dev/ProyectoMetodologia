using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace APIMetodologia.Models.Entities
{
    [Table("productos")]
    public class Producto
    {
        [Key]
        [Column("id_producto")]
        public int IdProducto { get; set; }

        [Column("id_categoria")]
        public int IdCategoria { get; set; }

        [Column("nombre")]
        public string Nombre { get; set; }

        [Column("descripcion")]
        public string Descripcion { get; set; }

        [Column("precio")]
        public decimal Precio { get; set; }

        [Column("imagen_url")]
        public string? ImagenUrl { get; set; }

        // Navigation property
        [ForeignKey("IdCategoria")]
        public virtual CategoriaProducto? Categoria { get; set; }
    }
}