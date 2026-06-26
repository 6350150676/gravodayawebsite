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
        Row: { id: string; email: string; created_at: string };
        Insert: { id: string; email: string };
        Update: { id?: string; email?: string };
        Relationships: [];
      };
      cities: {
        Row: { id: number; name: string; slug: string; tagline: string | null; image_url: string | null; sort_order: number };
        Insert: { name: string; slug: string; tagline?: string | null; image_url?: string | null; sort_order?: number };
        Update: { name?: string; slug?: string; tagline?: string | null; image_url?: string | null; sort_order?: number };
        Relationships: [];
      };
      localities: {
        Row: { id: number; city_id: number; name: string; slug: string };
        Insert: { city_id: number; name: string; slug: string };
        Update: { city_id?: number; name?: string; slug?: string };
        Relationships: [];
      };
      property_categories: {
        Row: { id: number; name: string; slug: string };
        Insert: { name: string; slug: string };
        Update: { name?: string; slug?: string };
        Relationships: [];
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
        Insert: {
          slug: string;
          title: string;
          description: string;
          price: number;
          price_label?: string | null;
          category_id: number;
          city_id: number;
          locality_id?: number | null;
          address?: string | null;
          area_sqft?: number | null;
          bedrooms?: number | null;
          bathrooms?: number | null;
          amenities?: string[];
          is_for_rent?: boolean;
          is_featured?: boolean;
          status?: PropertyStatus;
          map_lat?: number | null;
          map_lng?: number | null;
        };
        Update: {
          slug?: string;
          title?: string;
          description?: string;
          price?: number;
          price_label?: string | null;
          category_id?: number;
          city_id?: number;
          locality_id?: number | null;
          address?: string | null;
          area_sqft?: number | null;
          bedrooms?: number | null;
          bathrooms?: number | null;
          amenities?: string[];
          is_for_rent?: boolean;
          is_featured?: boolean;
          status?: PropertyStatus;
          map_lat?: number | null;
          map_lng?: number | null;
        };
        Relationships: [];
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
        Insert: {
          property_id: string;
          storage_path: string;
          is_cover?: boolean;
          sort_order?: number;
        };
        Update: {
          property_id?: string;
          storage_path?: string;
          is_cover?: boolean;
          sort_order?: number;
        };
        Relationships: [];
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
        Insert: {
          property_id?: string | null;
          name: string;
          phone: string;
          email?: string | null;
          message?: string | null;
          status?: InquiryStatus;
        };
        Update: {
          property_id?: string | null;
          name?: string;
          phone?: string;
          email?: string | null;
          message?: string | null;
          status?: InquiryStatus;
        };
        Relationships: [];
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
        Insert: {
          name: string;
          phone: string;
          email?: string | null;
          property_type: string;
          city: string;
          locality?: string | null;
          description?: string | null;
          asking_price?: number | null;
          status?: SubmissionStatus;
          admin_notes?: string | null;
        };
        Update: {
          name?: string;
          phone?: string;
          email?: string | null;
          property_type?: string;
          city?: string;
          locality?: string | null;
          description?: string | null;
          asking_price?: number | null;
          status?: SubmissionStatus;
          admin_notes?: string | null;
        };
        Relationships: [];
      };
      submission_images: {
        Row: { id: string; submission_id: string; storage_path: string; created_at: string };
        Insert: { submission_id: string; storage_path: string };
        Update: { submission_id?: string; storage_path?: string };
        Relationships: [];
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
        Insert: {
          name: string;
          phone: string;
          email?: string | null;
          message: string;
        };
        Update: {
          name?: string;
          phone?: string;
          email?: string | null;
          message?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: { key: string; value: string | null; updated_at: string };
        Insert: { key: string; value?: string | null };
        Update: { key?: string; value?: string | null };
        Relationships: [];
      };
      site_stats: {
        Row: { id: number; label: string; value: number; suffix: string; sort_order: number };
        Insert: { label: string; value?: number; suffix?: string; sort_order?: number };
        Update: { id?: number; label?: string; value?: number; suffix?: string; sort_order?: number };
        Relationships: [];
      };
      site_features: {
        Row: { id: number; text: string; sort_order: number };
        Insert: { text: string; sort_order?: number };
        Update: { id?: number; text?: string; sort_order?: number };
        Relationships: [];
      };
      intent_cards: {
        Row: {
          id: number;
          title: string;
          subtitle: string | null;
          description: string | null;
          cta: string | null;
          href: string;
          image_url: string | null;
          accent: string;
          sort_order: number;
        };
        Insert: {
          title: string;
          subtitle?: string | null;
          description?: string | null;
          cta?: string | null;
          href?: string;
          image_url?: string | null;
          accent?: string;
          sort_order?: number;
        };
        Update: {
          id?: number;
          title?: string;
          subtitle?: string | null;
          description?: string | null;
          cta?: string | null;
          href?: string;
          image_url?: string | null;
          accent?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
