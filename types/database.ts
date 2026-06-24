export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PropertyStatus = "active" | "sold" | "rented" | "inactive";
export type InquiryStatus = "new" | "contacted" | "closed";
export type SubmissionStatus = "pending" | "approved" | "rejected" | "published";

export interface Database {
  public: {
    Tables: {
      admins: {
        Row: {
          id: string;
          email: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["admins"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["admins"]["Insert"]>;
      };
      cities: {
        Row: {
          id: number;
          name: string;
          slug: string;
        };
        Insert: Omit<Database["public"]["Tables"]["cities"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["cities"]["Insert"]>;
      };
      localities: {
        Row: {
          id: number;
          city_id: number;
          name: string;
          slug: string;
        };
        Insert: Omit<Database["public"]["Tables"]["localities"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["localities"]["Insert"]>;
      };
      property_categories: {
        Row: {
          id: number;
          name: string;
          slug: string;
        };
        Insert: Omit<Database["public"]["Tables"]["property_categories"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["property_categories"]["Insert"]>;
      };
      properties: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string;
          price: number;
          price_label: string | null;
          category_id: number;
          city_id: number;
          locality_id: number | null;
          address: string | null;
          area_sqft: number | null;
          bedrooms: number | null;
          bathrooms: number | null;
          amenities: string[];
          is_for_rent: boolean;
          is_featured: boolean;
          status: PropertyStatus;
          map_lat: number | null;
          map_lng: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["properties"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["properties"]["Insert"]>;
      };
      property_images: {
        Row: {
          id: string;
          property_id: string;
          storage_path: string;
          is_cover: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["property_images"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["property_images"]["Insert"]>;
      };
      inquiries: {
        Row: {
          id: string;
          property_id: string | null;
          name: string;
          phone: string;
          email: string | null;
          message: string | null;
          status: InquiryStatus;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["inquiries"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["inquiries"]["Insert"]>;
      };
      seller_submissions: {
        Row: {
          id: string;
          name: string;
          phone: string;
          email: string | null;
          property_type: string;
          city: string;
          locality: string | null;
          description: string | null;
          asking_price: number | null;
          status: SubmissionStatus;
          admin_notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["seller_submissions"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["seller_submissions"]["Insert"]>;
      };
      submission_images: {
        Row: {
          id: string;
          submission_id: string;
          storage_path: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["submission_images"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["submission_images"]["Insert"]>;
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          phone: string;
          email: string | null;
          message: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["contact_messages"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["contact_messages"]["Insert"]>;
      };
    };
  };
}
