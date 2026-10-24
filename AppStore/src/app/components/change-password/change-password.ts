import { Component, computed, inject, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { UserService } from '../../services/user-service';

@Component({
  imports: [MatDialogModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, FormField],
  selector: 'app-change-password',
  styleUrl: './change-password.scss',
  templateUrl: './change-password.html',
})
export class ChangePassword {

  private userService = inject(UserService);
  protected dialogRef = inject(MatDialogRef<ChangePassword>);
  private _snackBar = inject(MatSnackBar)
  protected data = inject<{ userId: number; email: string }>(MAT_DIALOG_DATA);

  private model = signal({ newPassword: '', confirmPassword: '' });

  protected passwordForm = form(this.model, (field) => {
    required(field.newPassword);
    required(field.confirmPassword);
  });

  protected error = computed(() => {
    const { newPassword, confirmPassword } = this.model();

    if (newPassword && newPassword.length < 6)
      return 'Minimum 6 characters.';
    if (newPassword && newPassword.toLowerCase() === this.data.email.toLowerCase())
      return 'The password cannot be your email.';
    if (confirmPassword && newPassword !== confirmPassword)
      return 'Passwords do not match.';

    return '';
  });

  protected canSave = computed(() => {
    const { newPassword, confirmPassword } = this.model();
    return !!newPassword && !!confirmPassword && !this.error();
  });

  save(): void {
    this.userService.changePassword({
      userId: this.data.userId,
      newPassword: this.model().newPassword,
    }).subscribe({
      next: () => {
        this.dialogRef.close(true);
        this._snackBar.open('Password updated successfully!', 'ok', {
            horizontalPosition: 'center',
            verticalPosition: 'top',
            duration: 2000
          })
      },
      error: (e) =>
        Swal.fire({
          title: 'Error',
          text: e.error?.message ?? 'Unexpected error',
          icon: 'error',
          theme: 'dark',
        }),
    });
  }

  close(): void {
    this.dialogRef.close(false);
  }
}