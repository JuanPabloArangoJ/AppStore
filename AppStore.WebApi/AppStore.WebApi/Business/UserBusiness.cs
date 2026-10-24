using AppStore.WebApi.Constants;
using AppStore.WebApi.Data;
using AppStore.WebApi.DTOs;
using AppStore.WebApi.Entities;
using Microsoft.EntityFrameworkCore;

namespace AppStore.WebApi.Business
{
    public class UserBusiness(AppDbContext _db)
    {
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
                    )).ToListAsync();

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
                .Where(e => e.Email == request.Email && e.Passwrd == request.Password)
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
                // Contraseña inicial = correo; debe cambiarla en su primer login
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
                UserType = UserTypes.SalesPerson,   // siempre SalesPerson
                Passwrd = request.Password,
                ResetPassword = false               // eligió su propia contraseña
            };

            _db.Usuarios.Add(user);
            await _db.SaveChangesAsync();

            return new GetUserResponse(user.UserId, user.FullName, user.Email, user.UserType, user.ResetPassword);
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