import { demoAccounts, type UserAccount, type UserRole } from "@/data/demoAccounts";
import axios from "axios";
import { apiClient } from "@/services/apiClient";

export interface AuthSession {
	user: UserAccount;
	token?: string;
}

interface SignInPayload {
	user: UserAccount;
	token?: string;
}

interface SignInEnvelope {
	ok?: boolean;
	data?: SignInPayload;
	message?: string;
	error?: string;
}

export function authenticateDemo(email: string, password: string): AuthSession {
	const account = demoAccounts.find(
		(candidate) => candidate.email.toLowerCase() === email.trim().toLowerCase(),
	);
	if (!account) {
		throw new Error("Account does not exist.");
	}
	if (account.password !== password) {
		throw new Error("Email or password is incorrect.");
	}
	const user: UserAccount = {
		id: account.id,
		email: account.email,
		name: account.name,
		role: account.role,
	};
	return { user, token: "demo-access-token" };
}

export async function signIn(email: string, password: string): Promise<AuthSession> {
	let response;
	try {
		response = await apiClient.post<SignInPayload | SignInEnvelope>("/auth/signin", {
			email: email.trim(),
			password,
		});
	} catch (error) {
		const responseData = axiosErrorData(error);
		const signInError = new Error(
			responseData?.error ??
				responseData?.message ??
				getSignInRequestError(error),
		);
		Object.defineProperty(signInError, "cause", { value: error });
		throw signInError;
	}
	if ("ok" in response.data && response.data.ok === false) {
		throw new Error(response.data.message ?? response.data.error ?? "Sign-in failed.");
	}
	const payload = "data" in response.data
		? (response.data as SignInEnvelope).data
		: response.data as SignInPayload;
	if (!payload?.user?.id || !payload.user.email) {
		throw new Error("The server returned an invalid user session.");
	}
	if (!isUserRole(payload.user.role)) {
		throw new Error("Only administrator accounts can sign in to ARIS Web.");
	}
	return {
		...payload,
		user: {
			...payload.user,
			role: "administrator",
		},
	};
}

function isUserRole(value: unknown): value is UserRole {
	return value === "administrator" || value === "admin";
}

function axiosErrorData(error: unknown): { error?: string; message?: string } | null {
	if (!axios.isAxiosError(error)) return null;
	const data = error.response?.data;
	if (!data) return null;
	if (typeof data === "string") return { message: data };
	if (typeof data !== "object") return null;
	const body = data as { error?: string | string[]; message?: string };
	const errorMessage = Array.isArray(body.error) ? body.error.join(", ") : body.error;
	return { error: body.message ?? errorMessage, message: body.message };
}

function getSignInRequestError(error: unknown): string {
	if (!axios.isAxiosError(error)) {
		return "Sign-in failed.";
	}
	if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
		return "The server took too long to respond. Check that the ARIS database is running.";
	}
	if (!error.response) {
		return "Unable to connect to the ARIS server. Check that the backend is running.";
	}
	return "Sign-in failed.";
}
