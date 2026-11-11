import { useState } from 'react'
import type { FormEvent } from 'react'
import { useLocation,useNavigate } from 'react-router-dom'
import { useAuth } from "../contexts/AuthContext";
const LoginPage = () => {
    const [email,setEmail] = useState("")
    const [password,setPassword] = useState("")
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [pendingVerificationEmail, setPendingVerificationEmail] = useState("");
    const { login, register,resendVerificationEmail } = useAuth();
const navigate = useNavigate();
const location = useLocation();

const isRegistering = location.pathname === '/register';
const [name, setName] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [success, setSuccess] = useState('')
const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  setError('');
  setSuccess('');

  if (isRegistering && password !== confirmPassword) {
    setError('Passwords do not match.');
    return;
  }

  setIsLoading(true);

  try {
    if (isRegistering) {
      const result = await register(name, email, password);

      if (result.requiresEmailVerification) {
        setPendingVerificationEmail(email)
        setSuccess('Account created! Please check your email to verify your account before signing in.');
      } else {
        setSuccess('Account created successfully! You can now sign in.');
        setEmail("")
      }

      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } else {
      await login(email, password);

      setSuccess('Login successful!');

      setTimeout(() => {
        navigate('/');
      }, 1500);
    }
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : 'Something went wrong. Please try again.';

    setError(message);
  } finally {
    setIsLoading(false);
  }
};
const handleResendVerification = async () => {
  try {
    setError("");
    setSuccess("");

    const emailToVerify = pendingVerificationEmail || email;
await resendVerificationEmail(emailToVerify);

    setSuccess("If verification is required, a new email has been sent.");
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : "Unable to resend verification email"
    );
  }
};
  return (
    <section className="flex min-h-[80vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-[#39443D] bg-[#222925] p-8">

        <div className="mb-8 grid grid-cols-2 rounded-lg bg-[#171B19] p-1">
  <button
    type="button"
    onClick={() => navigate('/login')}
    className={`rounded-md py-3 text-sm font-semibold transition ${
      !isRegistering
        ? 'bg-emerald-500 text-[#10251C]'
        : 'text-stone-400 hover:text-white'
    }`}
  >
    Log In
  </button>

  <button
    type="button"
    onClick={() => navigate('/register')}
    className={`rounded-md py-3 text-sm font-semibold transition ${
      isRegistering
        ? 'bg-emerald-500 text-[#10251C]'
        : 'text-stone-400 hover:text-white'
    }`}
  >
    Sign Up
  </button>
</div>
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
  {isRegistering ? 'Join the community' : 'Welcome back'}
</p>

<h1 className="mt-3 text-3xl font-bold text-[#F5F0E6]">
  {isRegistering ? 'Create your account' : 'Sign in to your account'}
</h1>

<p className="mt-3 text-sm text-stone-400">
  {isRegistering
    ? 'Create an account and start discovering experiences.'
    : 'Continue discovering and registering for events.'}
</p>
        </div>

       <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {isRegistering && (
  <div>
    <label
      htmlFor="name"
      className="mb-2 block text-sm font-medium text-stone-300"
    >
      Full name
    </label>

    <input
      id="name"
      type="text"
      required
      value={name}
      onChange={(event) => setName(event.target.value)}
      placeholder="Enter your full name"
      className="w-full rounded-lg border border-[#39443D] bg-[#171B19] px-4 py-3 text-[#F5F0E6] outline-none focus:border-emerald-500"
    />
  </div>
)}
  <div>
    <label
      htmlFor="email"
      className="mb-2 block text-sm font-medium text-stone-300"
    >
      Email address
    </label>

    <input
       id="email"
       type="email"
       value={email}
       onChange={(event) => setEmail(event.target.value)}
       placeholder="you@example.com"
       className="w-full rounded-lg border border-[#39443D] bg-[#171B19] px-4 py-3 text-[#F5F0E6] outline-none placeholder:text-stone-500 focus:border-emerald-500"
     />
        </div>
      
        <div>
  <label
    htmlFor="password"
    className="text-sm font-medium text-[#F5F0E6]"
  >
    Password
  </label>

  <div className="relative mt-2">
    <input
      id="password"
      type={showPassword ? 'text' : 'password'}
      value={password}
      onChange={(event) => setPassword(event.target.value)}
      placeholder="Enter your password"
      className="w-full rounded-lg border border-[#39443D] bg-[#171B19] px-4 py-3 pr-12 text-[#F5F0E6] outline-none focus:border-emerald-500"
    />


    <button
      type="button"
      onClick={() => setShowPassword((current) => !current)}
      className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-emerald-400"
      aria-label={showPassword ? 'Hide password' : 'Show password'}
    >
      {showPassword ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 3l18 18" />
          <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
          <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5 0 9 5 9 7a9.8 9.8 0 0 1-2.1 3.1" />
          <path d="M6.2 6.2C4.2 7.5 3 9.5 3 12c0 2 4 7 9 7 1.1 0 2.2-.3 3.2-.7" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  </div>
</div>
{isRegistering && (
  <div>
    <label
      htmlFor="confirmPassword"
      className="mb-2 block text-sm font-medium text-stone-300"
    >
      Confirm password
    </label>

    <input
      id="confirmPassword"
      type={showPassword ? 'text' : 'password'}
      required
      value={confirmPassword}
      onChange={(event) => setConfirmPassword(event.target.value)}
      placeholder="Confirm your password"
      className="w-full rounded-lg border border-[#39443D] bg-[#171B19] px-4 py-3 text-[#F5F0E6] outline-none focus:border-emerald-500"
    />
  </div>
)}
       {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
            {success}
          </p>
        )}
        {email.trim() && (
  <button
    type="button"
    onClick={handleResendVerification}
    className="mt-3 text-sm font-medium text-[#C6A76B] hover:underline"
  >
    Resend verification email
  </button>
)}
        <button
  type="submit"
  disabled={isLoading}
  className="w-full rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-[#10251C] transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
>
  {isLoading
    ? isRegistering ? 'Creating account...' : 'Signing in...'
    : isRegistering ? 'Create account' : 'Sign in'}
</button>
      </form>

      </div>
    </section>
  )
}

export default LoginPage
