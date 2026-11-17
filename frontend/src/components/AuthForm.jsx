// COMPONENTS: the building blocks of the login and sign up forms.
// Styled to match the Figma (reference/login-reference.png).

import { useState } from 'react'
import { ArrowLeft, ArrowRight, Eye, EyeOff, LoaderCircle } from 'lucide-react'

// big serif heading + one grey line under it
export function AuthHeading({ title, subtitle }) {
  return (
    <div>
      <h1 className="font-display text-[36px] font-bold leading-none tracking-[-0.01em] sm:text-[44px] lg:text-[52px]">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-3 text-sm text-ink/60 sm:text-[15px]">{subtitle}</p>
      )}
    </div>
  )
}

const inputBase =
  'h-14 w-full border bg-print px-4 text-[15px] text-ink outline-none transition-[border-color,box-shadow] placeholder:text-ink/40 focus:border-teal focus:ring-2 focus:ring-teal/15 disabled:cursor-not-allowed disabled:opacity-60'

// label + input + the error under it
export function Field({ id, label, error, inputClassName = '', children, ...inputProps }) {
  const errorId = `${id}-error`
  return (
    <div>
      <label htmlFor={id} className="block text-[13px] font-medium text-ink">
        {label}
      </label>
      <div className="relative mt-2">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`${inputBase} ${
            error ? 'border-danger' : 'border-ink/15 hover:border-ink/30'
          } ${inputClassName}`}
          {...inputProps}
        />
        {children}
      </div>
      {error && (
        <p id={errorId} className="mt-2 text-[13px] text-danger">
          {error}
        </p>
      )}
    </div>
  )
}

// password box with the eye button that shows / hides what you typed
export function PasswordField(props) {
  const [visible, setVisible] = useState(false)
  return (
    <Field {...props} type={visible ? 'text' : 'password'} inputClassName="pr-12">
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 grid w-12 place-items-center text-ink/50 outline-none transition-colors hover:text-ink focus-visible:text-ink focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal/40"
      >
        {visible ? <EyeOff size={18} strokeWidth={1.75} /> : <Eye size={18} strokeWidth={1.75} />}
      </button>
    </Field>
  )
}

// 6 digit code from the email
export function CodeField({ value, onChange, ...props }) {
  return (
    <Field
      {...props}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
      inputMode="numeric"
      autoComplete="one-time-code"
      maxLength={6}
      placeholder="000000"
      inputClassName="font-mono text-lg tracking-[0.4em] placeholder:tracking-[0.4em]"
    />
  )
}

const Spinner = ({ size = 18 }) => (
  <LoaderCircle size={size} className="animate-spin" aria-hidden="true" />
)

// teal button with the hard shadow, label on the left and arrow on the right
export function SubmitButton({ children, loading, disabled, className = '' }) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`flex h-14 w-full items-center justify-between bg-teal px-5 text-[15px] font-semibold text-print shadow-button outline-none transition-[background-color,transform,box-shadow] duration-100 hover:bg-[#1a615e] focus-visible:ring-2 focus-visible:ring-teal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-mist enabled:active:translate-x-[3px] enabled:active:translate-y-[3px] enabled:active:shadow-none disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
    >
      <span>{children}</span>
      {loading ? <Spinner /> : <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />}
    </button>
  )
}

// the official four colour Google "G"
function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

export function GoogleButton({ onClick, loading, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className="flex h-14 w-full items-center justify-center gap-3 border border-ink/80 bg-print text-[15px] font-medium text-ink outline-none transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-teal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-mist disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? <Spinner /> : <GoogleLogo />}
      Continue with Google
    </button>
  )
}

export function OrDivider({ children = 'or with email' }) {
  return (
    <div className="flex items-center gap-3 text-[11px] text-ink/50" role="separator">
      <span className="h-px flex-1 bg-ink/15" />
      {children}
      <span className="h-px flex-1 bg-ink/15" />
    </div>
  )
}

// an error that isn't about one input (wrong password, network down, ...)
export function FormError({ children }) {
  if (!children) return null
  return (
    <p
      role="alert"
      className="border-l-2 border-danger bg-danger/5 px-3 py-2.5 text-[13px] leading-snug text-danger"
    >
      {children}
    </p>
  )
}

// small grey "← Back to log in" style button
export function BackButton({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-[13px] text-ink/60 outline-none transition-colors hover:text-ink focus-visible:text-ink focus-visible:underline"
    >
      <ArrowLeft size={14} aria-hidden="true" />
      {children}
    </button>
  )
}

// teal text link look, used for "Forgot password?" and "Resend code"
export const textLink =
  'font-medium text-teal underline-offset-2 outline-none hover:underline focus-visible:underline disabled:cursor-not-allowed disabled:text-ink/40 disabled:no-underline'

// "Resend code" that waits between sends (timer comes from useResendTimer)
export function ResendLink({ timer, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || timer.seconds > 0}
      className={`tabular-nums ${textLink}`}
    >
      {timer.seconds > 0 ? `Resend code in ${timer.seconds}s` : 'Resend code'}
    </button>
  )
}
