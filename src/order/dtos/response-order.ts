import { Decimal, JsonValue } from '@prisma/client/runtime/library';

export type ResponseOrder = {
  userId: string;
  description: string;
  status: string;
  amount: Decimal;
  location: JsonValue;
  createdAt: Date;
};
