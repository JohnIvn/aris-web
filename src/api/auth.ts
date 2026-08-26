import { SignInData, SignUpData } from "../lib/data/auth.interface";
import { ApiCallResponse } from "../lib/data/http.types";
import { httpRequest } from "./client";

export async function verifyuser(): Promise<ApiCallResponse> {
  return await httpRequest("/auth/verify", {
    method: "GET",
  });
}
export async function signIn(data: SignInData): Promise<ApiCallResponse> {
  const { email, password } = data;
  const errors = [];
  if (!email) errors.push("Email is required!");
  if (!password) errors.push("Password is required!");

  if (errors.length > 0)
    return {
      data: null,
      ok: false,
      error: errors,
      message: "Sign In Failed, missing required fields",
      server_status: true,
    };

  return await httpRequest("/auth/signin", {
    method: "POST",
    data: data,
  });
}

export async function signUp(data: SignUpData): Promise<ApiCallResponse> {
  const { email, password, firstname, lastname, confirm_password } = data;
  const errors = [];

  // Use an proper validation algorithm for the ones that need it
  if (!email) errors.push("Email is required!");
  if (!firstname) errors.push("First Name is required!");
  if (!lastname) errors.push("Last Name is required!");
  if (!password) errors.push("Password is required!");
  if (password !== confirm_password)
    errors.push("Password and Confirm Password does not match!");

  if (errors.length > 0)
    return {
      data: null,
      ok: false,
      error: errors,
      message: "Sign In Failed, missing required fields",
      server_status: true,
    };

  return await httpRequest("/auth/signup", {
    method: "POST",
    data: data,
  });
}

export async function signOut(): Promise<ApiCallResponse> {
  return await httpRequest("/auth/signout", {
    method: "POST",
  });
}
