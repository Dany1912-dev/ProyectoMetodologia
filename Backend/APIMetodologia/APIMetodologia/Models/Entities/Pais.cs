using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace APIMetodologia.Models.Entities
{
    [Table("pais")]
    public class Pais
    {
        [Key]
        [Column("id_pais")]
        public int IdPais { get; set; }

        [Column("nombre")]
        public string Nombre { get; set; }
    }
}