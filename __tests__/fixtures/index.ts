import { Huishoudboekje, Transaction, Category, AppUser } from '@/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ts = (date: Date): any => ({ toDate: () => date })

export const mockBook: Huishoudboekje = {
  id: 'book-1',
  name: 'Testboekje',
  description: 'Een testomschrijving',
  ownerUid: 'user-1',
  members: ['user-1', 'user-2'],
  archived: false,
  createdAt: ts(new Date('2024-01-01')),
}

export const mockTransaction: Transaction = {
  id: 'tx-1',
  amount: 42.5,
  description: 'Boodschappen',
  date: ts(new Date('2025-03-15')),
  type: 'expense',
  categoryId: 'cat-1',
  createdBy: 'user-1',
  createdAt: ts(new Date('2025-03-15')),
}

export const mockIncomeTransaction: Transaction = {
  id: 'tx-2',
  amount: 2000,
  description: 'Salaris',
  date: ts(new Date('2025-03-01')),
  type: 'income',
  categoryId: undefined,
  createdBy: 'user-1',
  createdAt: ts(new Date('2025-03-01')),
}

export const mockCategory: Category = {
  id: 'cat-1',
  name: 'Boodschappen',
  maxBudget: 300,
  createdAt: ts(new Date('2024-01-01')),
}

export const mockCategory2: Category = {
  id: 'cat-2',
  name: 'Transport',
  maxBudget: 150,
  createdAt: ts(new Date('2024-01-01')),
}

export const mockUser: AppUser = {
  uid: 'user-1',
  email: 'test@example.com',
  displayName: 'Test User',
  createdAt: ts(new Date('2024-01-01')),
}

export const mockMember: AppUser = {
  uid: 'user-2',
  email: 'member@example.com',
  displayName: 'Member User',
  createdAt: ts(new Date('2024-01-01')),
}
