using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace APIMetodologia.Models.Entities
{
    [Table("tipo_usuario")]
    public class TipoUsuario
    {
        [Key]
        [Column("id_tipo_usuario")]
        public int IdTipoUsuario { get; set; }

        [Column("nombre")]
        public string Nombre { get; set; }

        [Column("descripcion")]
        public string Descripcion { get; set; }
    }
}