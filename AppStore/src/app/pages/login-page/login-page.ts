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
  private _snackBar = inject(MatSnackBar)
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
    pattern(field.password, /^.{6,}$/);   // mínimo 6 caracteres
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

  // Primer ingreso (o reset forzado por un admin): debe elegir su contraseña definitiva
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
        // Si cancela, no entra al sistema
        if (changed) this.enter({ ...user, resetPassword: false });
      });
  }

  protected register(): void {
    if (this.signupForm().invalid()) return;

    const { fullName, email, password } = this.signupForm().value();

    this.userService.register({
      fullName: fullName.trim(),
      email: email.trim(),
      password,
    }).subscribe({
      next: (user) => {
        this._snackBar.open('Password updated successfully!', 'ok', {
            horizontalPosition: 'center',
            verticalPosition: 'top',
            duration: 2000
          })
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
