using APIMetodologia.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace APIMetodologia.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // DbSets para tus tablas
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Direccion> Direcciones { get; set; }
        public DbSet<Ciudad> Ciudades { get; set; }
        public DbSet<Estado> Estados { get; set; }
        public DbSet<Pais> Paises { get; set; }
        public DbSet<TipoUsuario> TiposUsuario { get; set; }
        public DbSet<Producto> Productos { get; set; }
        public DbSet<CategoriaProducto> CategoriasProductos { get; set; }
        public DbSet<MateriaPrima> MateriasPrimas { get; set; }
        public DbSet<Proveedores> Proveedores { get; set; }
        public DbSet<PedidoCliente> PedidosClientes { get; set; }
        public DbSet<DetallePedidoCliente> DetallesPedidosClientes { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configuraciones adicionales si las necesitas
        }
    }
}