import { Component, inject, signal } from '@angular/core';
import { form, FormField, pattern, required } from '@angular/forms/signals';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ChangePassword } from '../../components/change-password/change-password';
import { GetUserResponse } from '../../interfaces/user-dtos';
import { AuthService } from '../../services/auth-service';
import { UserService } from '../../services/user-service';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  imports: [FormField],
  selector: 'app-login-page',
  styleUrl: './login-page.scss',
  templateUrl: './login-page.html',
})
export class LoginPage {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private _snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  protected flipped = signal(false);
  protected remember = signal(false);

  // ===== Login =====
  private loginModel = signal({ email: '', password: '' });

  protected loginForm = form(this.loginModel, (field) => {
    required(field.email);
    required(field.password);
  });

  // ===== Sign up =====
  private signupModel = signal({ fullName: '', email: '', password: '' });

  protected signupForm = form(this.signupModel, (field) => {
    required(field.fullName);
    required(field.email);
    pattern(field.email, EMAIL_PATTERN);
    required(field.password);
    pattern(field.password, /^.{6,}$/);
  });

  protected login(): void {
    if (this.loginForm().invalid()) return;

    const { email, password } = this.loginForm().value();

    this.userService.login({ email: email.trim(), password }).subscribe({
      next: (user) => {
        if (user.resetPassword) {
          this.askNewPassword(user);
        } else {
          this.enter(user);
        }
      },
      error: (e) => this.showError(e),
    });
  }

  protected async forgotPassword(): Promise<void> {
    const { value: email } = await Swal.fire({
      title: 'Recuperar contraseña',
      input: 'email',
      inputLabel: 'Ingresa el correo de tu cuenta',
      inputPlaceholder: 'correo@ejemplo.com',
      inputValue: this.loginModel().email,
      showCancelButton: true,
      confirmButtonText: 'Recuperar',
      cancelButtonText: 'Cancelar',
      theme: 'dark',
    });

    if (!email) return;

    this.userService.forgotPassword(email.trim()).subscribe({
      next: (res) => {
        this.loginModel.set({ email: email.trim(), password: res.tempPassword });
        Swal.fire({
          title: 'Contraseña temporal generada',
          html: `Tu clave temporal es: <strong>${res.tempPassword}</strong><br><small>Ya la hemos colocado en el formulario. Presiona <b>Sign In</b> para definir tu nueva contraseña.</small>`,
          icon: 'success',
          theme: 'dark',
        });
      },
      error: (e) => this.showError(e),
    });
  }

  private askNewPassword(user: GetUserResponse): void {
    this.dialog
      .open(ChangePassword, {
        width: '420px',
        height: 'auto',
        disableClose: true,
        data: { userId: user.userId, email: user.email },
      })
      .afterClosed()
      .subscribe((changed) => {
        if (changed) this.enter({ ...user, resetPassword: false });
      });
  }

  protected register(): void {
    if (this.signupForm().invalid()) return;

    const { fullName, email, password } = this.signupForm().value();

    this.userService
      .register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      })
      .subscribe({
        next: (user) => {
          this._snackBar.open('Cuenta creada exitosamente!', 'ok', {
            horizontalPosition: 'center',
            verticalPosition: 'top',
            duration: 2000,
          });
          this.enter(user);
        },
        error: (e) => this.showError(e),
      });
  }

  private enter(user: GetUserResponse): void {
    this.authService.login(user, this.remember());
    this.router.navigate(['/home']);
  }

  private showError(e: any): void {
    Swal.fire({
      title: 'Error',
      text: e.error?.message ?? 'Unexpected error',
      icon: 'error',
      theme: 'dark',
    });
  }
}