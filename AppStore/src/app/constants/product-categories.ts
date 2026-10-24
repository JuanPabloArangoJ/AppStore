export interface ProductCategory {
  code: string;   // prefijo del SKU
  name: string;
  icon: string;   // nombre del icono de Material
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  { code: 'PC',  name: 'PCs',       icon: 'desktop_windows' },
  { code: 'LPT', name: 'Laptops',   icon: 'laptop' },
  { code: 'MNT', name: 'Monitores', icon: 'monitor' },
  { code: 'MSE', name: 'Mouses',    icon: 'mouse' },
  { code: 'KYB', name: 'Keyboards', icon: 'keyboard' },
  { code: 'GM',  name: 'Games',     icon: 'sports_esports' },
];

// 'LPT-001' -> 'LPT'
export function getSkuPrefix(sku: string): string {
  return sku.split('-')[0].trim().toUpperCase();
}