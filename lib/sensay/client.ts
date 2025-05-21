import { sensayHeaders } from "@/lib/config/sensay";
import type {
  ApiResponse,
  InviteRedeemResponse,
  ChatCompletionRequest,
  ChatCompletionResponse,
  ListReplicasResponse,
  CreateReplicaResponse,
} from "@/lib/sensay/types";

const BASE_URL = "https://api.sensay.io";

/* ---------- Core fetch wrapper ---------- */
export async function sensayFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: sensayHeaders(init.headers as HeadersInit),
  });

  const data = (await res.json()) as T;

  // Sensay always returns { success: boolean, ... }
  // If the HTTP status is ok but success is false, treat it like an error.
  if (!("success" in (data as Record<string, unknown>))) {
    throw new Error("Malformed Sensay response");
  }

  if (res.ok) return data;

  // Cast to ApiResponse to extract error
  const err = data as ApiResponse;
  const message =
    !err.success && err.error
      ? `Sensay API error: ${err.error}`
      : `Sensay API request failed with status ${res.status}`;
  throw new Error(message);
}

/* ---------- Endpoint helpers ---------- */
export async function redeemInvite(
  code: string,
  body: {
    organizationName: string;
    name: string;
    email: string;
  },
): Promise<InviteRedeemResponse> {
  return sensayFetch<InviteRedeemResponse>(
    `/v1/api-keys/invites/${encodeURIComponent(code)}/redeem`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

export async function chatCompletion(
  replicaUUID: string,
  payload: ChatCompletionRequest,
  /**
   * If stream=true an EventSource compatible stream is returned;
   * otherwise a JSON ApiResponse is resolved.
   */
  stream = false,
): Promise<ReadableStream | ChatCompletionResponse> {
  const headers: HeadersInit = stream
    ? { Accept: "text/event-stream" }
    : { Accept: "application/json" };

  const res = await fetch(
    `${BASE_URL}/v1/replicas/${replicaUUID}/chat/completions`,
    {
      method: "POST",
      headers: sensayHeaders(headers),
      body: JSON.stringify(payload),
    },
  );

  if (stream) {
    if (!res.body) throw new Error("Missing response body stream");
    return res.body as ReadableStream;
  }

  const json = (await res.json()) as ChatCompletionResponse;
  return json;
}

export async function listReplicas(
  params?: Partial<{
    owner_uuid: string;
    page_index: number;
    page_size: number;
    search: string;
    tags: string | string[];
  }>,
): Promise<ListReplicasResponse> {
  const qs =
    params && Object.keys(params).length
      ? "?" +
        new URLSearchParams(
          Object.entries(params).flatMap(([k, v]) =>
            Array.isArray(v) ? v.map((vv) => [k, String(vv)]) : [[k, String(v)]],
          ),
        ).toString()
      : "";
  return sensayFetch<ListReplicasResponse>(`/v1/replicas${qs}`);
}

export async function createReplica(
  body: Record<string, unknown>,
): Promise<CreateReplicaResponse> {
  return sensayFetch<CreateReplicaResponse>("/v1/replicas", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/* ---------- Re-exports ---------- */
export { type Replica } from "@/lib/sensay/types";