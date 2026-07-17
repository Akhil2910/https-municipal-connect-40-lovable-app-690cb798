import type { Database } from "@/integrations/supabase/types";

export type Ulb = Database["public"]["Tables"]["ulbs"]["Row"];
export type Banner = Database["public"]["Tables"]["banners"]["Row"];
export type News = Database["public"]["Tables"]["news"]["Row"];
export type Notice = Database["public"]["Tables"]["notices"]["Row"];
export type Department = Database["public"]["Tables"]["departments"]["Row"];
export type Tender = Database["public"]["Tables"]["tenders"]["Row"];
export type Gallery = Database["public"]["Tables"]["gallery"]["Row"];
export type ServiceInfo = Database["public"]["Tables"]["services_info"]["Row"];
export type Leadership = Database["public"]["Tables"]["leadership"]["Row"];
export type Grievance = Database["public"]["Tables"]["grievances"]["Row"];
export type CouncilMember = Database["public"]["Tables"]["council_members"]["Row"];
export type CoOptionMember = Database["public"]["Tables"]["co_option_members"]["Row"];
export type PublicRepresentative = Database["public"]["Tables"]["public_representatives"]["Row"];
export type Page = Database["public"]["Tables"]["pages"]["Row"];