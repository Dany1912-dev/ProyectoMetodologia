using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace APIMetodologia.Models.Entities
{
    [Table("ciudades")]
    public class Ciudad
    {
        [Key]
        [Column("id_ciudad")]
        public int IdCiudad { get; set; }

        [Column("id_estado")]
        public int IdEstado { get; set; }

        [Column("nombre")]
        public string Nombre { get; set; }

        //Navigation property (OPCIONAL)
        [ForeignKey("IdEstado")]
        public virtual Estado Estado { get; set; }
    }
}