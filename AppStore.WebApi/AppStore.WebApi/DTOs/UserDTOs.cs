namespace AppStore.WebApi.DTOs
{
    #region requests
    public record CreateUserRequest(
        string FullName,
        string Email,
        string Type,
        string? Password = null
        );

    public record UpdateUserRequest(
            int UserId,
            string FullName,
            string Email,
            string Type,
            bool ResetPassword
        );

    public record ChangePasswordRequest(
            int UserId,
            string NewPassword
        );

    public record LoginUserRequest(
            string Email,
            string Password
        );

    public record RegisterUserRequest(
    string FullName,
    string Email,
    string Password
);

    #endregion

    #region responses
    public record GetUserResponse(
            int UserId,
            string FullName,
            string Email,   
            string Type,
            bool ResetPassword
        );
    #endregion
}
