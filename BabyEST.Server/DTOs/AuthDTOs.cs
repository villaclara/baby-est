namespace BabyEST.Server.DTOs;

public class AuthDTOs
{
	// On Login
	public record class UserFormModel(string Email, string Password);

	// On password reset pressed and user validation requested. 
	public record class UserValidationModel(string Email, string KidName, DateTime Birth);

	// On password change requested.
	public record class NewPasswordModel(int Secret, string Email, string Password);

}
