using System.Net.Sockets;
using System.Text;
using System.Text.Json;

namespace APIMetodologia.Services
{
    public class NotificadorSocket
    {
        public static void EnviarNotificacion(string titulo, string mensaje)
        {
            Task.Run(() =>
            {
                try
                {
                    using (TcpClient cliente = new TcpClient("127.0.0.1", 65432))
                    using (NetworkStream stream = cliente.GetStream())
                    {
                        var datoscargados = new
                        {
                            accion = "INFO",
                            contenido = $"{titulo}: {mensaje}"
                        };

                        string jsonString = JsonSerializer.Serialize(datoscargados);
                        byte[] buffer = Encoding.UTF8.GetBytes(jsonString);

                        stream.Write(buffer, 0, buffer.Length);
                    }
                }
                catch
                {
                }
            });
        }
    }
}
