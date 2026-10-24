import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { form, FormField, pattern, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { ProductService } from '../../services/product-service';

@Component({
  imports: [MatDialogModule, MatInputModule, MatFormFieldModule, MatIconModule, MatButtonModule, FormField],
  selector: 'app-product-add-edit',
  styleUrl: './product-add-edit.scss',
  templateUrl: './product-add-edit.html',
})
export class ProductAddEdit implements OnInit, OnDestroy {

  // Como en employee, los campos numéricos viven como texto y se convierten al guardar
  private initialData = {
    sku: '',
    name: '',
    stock: '',
    price: '',
  };

  protected productModel = signal(this.initialData);

  protected productForm = form(this.productModel, (field) => {
    required(field.sku);
    required(field.name);
    required(field.stock);
    required(field.price);
    pattern(field.stock, /^\d+$/);                 // entero, no negativo
    pattern(field.price, /^\d+([.,]\d{1,2})?$/);   // no negativo, hasta 2 decimales
  });

  protected selectedFile = signal<File | null>(null);
  protected previewUrl = signal<string | null>(null);

  private productService = inject(ProductService);
  protected dialogRef = inject(MatDialogRef<ProductAddEdit>);
  private _snackBar = inject(MatSnackBar)

  protected data = inject<{ productId?: number }>(MAT_DIALOG_DATA, { optional: true });
  protected isEditMode = signal<boolean>(false);

  // URL temporal creada con createObjectURL, hay que liberarla
  private objectUrl: string | null = null;

  ngOnInit(): void {
    if (!this.data?.productId) return;

    this.isEditMode.set(true);

    this.productService.getById(this.data.productId).subscribe({
      next: (product) => {
        this.productModel.set({
          sku: product.sku,
          name: product.name,
          stock: product.stock.toString(),
          price: product.price.toString(),
        });
        this.previewUrl.set(product.imageUrl); // imagen actual
      },
      error: (e) => this.showError(e),
    });
  }

  ngOnDestroy(): void {
    this.revokeObjectUrl();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.revokeObjectUrl();
    this.objectUrl = URL.createObjectURL(file);

    this.selectedFile.set(file);
    this.previewUrl.set(this.objectUrl);
  }

  // Al crear, la imagen es obligatoria. Al editar es opcional.
  protected canSave(): boolean {
    if (this.productForm().invalid()) return false;
    if (!this.isEditMode() && !this.selectedFile()) return false;
    return true;
  }

  save(): void {
    const { sku, name, stock, price } = this.productForm().value();

    const base = {
      sku: sku.trim(),
      name: name.trim(),
      stock: Number(stock),
      price: Number(price.replace(',', '.')),
    };

    if (this.isEditMode()) {
      this.productService.update({
        productId: this.data!.productId!,
        ...base,
        image: this.selectedFile() ?? undefined,
      }).subscribe({
        next: () => {
          this.dialogRef.close(true)
          this._snackBar.open('Producto actualizado correctamente!', 'ok', {
            horizontalPosition: 'center',
            verticalPosition: 'top',
            duration: 2000
          })
        },
        error: (e) => this.showError(e),
      });
    } else {
      this.productService.create({
        ...base,
        image: this.selectedFile()!,
      }).subscribe({
        next: () => {
          this.dialogRef.close(true)
          this._snackBar.open('Producto creado correctamente!', 'ok', {
            horizontalPosition: 'center',
            verticalPosition: 'top',
            duration: 2000
          })
        },
        error: (e) => this.showError(e),
      });
    }
  }

  close(): void {
    this.dialogRef.close(false);
  }

  private revokeObjectUrl(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
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
