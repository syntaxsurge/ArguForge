/* ---------- Generic response helpers ---------- */
export type SuccessResponse<T = Record<string, unknown>> = { success: true } & T;
export interface ErrorResponse {
  success: false;
  error: string;
  fingerprint?: string;
  request_id?: string;
}
export type ApiResponse<T = Record<string, unknown>> =
  | SuccessResponse<T>
  | ErrorResponse;

/* ---------- Invite redemption ---------- */
export interface InviteRedeemSuccess {
  apiKey: string;
  organizationID: string;
  validUntil: string | null;
}
export type InviteRedeemResponse = ApiResponse<InviteRedeemSuccess>;

/* ---------- Chat completions ---------- */
export interface ChatCompletionRequest {
  content: string;
  skip_chat_history?: boolean;
  source?: "discord" | "telegram" | "embed" | "web" | "telegram_autopilot";
  /** Additional raw payload keys are allowed but omitted for brevity */
  [key: string]: unknown;
}
export interface ChatCompletionSuccess {
  content: string;
}
export type ChatCompletionResponse = ApiResponse<ChatCompletionSuccess>;

/* ---------- Replica listing ---------- */
export interface Replica {
  uuid: string;
  name: string;
  slug: string;
  tags: string[];
  owner_uuid: string;
  profileImage?: string;
  /** Other optional Sensay fields are omitted for brevity */
}
export interface ListReplicasSuccess {
  items: Replica[];
  total: number;
}
export type ListReplicasResponse = ApiResponse<ListReplicasSuccess>;

/* ---------- Create replica ---------- */
export interface CreateReplicaSuccess {
  uuid: string;
}
export type CreateReplicaResponse = ApiResponse<CreateReplicaSuccess>;