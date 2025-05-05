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
      audit_logs: {
        Row: {
          action: string
          admin_id: string
          details: Json | null
          id: string
          timestamp: string
          user_id: string | null
        }
        Insert: {
          action: string
          admin_id: string
          details?: Json | null
          id?: string
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          details?: Json | null
          id?: string
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      automation_logs: {
        Row: {
          created_at: string | null
          executed_at: string
          function_name: string
          id: string
          results: Json | null
        }
        Insert: {
          created_at?: string | null
          executed_at?: string
          function_name: string
          id?: string
          results?: Json | null
        }
        Update: {
          created_at?: string | null
          executed_at?: string
          function_name?: string
          id?: string
          results?: Json | null
        }
        Relationships: []
      }
      certificate_eligibility: {
        Row: {
          admin_approved: boolean
          created_at: string | null
          id: string
          is_eligible: boolean
          online_courses_completed: number
          status: Database["public"]["Enums"]["certificate_status"]
          updated_at: string | null
          user_id: string
          workshops_completed: number
        }
        Insert: {
          admin_approved?: boolean
          created_at?: string | null
          id?: string
          is_eligible?: boolean
          online_courses_completed?: number
          status?: Database["public"]["Enums"]["certificate_status"]
          updated_at?: string | null
          user_id: string
          workshops_completed?: number
        }
        Update: {
          admin_approved?: boolean
          created_at?: string | null
          id?: string
          is_eligible?: boolean
          online_courses_completed?: number
          status?: Database["public"]["Enums"]["certificate_status"]
          updated_at?: string | null
          user_id?: string
          workshops_completed?: number
        }
        Relationships: [
          {
            foreignKeyName: "certificate_eligibility_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      certificate_settings: {
        Row: {
          created_at: string | null
          id: string
          min_courses_required: number
          min_workshops_required: number
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          min_courses_required?: number
          min_workshops_required?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          min_courses_required?: number
          min_workshops_required?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      collections: {
        Row: {
          created_at: string | null
          description: string | null
          designer_name: string
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          designer_name: string
          id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          designer_name?: string
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      course_engagement: {
        Row: {
          course_id: string
          created_at: string | null
          id: string
          last_click_date: string | null
          total_clicks: number | null
          updated_at: string | null
        }
        Insert: {
          course_id: string
          created_at?: string | null
          id?: string
          last_click_date?: string | null
          total_clicks?: number | null
          updated_at?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string | null
          id?: string
          last_click_date?: string | null
          total_clicks?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      courses: {
        Row: {
          category: Database["public"]["Enums"]["career_path"]
          created_at: string | null
          external_link: string | null
          hosting_type: Database["public"]["Enums"]["hosting_type"]
          id: string
          image_url: string | null
          is_published: boolean
          price: number | null
          summary: string | null
          title: string
          updated_at: string | null
          video_embed_url: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["career_path"]
          created_at?: string | null
          external_link?: string | null
          hosting_type?: Database["public"]["Enums"]["hosting_type"]
          id?: string
          image_url?: string | null
          is_published?: boolean
          price?: number | null
          summary?: string | null
          title: string
          updated_at?: string | null
          video_embed_url?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["career_path"]
          created_at?: string | null
          external_link?: string | null
          hosting_type?: Database["public"]["Enums"]["hosting_type"]
          id?: string
          image_url?: string | null
          is_published?: boolean
          price?: number | null
          summary?: string | null
          title?: string
          updated_at?: string | null
          video_embed_url?: string | null
        }
        Relationships: []
      }
      currencies: {
        Row: {
          code: string
          created_at: string
          exchange_rate: number
          id: string
          is_active: boolean
          name: string
          symbol: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          exchange_rate?: number
          id?: string
          is_active?: boolean
          name: string
          symbol: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          exchange_rate?: number
          id?: string
          is_active?: boolean
          name?: string
          symbol?: string
          updated_at?: string
        }
        Relationships: []
      }
      designers: {
        Row: {
          achievements: string[] | null
          bio: string | null
          category: Database["public"]["Enums"]["creator_category"]
          created_at: string | null
          email: string | null
          featured: boolean
          featured_project: Json | null
          full_name: string
          id: string
          image_url: string | null
          location: string | null
          portfolio_url: string | null
          products: string[] | null
          revenue: number | null
          sales_count: number | null
          showcase_images: string[] | null
          social_media: Json | null
          specialty: Database["public"]["Enums"]["designer_category"]
          updated_at: string | null
        }
        Insert: {
          achievements?: string[] | null
          bio?: string | null
          category?: Database["public"]["Enums"]["creator_category"]
          created_at?: string | null
          email?: string | null
          featured?: boolean
          featured_project?: Json | null
          full_name: string
          id?: string
          image_url?: string | null
          location?: string | null
          portfolio_url?: string | null
          products?: string[] | null
          revenue?: number | null
          sales_count?: number | null
          showcase_images?: string[] | null
          social_media?: Json | null
          specialty: Database["public"]["Enums"]["designer_category"]
          updated_at?: string | null
        }
        Update: {
          achievements?: string[] | null
          bio?: string | null
          category?: Database["public"]["Enums"]["creator_category"]
          created_at?: string | null
          email?: string | null
          featured?: boolean
          featured_project?: Json | null
          full_name?: string
          id?: string
          image_url?: string | null
          location?: string | null
          portfolio_url?: string | null
          products?: string[] | null
          revenue?: number | null
          sales_count?: number | null
          showcase_images?: string[] | null
          social_media?: Json | null
          specialty?: Database["public"]["Enums"]["designer_category"]
          updated_at?: string | null
        }
        Relationships: []
      }
      discount_codes: {
        Row: {
          code: string
          created_at: string
          current_uses: number
          discount_amount: number | null
          discount_percent: number | null
          event_id: string
          id: string
          is_active: boolean
          max_uses: number | null
          updated_at: string
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string
          current_uses?: number
          discount_amount?: number | null
          discount_percent?: number | null
          event_id: string
          id?: string
          is_active?: boolean
          max_uses?: number | null
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          current_uses?: number
          discount_amount?: number | null
          discount_percent?: number | null
          event_id?: string
          id?: string
          is_active?: boolean
          max_uses?: number | null
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discount_codes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      donation_page_settings: {
        Row: {
          created_at: string | null
          currency_options: string[] | null
          hero_description: string | null
          hero_image_url: string | null
          hero_title: string
          id: string
          is_active: boolean | null
          max_donation_amount: number | null
          min_donation_amount: number | null
          payment_methods: string[] | null
          suggested_amounts: number[] | null
          thank_you_message: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          currency_options?: string[] | null
          hero_description?: string | null
          hero_image_url?: string | null
          hero_title?: string
          id?: string
          is_active?: boolean | null
          max_donation_amount?: number | null
          min_donation_amount?: number | null
          payment_methods?: string[] | null
          suggested_amounts?: number[] | null
          thank_you_message?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          currency_options?: string[] | null
          hero_description?: string | null
          hero_image_url?: string | null
          hero_title?: string
          id?: string
          is_active?: boolean | null
          max_donation_amount?: number | null
          min_donation_amount?: number | null
          payment_methods?: string[] | null
          suggested_amounts?: number[] | null
          thank_you_message?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount: number
          certificate_issued: boolean | null
          certificate_url: string | null
          created_at: string | null
          currency: string
          donor_id: string | null
          id: string
          message: string | null
          payment_method: string | null
          payment_proof_url: string | null
          payment_status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          certificate_issued?: boolean | null
          certificate_url?: string | null
          created_at?: string | null
          currency?: string
          donor_id?: string | null
          id?: string
          message?: string | null
          payment_method?: string | null
          payment_proof_url?: string | null
          payment_status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          certificate_issued?: boolean | null
          certificate_url?: string | null
          created_at?: string | null
          currency?: string
          donor_id?: string | null
          id?: string
          message?: string | null
          payment_method?: string | null
          payment_proof_url?: string | null
          payment_status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "donations_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donors"
            referencedColumns: ["id"]
          },
        ]
      }
      donors: {
        Row: {
          address: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          last_donation_date: string | null
          phone: string | null
          total_donations: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          last_donation_date?: string | null
          phone?: string | null
          total_donations?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          last_donation_date?: string | null
          phone?: string | null
          total_donations?: number | null
          updated_at?: string | null
          user_id?: string | null
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
          archive_date: string | null
          category_id: string | null
          content_type: string
          created_at: string | null
          id: string
          image_theme: string | null
          image_url: string | null
          image_validated: boolean | null
          is_archived: boolean | null
          is_featured: boolean
          published_at: string | null
          source_url: string | null
          summary: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          archive_date?: string | null
          category_id?: string | null
          content_type: string
          created_at?: string | null
          id?: string
          image_theme?: string | null
          image_url?: string | null
          image_validated?: boolean | null
          is_archived?: boolean | null
          is_featured?: boolean
          published_at?: string | null
          source_url?: string | null
          summary?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          archive_date?: string | null
          category_id?: string | null
          content_type?: string
          created_at?: string | null
          id?: string
          image_theme?: string | null
          image_url?: string | null
          image_validated?: boolean | null
          is_archived?: boolean | null
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
          sync_status: string | null
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
          sync_status?: string | null
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
          sync_status?: string | null
          talent_description?: string | null
          telegram?: string | null
          tiktok?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          amount: number
          created_at: string
          currency_code: string | null
          event_id: string
          exchange_rate: number | null
          id: string
          original_amount: number | null
          payment_method_id: string | null
          payment_proof_url: string | null
          payment_status: string
          ticket_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency_code?: string | null
          event_id: string
          exchange_rate?: number | null
          id?: string
          original_amount?: number | null
          payment_method_id?: string | null
          payment_proof_url?: string | null
          payment_status?: string
          ticket_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency_code?: string | null
          event_id?: string
          exchange_rate?: number | null
          id?: string
          original_amount?: number | null
          payment_method_id?: string | null
          payment_proof_url?: string | null
          payment_status?: string
          ticket_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          capacity: number | null
          category: string | null
          created_at: string | null
          currency_code: string
          date: string
          description: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          location: string | null
          max_tickets: number | null
          name: string
          organizer_id: string | null
          price: number | null
          status: Database["public"]["Enums"]["event_status"] | null
          updated_at: string | null
        }
        Insert: {
          capacity?: number | null
          category?: string | null
          created_at?: string | null
          currency_code?: string
          date: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          location?: string | null
          max_tickets?: number | null
          name: string
          organizer_id?: string | null
          price?: number | null
          status?: Database["public"]["Enums"]["event_status"] | null
          updated_at?: string | null
        }
        Update: {
          capacity?: number | null
          category?: string | null
          created_at?: string | null
          currency_code?: string
          date?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          location?: string | null
          max_tickets?: number | null
          name?: string
          organizer_id?: string | null
          price?: number | null
          status?: Database["public"]["Enums"]["event_status"] | null
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
      payment_instructions: {
        Row: {
          created_at: string | null
          id: string
          instructions: string
          merchant_code: string | null
          merchant_code_label: string | null
          payment_method: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          instructions: string
          merchant_code?: string | null
          merchant_code_label?: string | null
          payment_method: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          instructions?: string
          merchant_code?: string | null
          merchant_code_label?: string | null
          payment_method?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          countries: string[] | null
          created_at: string
          description: string | null
          id: string
          instructions: string | null
          is_active: boolean
          name: string
          requires_verification: boolean
          updated_at: string
        }
        Insert: {
          countries?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean
          name: string
          requires_verification?: boolean
          updated_at?: string
        }
        Update: {
          countries?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean
          name?: string
          requires_verification?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      premium_course_enrollments: {
        Row: {
          course_id: string
          created_at: string | null
          id: string
          last_activity_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string | null
          id?: string
          last_activity_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string | null
          id?: string
          last_activity_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "premium_course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "premium_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      premium_courses: {
        Row: {
          category: Database["public"]["Enums"]["course_category"]
          created_at: string | null
          created_by: string | null
          end_date: string | null
          has_active_students: boolean
          hosting_type: Database["public"]["Enums"]["course_hosting_type"]
          id: string
          image_path: string | null
          is_published: boolean
          level: Database["public"]["Enums"]["course_level"]
          price: number | null
          start_date: string | null
          student_capacity: number
          summary: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["course_category"]
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          has_active_students?: boolean
          hosting_type?: Database["public"]["Enums"]["course_hosting_type"]
          id?: string
          image_path?: string | null
          is_published?: boolean
          level?: Database["public"]["Enums"]["course_level"]
          price?: number | null
          start_date?: string | null
          student_capacity?: number
          summary?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["course_category"]
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          has_active_students?: boolean
          hosting_type?: Database["public"]["Enums"]["course_hosting_type"]
          id?: string
          image_path?: string | null
          is_published?: boolean
          level?: Database["public"]["Enums"]["course_level"]
          price?: number | null
          start_date?: string | null
          student_capacity?: number
          summary?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      product_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          product_id: string
          status: Database["public"]["Enums"]["product_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          product_id: string
          status: Database["public"]["Enums"]["product_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          product_id?: string
          status?: Database["public"]["Enums"]["product_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_notifications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "shop_products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variations: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          price: number | null
          product_id: string
          size: string | null
          sku: string
          stock_quantity: number
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          price?: number | null
          product_id: string
          size?: string | null
          sku: string
          stock_quantity?: number
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          price?: number | null
          product_id?: string
          size?: string | null
          sku?: string
          stock_quantity?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: Database["public"]["Enums"]["product_category"]
          created_at: string | null
          description: string | null
          designer_id: string | null
          dimensions: Json | null
          id: string
          image_url: string | null
          in_stock: boolean
          is_published: boolean
          price: number
          revenue: number | null
          sales_count: number | null
          shipping_info: Json | null
          sku: string | null
          stock_quantity: number | null
          title: string
          updated_at: string | null
          variations: Json[] | null
          weight: number | null
        }
        Insert: {
          category: Database["public"]["Enums"]["product_category"]
          created_at?: string | null
          description?: string | null
          designer_id?: string | null
          dimensions?: Json | null
          id?: string
          image_url?: string | null
          in_stock?: boolean
          is_published?: boolean
          price?: number
          revenue?: number | null
          sales_count?: number | null
          shipping_info?: Json | null
          sku?: string | null
          stock_quantity?: number | null
          title: string
          updated_at?: string | null
          variations?: Json[] | null
          weight?: number | null
        }
        Update: {
          category?: Database["public"]["Enums"]["product_category"]
          created_at?: string | null
          description?: string | null
          designer_id?: string | null
          dimensions?: Json | null
          id?: string
          image_url?: string | null
          in_stock?: boolean
          is_published?: boolean
          price?: number
          revenue?: number | null
          sales_count?: number | null
          shipping_info?: Json | null
          sku?: string | null
          stock_quantity?: number | null
          title?: string
          updated_at?: string | null
          variations?: Json[] | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_designer_id_fkey"
            columns: ["designer_id"]
            isOneToOne: false
            referencedRelation: "designers"
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
          is_active: boolean | null
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
          is_active?: boolean | null
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
          is_active?: boolean | null
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
      scraped_courses: {
        Row: {
          category: Database["public"]["Enums"]["course_category"]
          created_at: string | null
          external_link: string | null
          hosting_type: Database["public"]["Enums"]["course_hosting_type"]
          id: string
          image_url: string | null
          is_approved: boolean
          is_reviewed: boolean
          level: Database["public"]["Enums"]["course_level"]
          review_notes: string | null
          scraper_source: string
          summary: string | null
          title: string
          updated_at: string | null
          video_embed_url: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["course_category"]
          created_at?: string | null
          external_link?: string | null
          hosting_type: Database["public"]["Enums"]["course_hosting_type"]
          id?: string
          image_url?: string | null
          is_approved?: boolean
          is_reviewed?: boolean
          level: Database["public"]["Enums"]["course_level"]
          review_notes?: string | null
          scraper_source: string
          summary?: string | null
          title: string
          updated_at?: string | null
          video_embed_url?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["course_category"]
          created_at?: string | null
          external_link?: string | null
          hosting_type?: Database["public"]["Enums"]["course_hosting_type"]
          id?: string
          image_url?: string | null
          is_approved?: boolean
          is_reviewed?: boolean
          level?: Database["public"]["Enums"]["course_level"]
          review_notes?: string | null
          scraper_source?: string
          summary?: string | null
          title?: string
          updated_at?: string | null
          video_embed_url?: string | null
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
      shop_metadata: {
        Row: {
          action_type: string
          created_at: string
          field_name: string | null
          id: string
          new_value: Json | null
          old_value: Json | null
          product_id: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          field_name?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          product_id?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          field_name?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          product_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_metadata_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "shop_products"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_product_snapshots: {
        Row: {
          created_at: string
          created_by: string
          id: string
          product_count: number
          snapshot_file_path: string
          version: number
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          product_count: number
          snapshot_file_path: string
          version: number
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          product_count?: number
          snapshot_file_path?: string
          version?: number
        }
        Relationships: []
      }
      shop_products: {
        Row: {
          category: string | null
          collection_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          image_url: string | null
          in_stock: boolean | null
          price: number
          rejection_reason: string | null
          status: Database["public"]["Enums"]["product_status"]
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          collection_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          in_stock?: boolean | null
          price: number
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["product_status"]
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          collection_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          in_stock?: boolean | null
          price?: number
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["product_status"]
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shop_products_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_system_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
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
          gender: string | null
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
          sync_status: string | null
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
          gender?: string | null
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
          sync_status?: string | null
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
          gender?: string | null
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
          sync_status?: string | null
          travel_availability?: string | null
          updated_at?: string | null
          user_id?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      ticket_types: {
        Row: {
          benefits: string[]
          created_at: string | null
          description: string | null
          event_id: string | null
          id: string
          name: string
          price: number
          quantity: number
          tickets_sold: number | null
          updated_at: string | null
        }
        Insert: {
          benefits?: string[]
          created_at?: string | null
          description?: string | null
          event_id?: string | null
          id?: string
          name: string
          price?: number
          quantity?: number
          tickets_sold?: number | null
          updated_at?: string | null
        }
        Update: {
          benefits?: string[]
          created_at?: string | null
          description?: string | null
          event_id?: string | null
          id?: string
          name?: string
          price?: number
          quantity?: number
          tickets_sold?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_types_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      user_certificates: {
        Row: {
          certificate_file: string | null
          course_title: string
          created_at: string | null
          expiry_date: string | null
          id: string
          issue_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          certificate_file?: string | null
          course_title: string
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          certificate_file?: string | null
          course_title?: string
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_course_progress: {
        Row: {
          course_category: string | null
          course_id: string
          created_at: string | null
          date_completed: string | null
          date_started: string | null
          id: string
          progress: number | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          course_category?: string | null
          course_id: string
          created_at?: string | null
          date_completed?: string | null
          date_started?: string | null
          id?: string
          progress?: number | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          course_category?: string | null
          course_id?: string
          created_at?: string | null
          date_completed?: string | null
          date_started?: string | null
          id?: string
          progress?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
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
      registration_system_diagnostics: {
        Row: {
          handle_new_user_exists: boolean | null
          on_auth_user_created_exists: boolean | null
          problematic_function_removed: boolean | null
          problematic_trigger_removed: boolean | null
        }
        Relationships: []
      }
      talent_sync_status: {
        Row: {
          email: string | null
          emerge_submission_id: string | null
          exists_in_talent_applications: boolean | null
          submission_date: string | null
          talent_application_id: string | null
          talent_sync_date: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_mock_products: {
        Args: { count?: number }
        Returns: {
          category: string | null
          collection_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          image_url: string | null
          in_stock: boolean | null
          price: number
          rejection_reason: string | null
          status: Database["public"]["Enums"]["product_status"]
          title: string
          updated_at: string | null
        }[]
      }
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
          is_active: boolean | null
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
      get_event_registrations: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          event_id: string
          user_id: string
          ticket_type: string
          amount: number
          payment_status: string
          payment_proof_url: string
          created_at: string
          profiles: Json
          events: Json
        }[]
      }
      get_policies_for_table: {
        Args: { table_name: string }
        Returns: {
          policyname: unknown
          permissive: string
          roles: unknown[]
          cmd: string
          qual: string
          with_check: string
        }[]
      }
      log_user_action: {
        Args: {
          action_type: string
          target_user_id: string
          action_details: Json
        }
        Returns: string
      }
      logsyncactivity: {
        Args: { function_name: string; results: Json }
        Returns: undefined
      }
    }
    Enums: {
      career_path:
        | "model"
        | "designer"
        | "photographer"
        | "videographer"
        | "musical_artist"
        | "fine_artist"
        | "event_planner"
      certificate_status:
        | "pending"
        | "approved"
        | "denied"
        | "rejected"
        | "ineligible"
      course_category:
        | "model"
        | "designer"
        | "photographer"
        | "videographer"
        | "musical_artist"
        | "fine_artist"
        | "event_planner"
      course_hosting_type: "hosted" | "embedded" | "external"
      course_level: "beginner" | "intermediate" | "expert"
      creator_category:
        | "fashion_designer"
        | "interior_designer"
        | "graphic_designer"
        | "visual_artist"
        | "photographer"
        | "event_planner"
        | "model"
        | "creative_director"
      designer_category:
        | "apparel"
        | "accessories"
        | "footwear"
        | "jewelry"
        | "other"
      event_status: "draft" | "published" | "cancelled"
      hosting_type: "hosted" | "embedded" | "external"
      product_category: "accessories" | "footwear" | "new_arrivals" | "clothing"
      product_status: "draft" | "pending" | "published" | "rejected"
      talent_status: "pending" | "approved" | "rejected" | "on_hold"
      user_role_type: "admin" | "editor" | "viewer" | "user"
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
      career_path: [
        "model",
        "designer",
        "photographer",
        "videographer",
        "musical_artist",
        "fine_artist",
        "event_planner",
      ],
      certificate_status: [
        "pending",
        "approved",
        "denied",
        "rejected",
        "ineligible",
      ],
      course_category: [
        "model",
        "designer",
        "photographer",
        "videographer",
        "musical_artist",
        "fine_artist",
        "event_planner",
      ],
      course_hosting_type: ["hosted", "embedded", "external"],
      course_level: ["beginner", "intermediate", "expert"],
      creator_category: [
        "fashion_designer",
        "interior_designer",
        "graphic_designer",
        "visual_artist",
        "photographer",
        "event_planner",
        "model",
        "creative_director",
      ],
      designer_category: [
        "apparel",
        "accessories",
        "footwear",
        "jewelry",
        "other",
      ],
      event_status: ["draft", "published", "cancelled"],
      hosting_type: ["hosted", "embedded", "external"],
      product_category: ["accessories", "footwear", "new_arrivals", "clothing"],
      product_status: ["draft", "pending", "published", "rejected"],
      talent_status: ["pending", "approved", "rejected", "on_hold"],
      user_role_type: ["admin", "editor", "viewer", "user"],
    },
  },
} as const
