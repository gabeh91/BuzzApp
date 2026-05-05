export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Interest {
  id: string;
  name: string;
  slug: string;
  category: string;
}
