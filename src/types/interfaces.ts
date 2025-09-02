import { ReactNode } from 'react';

export interface ProductI {
  _id: string;
  article: string;
  name: string;
  source: string;
  stock: number; // храним как число, для совместимости можно маппить на строку при выводе
  price: number;
  imageAddress?: string | string[];   // старое поле для API
  imageAddresses?: string[];           // всегда массив строк
  visible?: boolean;                  // видимость товара
  isHidden?: boolean;                 // альтернативный вариант visible
  quantity: number;

  // новые поля для светильников
  socketType?: string; // тип цоколя (E27, GU10 и т.д.)
  lampCount?: number;  // количество ламп
  shadeColor?: string; // цвет плафона
  frameColor?: string; // цвет арматуры
  
  // поля для фильтрации
  isNew?: boolean | string; // является ли товар новинкой
  inStock?: boolean | string; // в наличии ли товар
  outOfStock?: boolean | string; // товар под заказ
  createdAt?: string | Date; // дата создания товара
  updatedAt?: string | Date; // дата обновления товара
  
  // для любых дополнительных динамических полей (старые поля)
  [key: string]: any;
}

export interface OrderI {
  _id: string;
  products: { productId: string; quantity: number; status: string }[];
  totalAmount: number;
  status: string;
}

export interface Item {
  productId: string;
  quantity: number;
  status: string;
}
