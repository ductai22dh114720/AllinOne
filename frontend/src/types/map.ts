// src/types/service.ts
export interface Service {
  _id: string;
  serviceName: string;
  description: string;
  category: string;
  providerId: string;
  phone?: string;
  website?: string;
  rating?: number;
  price?: number;
  numReviews?: number;
  openingHours?: string[];
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  address: {
    formatted?: string;
    street?: string;
    city?: string;
  };
}
