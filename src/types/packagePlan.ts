export type Package = {
  id: string;
  name: string;
  description: string | null;
  durationDays: number;
  smsCount: number;
  emailCount: number;
  whatsappCount: number;
  price: number;           // keep as number client-side
  isActive: boolean;
  createdAt: string;       // ISO
  updatedAt: string;       // ISO
  priceId: string | null;  // NEW
};
