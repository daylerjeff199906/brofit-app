export type Gym = {
  id: string;
  slug: string;
  name: string;
  district: string;
  address: string;
  category: string;
  equipment: string[];
  services: string[];
  price: number;
  hours: string;
  image: string;
  description: string;
  demo: true;
};
export type Plan = {
  id: string;
  name: string;
  price: number;
  visits: number;
  days: number;
  description: string;
  conditions: string[];
  demo: true;
};
