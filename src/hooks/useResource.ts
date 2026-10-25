import { useEffect, useRef, useState } from "react";
import { loadResource } from "@/services/dataSource";

function emptyValue<T>(value: T): T {
	if (Array.isArray(value)) return [] as T;
	if (value && typeof value === "object") {
		const result = Object.fromEntries(
			Object.entries(value).map(([key, item]) => [key, emptyValue(item)]),
		);
		return result as T;
	}
	if (typeof value === "string") return "" as T;
	if (typeof value === "number") return 0 as T;
	if (typeof value === "boolean") return false as T;
	return value;
}

export function useResource<T>(endpoint: string, initialShape: T) {
	const [data, setData] = useState(() => emptyValue(initialShape));
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [revision, setRevision] = useState(0);
	const initialShapeRef = useRef(initialShape);
	initialShapeRef.current = initialShape;

	useEffect(() => {
		const controller = new AbortController();
		setLoading(true);
		setError(null);
		loadResource(endpoint, initialShapeRef.current, controller.signal)
			.then(setData)
			.catch((reason: unknown) => {
				if (!controller.signal.aborted) {
					setError(reason instanceof Error ? reason.message : "Unable to load data.");
				}
			})
			.finally(() => {
				if (!controller.signal.aborted) setLoading(false);
			});
		return () => controller.abort();
	}, [endpoint, revision]);

	return { data, setData, loading, error, reload: () => setRevision((value) => value + 1) };
}
