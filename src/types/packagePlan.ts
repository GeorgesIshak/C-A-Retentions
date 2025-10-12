export interface Package {
  id: string;
  name: string;
  durationDays: number;
  smsCount: number;
  emailCount: number;
  price: number;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
