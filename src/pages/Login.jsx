import { useState } from "react";
import {
  loginWithEmail,
  loginWithGoogle,
  registerWithEmail,
} from "../firebase/auth";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await loginWithEmail(email, password);
      console.log("Login successful");
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEmailSignup = async () => {
  setError("");

  try {
    await registerWithEmail(email, password);
    console.log("Account created successfully");
  } catch (error) {
    setError(error.message);
  }
};

  const handleGoogleLogin = async () => {
    setError("");

    try {
      await loginWithGoogle();
      console.log("Google login successful");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow">
        <h1 className="mb-6 text-2xl font-bold">Login</h1>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border p-3"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border p-3"
            required
          />

          <button
            type="submit"
            className="w-full rounded bg-blue-600 p-3 text-white"
          >
            Login
          </button>
          <button
  type="button"
  onClick={handleEmailSignup}
  className="w-full rounded border p-3"
>
  Create Account
</button>
           

        </form>

        <div className="my-4 text-center">OR</div>

        <button
          onClick={handleGoogleLogin}
          className="w-full rounded border p-3"
        >
          Continue with Google
        </button>

        {error && (
          <p className="mt-4 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export default Login;