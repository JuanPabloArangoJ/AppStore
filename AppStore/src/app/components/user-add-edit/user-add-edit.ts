import { Component, inject, OnInit, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { USER_TYPES } from '../../constants/user-types';
import { AuthService } from '../../services/auth-service';
import { UserService } from '../../services/user-service';

@Component({
  imports: [
    MatDialogModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    FormField,
  ],
  selector: 'app-user-add-edit',
  styleUrl: './user-add-edit.scss',
  templateUrl: './user-add-edit.html',
})
export class UserAddEdit implements OnInit {
  private initialData = {
    fullName: '',
    email: '',
    type: '',
    resetPassword: false,
  };

  protected userModel = signal(this.initialData);

  protected userForm = form(this.userModel, (field) => {
    required(field.fullName);
    required(field.email);
    required(field.type);
  });

  protected userTypes = USER_TYPES;

  private userService = inject(UserService);
  private authService = inject(AuthService);
  protected dialogRef = inject(MatDialogRef<UserAddEdit>);
  private _snackBar = inject(MatSnackBar);

  protected data = inject<{ userId?: number; isProfileMode?: boolean }>(MAT_DIALOG_DATA, {
    optional: true,
  });
  protected isEditMode = signal<boolean>(false);
  protected isProfileMode = signal<boolean>(false);

  private originalResetPassword = false;

  ngOnInit(): void {
    if (!this.data?.userId) return;

    this.isEditMode.set(true);
    this.isProfileMode.set(Boolean(this.data?.isProfileMode));

    this.userService.getById(this.data.userId).subscribe({
      next: (user) => {
        this.originalResetPassword = user.resetPassword;
        this.userModel.set({
          fullName: user.fullName,
          email: user.email,
          type: user.type,
          resetPassword: false,
        });
      },
      error: (e) => this.showError(e),
    });
  }

  save(): void {
    const value = this.userForm().value();

    if (this.isEditMode()) {
      this.userService
        .update({
          userId: this.data!.userId!,
          fullName: value.fullName,
          email: value.email,
          type: value.type,
          resetPassword: this.isProfileMode()
            ? this.originalResetPassword
            : this.originalResetPassword || value.resetPassword,
        })
        .subscribe({
          next: () => {
            if (this.authService.user()?.userId === this.data!.userId!) {
              this.authService.updateCurrentUser({
                fullName: value.fullName,
                email: value.email,
                type: value.type,
              });
            }
            this.dialogRef.close(true);
            this._snackBar.open(
              this.isProfileMode() ? 'Perfil actualizado con éxito!' : 'Usuario actualizado con éxito!',
              'ok',
              {
                horizontalPosition: 'center',
                verticalPosition: 'top',
                duration: 2000,
              }
            );
          },
          error: (e) => this.showError(e),
        });
    } else {
      this.userService
        .create({
          fullName: value.fullName,
          email: value.email,
          type: value.type,
        })
        .subscribe({
          next: () => {
            this.dialogRef.close(true);
            this._snackBar.open('Usuario creado con éxito!', 'ok', {
              horizontalPosition: 'center',
              verticalPosition: 'top',
              duration: 2000,
            });
          },
          error: (e) => this.showError(e),
        });
    }
  }

  close(): void {
    this.dialogRef.close(false);
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