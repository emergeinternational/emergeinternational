export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      donations: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          id: string
          payment_method: string | null
          payment_status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string
          id?: string
          payment_method?: string | null
          payment_status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          id?: string
          payment_method?: string | null
          payment_status?: string
          user_id?: string
        }
        Relationships: []
      }
      education_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      education_content: {
        Row: {
          category_id: string | null
          content_type: string
          created_at: string | null
          id: string
          image_url: string | null
          is_featured: boolean
          published_at: string | null
          source_url: string | null
          summary: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          content_type: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean
          published_at?: string | null
          source_url?: string | null
          summary?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          content_type?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean
          published_at?: string | null
          source_url?: string | null
          summary?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "education_content_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "education_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      emerge_submissions: {
        Row: {
          age: number | null
          category: string
          created_at: string | null
          email: string
          full_name: string
          gender: string
          id: string
          instagram: string | null
          measurements: Json | null
          phone_number: string | null
          portfolio_url: string | null
          talent_description: string | null
          telegram: string | null
          tiktok: string | null
          updated_at: string | null
        }
        Insert: {
          age?: number | null
          category: string
          created_at?: string | null
          email: string
          full_name: string
          gender: string
          id?: string
          instagram?: string | null
          measurements?: Json | null
          phone_number?: string | null
          portfolio_url?: string | null
          talent_description?: string | null
          telegram?: string | null
          tiktok?: string | null
          updated_at?: string | null
        }
        Update: {
          age?: number | null
          category?: string
          created_at?: string | null
          email?: string
          full_name?: string
          gender?: string
          id?: string
          instagram?: string | null
          measurements?: Json | null
          phone_number?: string | null
          portfolio_url?: string | null
          talent_description?: string | null
          telegram?: string | null
          tiktok?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          capacity: number | null
          created_at: string | null
          date: string
          description: string | null
          id: string
          location: string | null
          name: string
          price: number | null
          updated_at: string | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string | null
          date: string
          description?: string | null
          id?: string
          location?: string | null
          name: string
          price?: number | null
          updated_at?: string | null
        }
        Update: {
          capacity?: number | null
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          location?: string | null
          name?: string
          price?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string
          product_name: string
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id: string
          product_name: string
          quantity: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string
          product_name?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          id: string
          payment_method: string | null
          shipping_address_id: string | null
          status: string
          total_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          payment_method?: string | null
          shipping_address_id?: string | null
          status?: string
          total_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          payment_method?: string | null
          shipping_address_id?: string | null
          status?: string
          total_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_shipping_address_id_fkey"
            columns: ["shipping_address_id"]
            isOneToOne: false
            referencedRelation: "shipping_addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string | null
          fashion_style: string | null
          favorite_brands: string[] | null
          full_name: string | null
          id: string
          industry: string | null
          language: string | null
          linkedin_url: string | null
          phone_number: string | null
          preferred_shopping_locations: string[] | null
          profession: string | null
          role: string | null
          size_preferences: Json | null
          social_media_handle: string | null
          telegram_name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          fashion_style?: string | null
          favorite_brands?: string[] | null
          full_name?: string | null
          id: string
          industry?: string | null
          language?: string | null
          linkedin_url?: string | null
          phone_number?: string | null
          preferred_shopping_locations?: string[] | null
          profession?: string | null
          role?: string | null
          size_preferences?: Json | null
          social_media_handle?: string | null
          telegram_name?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          fashion_style?: string | null
          favorite_brands?: string[] | null
          full_name?: string | null
          id?: string
          industry?: string | null
          language?: string | null
          linkedin_url?: string | null
          phone_number?: string | null
          preferred_shopping_locations?: string[] | null
          profession?: string | null
          role?: string | null
          size_preferences?: Json | null
          social_media_handle?: string | null
          telegram_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      shipping_addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          country: string
          created_at: string | null
          id: string
          is_default: boolean | null
          postal_code: string
          state: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city: string
          country: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          postal_code: string
          state: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          country?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          postal_code?: string
          state?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      talent_applications: {
        Row: {
          age: number | null
          category_type: string | null
          country: string | null
          created_at: string | null
          demo_reel_url: string | null
          dress_size: string | null
          email: string
          experience_level: string | null
          experience_years: number | null
          full_name: string
          height: number | null
          id: string
          languages_spoken: string[] | null
          measurements: Json | null
          notes: string | null
          phone: string | null
          photo_url: string | null
          portfolio_url: string | null
          shoe_size: string | null
          skills: string[] | null
          social_media: Json | null
          status: Database["public"]["Enums"]["talent_status"] | null
          travel_availability: string | null
          updated_at: string | null
          user_id: string | null
          weight: number | null
        }
        Insert: {
          age?: number | null
          category_type?: string | null
          country?: string | null
          created_at?: string | null
          demo_reel_url?: string | null
          dress_size?: string | null
          email: string
          experience_level?: string | null
          experience_years?: number | null
          full_name: string
          height?: number | null
          id?: string
          languages_spoken?: string[] | null
          measurements?: Json | null
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          portfolio_url?: string | null
          shoe_size?: string | null
          skills?: string[] | null
          social_media?: Json | null
          status?: Database["public"]["Enums"]["talent_status"] | null
          travel_availability?: string | null
          updated_at?: string | null
          user_id?: string | null
          weight?: number | null
        }
        Update: {
          age?: number | null
          category_type?: string | null
          country?: string | null
          created_at?: string | null
          demo_reel_url?: string | null
          dress_size?: string | null
          email?: string
          experience_level?: string | null
          experience_years?: number | null
          full_name?: string
          height?: number | null
          id?: string
          languages_spoken?: string[] | null
          measurements?: Json | null
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          portfolio_url?: string | null
          shoe_size?: string | null
          skills?: string[] | null
          social_media?: Json | null
          status?: Database["public"]["Enums"]["talent_status"] | null
          travel_availability?: string | null
          updated_at?: string | null
          user_id?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workshops: {
        Row: {
          created_at: string | null
          date: string
          description: string | null
          id: string
          is_archived: boolean
          location: string
          name: string
          registration_link: string | null
          spots: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          description?: string | null
          id?: string
          is_archived?: boolean
          location: string
          name: string
          registration_link?: string | null
          spots?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          is_archived?: boolean
          location?: string
          name?: string
          registration_link?: string | null
          spots?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_profile: {
        Args: Record<PropertyKey, never>
        Returns: {
          avatar_url: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string | null
          fashion_style: string | null
          favorite_brands: string[] | null
          full_name: string | null
          id: string
          industry: string | null
          language: string | null
          linkedin_url: string | null
          phone_number: string | null
          preferred_shopping_locations: string[] | null
          profession: string | null
          role: string | null
          size_preferences: Json | null
          social_media_handle: string | null
          telegram_name: string | null
          updated_at: string
        }
      }
      has_role: {
        Args: { user_id: string; role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "viewer" | "user"
      talent_status: "pending" | "approved" | "rejected" | "on_hold"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "editor", "viewer", "user"],
      talent_status: ["pending", "approved", "rejected", "on_hold"],
    },
  },
} as const
