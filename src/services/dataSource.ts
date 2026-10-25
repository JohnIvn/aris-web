import { apiClient } from "@/services/apiClient";

export const isDemoMode = false;

interface ApiEnvelope<T> {
	ok?: boolean;
	data?: T;
	error?: string;
	message?: string;
}

function unwrap<T>(body: T | ApiEnvelope<T>): T {
	if (body && typeof body === "object" && ("data" in body || "ok" in body)) {
		const envelope = body as ApiEnvelope<T>;
		if (envelope.ok === false) {
			throw new Error(envelope.message ?? envelope.error ?? "The request failed.");
		}
		if ("data" in envelope) return envelope.data as T;
	}
	return body as T;
}

export async function loadResource<T>(
	endpoint: string,
	initialShape: T,
	signal?: AbortSignal,
): Promise<T> {
	const response = await apiClient.get<T | ApiEnvelope<T>>(endpoint, { signal });
	return unwrap(response.data);
}

export async function saveResource<T>(
	endpoint: string,
	payload: unknown,
	method: "POST" | "PUT" | "PATCH" | "DELETE" = "POST",
): Promise<T> {
	const response = await apiClient.request<T | ApiEnvelope<T>>({ url: endpoint, method, data: payload });
	return unwrap(response.data);
}
