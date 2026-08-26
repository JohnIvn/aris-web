import { useState } from "react";
import { signUp } from "../api/auth";

export default function SignUpPage() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    firstname: "",
    middlename: "",
    lastname: "",
    gender: "",
    birthday: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSuccess(false);

    if (form.password !== form.confirm_password) {
      setErrors(["Passwords do not match"]);
      return;
    }

    setLoading(true);
    const response = await signUp(form);
    if (!response.ok) {
      setErrors(
        response.error
          ? Array.isArray(response.error)
            ? response.error
            : [response.error]
          : ["Failed to sign in, please try again later!"],
      );
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-lg bg-surface-container p-8 shadow"
      >
        <h1 className="text-xl font-medium text-on-surface">Create account</h1>

        {errors.length > 0 && (
          <div className="rounded bg-error-container p-2 text-sm text-on-error-container">
            {errors.map((err, i) => (
              <p key={i}>{err}</p>
            ))}
          </div>
        )}

        {success && (
          <div className="rounded bg-success-container p-2 text-sm text-on-success-container">
            <p>Account created successfully!</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          <input
            className="input col-span-1"
            type="text"
            name="firstname"
            placeholder="First name"
            value={form.firstname}
            onChange={handleChange}
            required
          />
          <input
            className="input col-span-1"
            type="text"
            name="middlename"
            placeholder="Middle name"
            value={form.middlename}
            onChange={handleChange}
          />
          <input
            className="input col-span-1"
            type="text"
            name="lastname"
            placeholder="Last name"
            value={form.lastname}
            onChange={handleChange}
            required
          />
        </div>

        <input
          className="input w-full"
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
        />

        <input
          className="input w-full"
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <div className="grid grid-cols-2 gap-2">
          <select
            className="input col-span-1"
            name="gender"
            value={form.gender}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              Gender
            </option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <input
            className="input col-span-1"
            type="date"
            name="birthday"
            value={form.birthday}
            onChange={handleChange}
            required
          />
        </div>

        <input
          className="input w-full"
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <input
          className="input w-full"
          type="password"
          name="confirm_password"
          placeholder="Confirm password"
          value={form.confirm_password}
          onChange={handleChange}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-primary py-2 text-on-primary disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Sign up"}
        </button>
      </form>
    </div>
  );
}
