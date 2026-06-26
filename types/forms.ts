export interface CategoryFormValues {
  name: string;
  maxBudget: string;
  endDate: string;
}

export interface CategorySubmitData {
  name: string;
  maxBudget: number;
  endDate?: Date;
}

export interface TransactionSubmitData {
  amount: number;
  description: string;
  date: Date;
  type: 'income' | 'expense';
  categoryId: string;
}
