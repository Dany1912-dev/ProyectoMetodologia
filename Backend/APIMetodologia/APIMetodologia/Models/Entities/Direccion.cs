using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace APIMetodologia.Models.Entities
{
    [Table("direcciones")]
    public class Direccion
    {
        [Key]
        [Column("id_direccion")]
        public int IdDireccion { get; set; }

        [Column("id_ciudad")]
        public int IdCiudad { get; set; }

        [Column("calle")]
        public string Calle { get; set; }

        [Column("numero_exterior")]
        public int? NumeroExterior { get; set; }

        [Column("numero_interior")]
        public int? NumeroInterior { get; set; }

        [Column("colonia")]
        public string Colonia { get; set; }

        [Column("codigo_postal")]
        public int CodigoPostal { get; set; }

        [Column("referencias")]
        public string? Referencias { get; set; }

        // Navigation property (OPCIONAL - puedes comentarla si da problemas)
        [ForeignKey("IdCiudad")]
        public virtual Ciudad Ciudad { get; set; }
    }
}