export enum Language {
  EN = 'EN',
  HI = 'HI',
}

export enum ActiveTab {
  Home = 'Home',
  UrgentOrder = 'UrgentOrder',
  Location = 'Location',
  Bills = 'Bills',
  Profile = 'Profile',
}

export interface User {
  name: string;
  phone: string; // Used as a unique ID
  address: string;
}

export interface Vegetable {
  id: number;
  name: {
    [Language.EN]: string;
    [Language.HI]: string;
  };
  price: number;
  unit: {
    [Language.EN]: string;
    [Language.HI]: string;
  };
  image: string; // Can be a URL or a base64 string
}

export interface BillEntry {
  date: string;
  items: {
    name: string;
    quantity: number | string;
    price: number;
  }[];
  total: number;
}

export interface OrderItem {
  id: number;
  quantity: string; // e.g., '100g', '250g', '500g', '1kg'
}

// For Voice AI parsing
export interface ParsedOrderItem {
  vegetable: string;
  quantity: string;
}

export interface VoiceOrderPayload {
  transcription: string;
  items: ParsedOrderItem[];
}

// For Sales Tracking
export interface SaleItem {
  vegetableId: number;
  vegetableName: string;
  quantity: string;
  price: number; // Price at time of sale
}

export interface Sale {
  userId: string; // Corresponds to User['phone']
  date: string; // YYYY-MM-DD
  items: SaleItem[];
  total: number;
}

export interface UserWithBill extends User {
    totalBill: number;
}
