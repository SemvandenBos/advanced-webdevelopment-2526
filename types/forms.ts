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
