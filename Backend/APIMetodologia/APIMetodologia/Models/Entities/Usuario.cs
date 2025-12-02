using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace APIMetodologia.Models.Entities
{
    [Table("usuarios")]
    public class Usuario
    {
        [Key]
        [Column("id_usuario")]
        public int IdUsuario { get; set; }

        [Column("id_direccion")]
        public int IdDireccion { get; set; }

        [Column("nombre")]
        public string Nombre { get; set; }

        [Column("apellido_1")]
        public string Apellido1 { get; set; }

        [Column("apellido_2")]
        public string? Apellido2 { get; set; }

        [Column("email")]
        public string? Email { get; set; }

        [Column("pass")]
        public string? Pass { get; set; }

        [Column("telefono")]
        public string? Telefono { get; set; }

        [Column("id_tipo_usuario")]
        public int IdTipoUsuario { get; set; }

        [Column("estatus")]
        public char Estatus { get; set; } = 'A';

        [ForeignKey("IdTipoUsuario")]
        public virtual TipoUsuario? TipoUsuario { get; set; }

        [ForeignKey("IdDireccion")]
        public virtual Direccion? Direccion { get; set; }
    }
}
