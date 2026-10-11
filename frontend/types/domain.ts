export interface ConstitutionArticle {
  article_number: string;
  part_id: string;
  part_label: string;
  title_en: string;
  title_hi: string;
  full_text_en: string;
  full_text_hi: string;
  landmark_cases: string;
  key_doctrines: string[];
  tags: string[];
}
export interface ConstitutionPart {
  id: string;
  name_en: string;
  name_hi: string;
  description: string;
}
export interface ConstitutionResearch {
  answer: string;
  sources: ConstitutionArticle[];
  mode: "source_extract" | "grounded_analysis";
  guardrail_applied: boolean;
}
export interface KnowledgeItem {
  id: number;
  item_id?: number;
  title: string;
  practice_area: string;
  abstracted_insight: string;
  status?: string;
  created_at?: string;
  approved_at?: string;
  score?: number;
}
export interface DashboardStats {
  total_captured: number;
  total_published: number;
  pending_approval: number;
  avg_time_to_publish: string;
  pii_entities_sanitized: number;
  total_audit_events: number;
}
export interface ApprovalItem extends KnowledgeItem {
  sanitized_text: string;
  pii_entities_found: { entity_type: string }[];
  author_id: number;
}
export interface Hearing {
  id: number;
  user_id: number;
  title: string;
  court: string;
  date: string;
  note: string;
}
export interface ResearchMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  cited_items?: KnowledgeItem[];
  article_sources?: ConstitutionArticle[];
  guardrail_applied?: boolean;
  isStreaming?: boolean;
  error?: boolean;
  action_type?: string;
  mode?: string;
}
