export type CreateOrderDTO = {
  userId: string;

  description: string;

  amount: number;

  status: string;

  location: LocationDTO;
};

export type LocationDTO = {
  latitude: number;
  longitude: number;
};
