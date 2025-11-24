using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace APIMetodologia.Models.Entities
{
    [Table("estados")]
    public class Estado
    {
        [Key]
        [Column("id_estado")]
        public int IdEstado { get; set; }

        [Column("id_pais")]
        public int IdPais { get; set; }

        [Column("nombre")]
        public string Nombre { get; set; }

        //Navigation property (OPCIONAL)
        [ForeignKey("IdPais")]
        public virtual Pais Pais { get; set; }
    }
}