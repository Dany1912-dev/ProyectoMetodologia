using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace APIMetodologia.Models.Entities
{
    [Table("materias_primas")]
    public class MateriaPrima
    {
        [Key]
        [Column("id_materia_prima")]
        public int IdMateriaPrima { get; set; }

        [Column("nombre")]
        public string Nombre { get; set; }

        [Column("descripcion")]
        public string Descripcion { get; set; }

        [Column("unidad_de_medida")]
        public string UnidadDeMedida { get; set; }

        [Column("stock_actual")]
        public int StockActual { get; set; }

        [Column("id_proveedor")]
        public int IdProveedor { get; set; }

        //Navegacion en la relacion con Proveedor
        [ForeignKey("IdProveedor")]
        [JsonIgnore]
        public virtual Proveedores? Proveedor { get; set; }
    }
}
