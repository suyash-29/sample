using System.ComponentModel.DataAnnotations;

namespace AmazeCareAPI.Dtos
{
    public class UserLoginDto
    {
        [Required]
        [MaxLength(100)]
        public string Username { get; set; }

        [Required]
        [MinLength(6)]
        public string Password { get; set; }
    }

}