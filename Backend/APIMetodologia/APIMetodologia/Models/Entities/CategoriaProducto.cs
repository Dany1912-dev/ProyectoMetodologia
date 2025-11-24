using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace APIMetodologia.Models.Entities
{
    [Table("categorias_productos")]
    public class CategoriaProducto
    {
        [Key]
        [Column("id_categoria")]
        public int IdCategoria { get; set; }

        [Column("nombre")]
        public string Nombre { get; set; }

        [Column("descripcion")]
        public string Descripcion { get; set; }
    }
}