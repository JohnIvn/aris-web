import { apiClient } from "@/services/apiClient";

export const isDemoMode = import.meta.env.VITE_DATA_MODE !== "api";

interface ApiEnvelope<T> {
	ok?: boolean;
	data?: T;
	error?: string;
	message?: string;
}

const storageKey = (endpoint: string) => `aris:demo:${endpoint}`;

function readStored<T>(endpoint: string): T | null {
	try {
		const value = localStorage.getItem(storageKey(endpoint));
		return value ? JSON.parse(value) as T : null;
	} catch {
		return null;
	}
}

function mergeDemo<T>(defaults: T, saved: unknown): T {
	if (!Array.isArray(defaults) || !Array.isArray(saved)) return (saved ?? defaults) as T;

	const keyOf = (item: Record<string, unknown>) =>
		item.id ?? item.email ?? item.reference ?? item.title ?? item.name;
	const merged = new Map<unknown, unknown>();
	for (const item of defaults) merged.set(keyOf(item), item);
	for (const item of saved) merged.set(keyOf(item), item);
	return [...merged.values()] as T;
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
	demoValue: T,
	signal?: AbortSignal,
): Promise<T> {
	if (isDemoMode) return mergeDemo(demoValue, readStored(endpoint));
	const response = await apiClient.get<T | ApiEnvelope<T>>(endpoint, { signal });
	return unwrap(response.data);
}

export async function saveResource<T>(
	endpoint: string,
	payload: unknown,
	method: "POST" | "PUT" | "PATCH" | "DELETE" = "POST",
): Promise<T> {
	if (!isDemoMode) {
		const response = await apiClient.request<T | ApiEnvelope<T>>({ url: endpoint, method, data: payload });
		return unwrap(response.data);
	}

	const key = storageKey(endpoint);
	const current = readStored<unknown[]>(endpoint) ?? [];
	let next: unknown;
	if (method === "POST" && Array.isArray(current)) {
		next = [payload, ...current];
	} else if ((method === "PUT" || method === "PATCH") && Array.isArray(current) && payload && typeof payload === "object") {
		const incoming = payload as Record<string, unknown>;
		const identity = incoming.id ?? incoming.email ?? incoming.reference;
		next = identity == null
			? payload
			: current.map((item) => {
					if (!item || typeof item !== "object") return item;
					const record = item as Record<string, unknown>;
					return (record.id ?? record.email ?? record.reference) === identity ? { ...record, ...incoming } : record;
				});
	} else {
		next = payload;
	}
	localStorage.setItem(key, JSON.stringify(next));
	return payload as T;
}
