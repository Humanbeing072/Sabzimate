// This file is the single source of truth for all data structures.
// It should be kept in sync with prisma/schema.prisma.

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

// Represents a user, aligned with the Prisma User model.
export interface User {
  id: string; 
  name: string | null;
  phone: string | null;
  email: string | null;
  googleId: string | null;
  // This property is used by the UI but is not in the DB schema.
  // It will be populated on the client side or passed during creation.
  address: string;
}

// Represents the data structure for vegetables as expected by the frontend UI components.
// The server is responsible for transforming the DB model into this format.
export interface Vegetable {
  id: string;
  name: {
    [Language.EN]: string;
    [Language.HI]: string;
  };
  price: number;
  unit: {
    [Language.EN]: string;
    [Language.HI]: string;
  };
  image: string | null; 
}

// Represents a single bill entry for display on the bills screen.
export interface BillEntry {
  date: string;
  items: {
    name: string;
    quantity: string;
    price: number;
  }[];
  total: number;
}

// Represents an item in an order, referencing the vegetable's string ID.
export interface OrderItem {
  id: string; // This refers to the vegetable ID
  quantity: string; // e.g., '100g', '250g', '500g', '1kg'
}

// For parsing orders from the Voice AI
export interface ParsedOrderItem {
  vegetable: string;
  quantity: string;
}

export interface VoiceOrderPayload {
  transcription: string;
  items: ParsedOrderItem[];
}

// For Sales Tracking in the Admin Panel
export interface Sale {
  userId: string;
  date: string; 
  items: {
    vegetableName: string;
    quantity: string;
    price: number;
  }[];
  total: number;
}

// Extends the base User type with their total bill for the admin sales view.
export interface UserWithBill extends User {
    totalBill: number;
}