import { useState } from "react";
import { signIn } from "../api/auth";

export default function SignInPage() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setLoading(true);
    const response = await signIn(form);
    if (!response.ok) {
      setErrors(
        response.error
          ? Array.isArray(response.error)
            ? response.error
            : [response.error]
          : ["Failed to sign in, please try again later!"],
      );
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-lg bg-surface-container p-8 shadow"
      >
        <h1 className="text-xl font-medium text-on-surface">Sign in</h1>

        {errors.length > 0 && (
          <div className="rounded bg-error-container p-2 text-sm text-on-error-container">
            {errors.map((err, i) => (
              <p key={i}>{err}</p>
            ))}
          </div>
        )}

        <input
          className="input w-full"
          type="text"
          name="username"
          placeholder="Username or email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          className="input w-full"
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-primary py-2 text-on-primary disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
