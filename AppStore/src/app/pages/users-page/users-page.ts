import { Component, effect, inject, OnInit, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import Swal from 'sweetalert2';
import { UserAddEdit } from '../../components/user-add-edit/user-add-edit';
import { GetUserResponse } from '../../interfaces/user-dtos';
import { UserService } from '../../services/user-service';

@Component({
  selector: 'app-users-page',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
  ],
  templateUrl: './users-page.html',
  styleUrl: './users-page.scss',
})
export class UsersPage  implements OnInit {

  private dialog = inject(MatDialog);
  private userService = inject(UserService);

  protected displayedColumns: string[] = ['userId', 'fullName', 'email', 'type', 'actions'];
  protected dataSource = new MatTableDataSource<GetUserResponse>([]);
  protected paginator = viewChild(MatPaginator);
  protected sort = viewChild(MatSort);
  protected users = signal<GetUserResponse[]>([]);

  constructor() {
    // El filtro solo busca en nombre, correo y tipo (no en resetPassword ni en el id)
    this.dataSource.filterPredicate = (user, filter) =>
      `${user.fullName} ${user.email} ${user.type}`.toLowerCase().includes(filter);

    effect(() => {
      this.dataSource.data = this.users();

      const paginator = this.paginator();
      const sort = this.sort();

      if (paginator) this.dataSource.paginator = paginator;
      if (sort) this.dataSource.sort = sort;
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.userService.getAll().subscribe({
      next: (data) => this.users.set(data),
      error: (e) => {
        console.log(e.error);
        this.users.set([]);
      },
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openCreateModal(): void {
  const dialogRef = this.dialog.open(UserAddEdit, {
    width: '450px',
    height: 'auto',
    disableClose: true,
  });

  dialogRef.afterClosed().subscribe((result) => {
    if (result) this.loadUsers();
  });
}

  openEditModal(userId: number): void {
  const dialogRef = this.dialog.open(UserAddEdit, {
    width: '450px',
    height: 'auto',
    disableClose: true,
    data: { userId },
  });

  dialogRef.afterClosed().subscribe((result) => {
    if (result) this.loadUsers();
  });
}

  deleteUser(userId: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      theme: 'dark',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.userService.delete(userId).subscribe({
        next: () => {
          this.loadUsers();
          Swal.fire({
            title: 'Deleted!',
            text: 'User has been deleted.',
            icon: 'success',
            theme: 'dark',
          });
        },
        error: (e) =>
          Swal.fire({
            title: 'Error',
            text: e.error?.message ?? 'Unexpected error',
            icon: 'error',
            theme: 'dark',
          }),
      });
    });
  }
}