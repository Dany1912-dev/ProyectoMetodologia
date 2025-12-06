namespace APIMetodologia.Models.Request
{
    public class CambiarPasswordRequest
    {
        public string PasswordActual { get; set; }
        public string NuevaPassword { get; set; }
    }
}