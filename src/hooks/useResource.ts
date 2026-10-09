import { useEffect, useRef, useState } from "react";
import { loadResource } from "@/services/dataSource";

export function useResource<T>(endpoint: string, demoValue: T) {
	const [data, setData] = useState(demoValue);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [revision, setRevision] = useState(0);
	const demoValueRef = useRef(demoValue);
	demoValueRef.current = demoValue;

	useEffect(() => {
		const controller = new AbortController();
		setLoading(true);
		setError(null);
		loadResource(endpoint, demoValueRef.current, controller.signal)
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
