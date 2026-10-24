using AppStore.WebApi.Business;
using AppStore.WebApi.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AppStore.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController(UserBusiness _userBusiness) : ControllerBase
    {
        [HttpGet]
        [Route("getall")]
        public async Task<IActionResult> GetAll()
        {
            var users = await _userBusiness.GetAll();
            return Ok(users);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var user = await _userBusiness.GetById(id);
            if (user == null)
            {
                return NotFound(new { message = $"No se encontró el usuario con id {id}." });
            }

            return Ok(user);
        }

        [HttpPost]
        [Route("create")]
        public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
        {
            try
            {
                await _userBusiness.Create(request);
                return Ok(new { message = "Usuario creado exitosamente." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterUserRequest request)
        {
            try
            {
                var user = await _userBusiness.Register(request);
                return Ok(user);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpPut]
        [Route("update")]
        public async Task<IActionResult> Update([FromBody] UpdateUserRequest request)
        {
            try
            {
                var result = await _userBusiness.Update(request);
                if (!result)
                {
                    return NotFound(new { message = $"No se encontró el usuario con id {request.UserId}." });
                }

                return Ok(new { message = "Usuario actualizado exitosamente." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _userBusiness.Delete(id);
            if (!result)
            {
                return NotFound(new { message = $"No se encontró el usuario con id {id}." });
            }

            return Ok(new { message = "Usuario eliminado exitosamente." });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginUserRequest request)
        {
            var user = await _userBusiness.Login(request);
            if (user == null)
            {
                return Unauthorized(new { message = "Credenciales incorrectas." });
            }

            return Ok(user);
        }

        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var result = await _userBusiness.ChangePassword(request);
            if (!result)
            {
                return NotFound(new { message = $"No se encontró el usuario con id {request.UserId}." });
            }

            return Ok(new { message = "Contraseña actualizada exitosamente." });
        }
    }
}
