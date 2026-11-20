using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AppStore.WebApi.Constants;
using AppStore.WebApi.Data;
using AppStore.WebApi.DTOs;
using AppStore.WebApi.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace AppStore.WebApi.Business
{
    public class UserBusiness(AppDbContext _db, IConfiguration _config)
    {
        private string GenerateJwtToken(Usuario user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role, user.UserType)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(8),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<List<GetUserResponse>> GetAll()
        {
            var users = await _db
                .Usuarios
                .AsNoTracking()
                .Select(e => new GetUserResponse(
                    e.UserId,
                    e.FullName,
                    e.Email,
                    e.UserType,
                    e.ResetPassword
                ))
                .ToListAsync();

            return users;
        }

        public async Task<GetUserResponse?> GetById(int id)
        {
            var user = await _db
                .Usuarios
                .AsNoTracking()
                .Where(e => e.UserId == id)
                .Select(e => new GetUserResponse(
                    e.UserId,
                    e.FullName,
                    e.Email,
                    e.UserType,
                    e.ResetPassword
                ))
                .FirstOrDefaultAsync();

            return user;
        }

        public async Task<GetUserResponse?> Login(LoginUserRequest request)
        {
            var user = await _db
                .Usuarios
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.Email == request.Email && e.Passwrd == request.Password);

            if (user == null)
            {
                return null;
            }

            return new GetUserResponse(
                user.UserId,
                user.FullName,
                user.Email,
                user.UserType,
                user.ResetPassword,
                GenerateJwtToken(user)
            );
        }

        public async Task<string?> ForgotPassword(string email)
        {
            var user = await _db
                .Usuarios
                .FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
            {
                return null;
            }

            var tempPassword = $"Tmp{Random.Shared.Next(1000, 9999)}";
            user.Passwrd = tempPassword;
            user.ResetPassword = true;

            await _db.SaveChangesAsync();
            return tempPassword;
        }

        public async Task<bool> ChangePassword(ChangePasswordRequest request)
        {
            var user = await _db
                .Usuarios
                .FirstOrDefaultAsync(e => e.UserId == request.UserId);

            if (user == null)
            {
                return false;
            }

            user.Passwrd = request.NewPassword;
            user.ResetPassword = false;

            await _db.SaveChangesAsync();
            return true;
        }

        private async Task EnsureEmailAvailable(string email)
        {
            if (await _db.Usuarios.AnyAsync(u => u.Email == email))
                throw new InvalidOperationException("Ya existe un usuario con ese correo.");
        }

        public async Task Create(CreateUserRequest request)
        {
            if (!UserTypes.IsValid(request.Type))
                throw new ArgumentException($"Tipo de usuario inválido: '{request.Type}'.");

            await EnsureEmailAvailable(request.Email);

            var user = new Usuario
            {
                FullName = request.FullName,
                Email = request.Email,
                UserType = request.Type,
                Passwrd = string.IsNullOrWhiteSpace(request.Password) ? request.Email : request.Password,
                ResetPassword = true
            };

            _db.Usuarios.Add(user);
            await _db.SaveChangesAsync();
        }

        public async Task<GetUserResponse> Register(RegisterUserRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.FullName) || string.IsNullOrWhiteSpace(request.Email))
                throw new ArgumentException("El nombre y el correo son obligatorios.");

            if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6)
                throw new ArgumentException("La contraseña debe tener al menos 6 caracteres.");

            await EnsureEmailAvailable(request.Email);

            var user = new Usuario
            {
                FullName = request.FullName,
                Email = request.Email,
                UserType = UserTypes.SalesPerson,
                Passwrd = request.Password,
                ResetPassword = false
            };

            _db.Usuarios.Add(user);
            await _db.SaveChangesAsync();

            return new GetUserResponse(
                user.UserId,
                user.FullName,
                user.Email,
                user.UserType,
                user.ResetPassword,
                GenerateJwtToken(user)
            );
        }

        public async Task<bool> Update(UpdateUserRequest request)
        {
            var user = await _db
                .Usuarios
                .FirstOrDefaultAsync(e => e.UserId == request.UserId);

            if (user == null)
            {
                return false;
            }

            user.FullName = request.FullName;
            user.Email = request.Email;
            user.UserType = request.Type;
            user.ResetPassword = request.ResetPassword;

            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> Delete(int id)
        {
            var user = await _db
                .Usuarios
                .FirstOrDefaultAsync(e => e.UserId == id);

            if (user == null)
            {
                return false;
            }

            _db.Usuarios.Remove(user);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}