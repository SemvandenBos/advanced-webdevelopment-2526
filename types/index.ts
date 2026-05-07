import { Timestamp } from "firebase/firestore";

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Timestamp;
}

export interface Huishoudboekje {
  id: string;
  name: string;
  description: string;
  ownerUid: string;
  members: string[];
  archived: boolean;
  createdAt: Timestamp;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: Timestamp;
  categoryId: string;
  type: 'income' | 'expense';
  createdBy: string;
  createdAt: Timestamp;
}

export interface Category {
  id: string;
  name: string;
  maxBudget: number;
  endDate?: Timestamp;
  createdAt: Timestamp;
}