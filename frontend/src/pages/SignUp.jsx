// PAGE: /signup
// Same look as /login. Clerk's useSignUp hook does the real work.
// Views: "form"   -> email + password or Google
//        "verify" -> 6-digit code Clerk emails to prove the address is yours

import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth, useSignUp } from '@clerk/clerk-react'
import AuthLayout from '../components/AuthLayout'
import {
  AuthHeading,
  BackButton,
  CodeField,
  Field,
  FormError,
  GoogleButton,
  OrDivider,
  PasswordField,
  ResendLink,
  SubmitButton,
} from '../components/AuthForm'
import {
  isValidEmail,
  readClerkError,
  redirectSearch,
  saveRememberChoice,
} from '../lib/auth'
import useAuthTarget from '../lib/useAuthTarget'
import useResendTimer from '../lib/useResendTimer'

// Clerk field names -> words people understand
const FIELD_NAMES = {
  first_name: 'first name',
  last_name: 'last name',
  username: 'username',
  phone_number: 'phone number',
  legal_accepted: 'accepting the terms',
}

export default function SignUp() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const { isLoaded: authLoaded, isSignedIn } = useAuth()
  const navigate = useNavigate()
  const target = useAuthTarget()

  const [view, setView] = useState('form')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [errors, setErrors] = useState({})
  const [pending, setPending] = useState(null)
  const resend = useResendTimer()

  if (authLoaded && isSignedIn && !pending) {
    return <Navigate to={target} replace />
  }

  function showError(err) {
    const { message, field } = readClerkError(err)
    setErrors(field ? { [field]: message } : { form: message })
  }

  async function run(name, fn) {
    if (!isLoaded || pending) return
    setErrors({})
    setPending(name)
    try {
      await fn()
    } catch (err) {
      showError(err)
    } finally {
      setPending(null)
    }
  }

  async function finish(attempt) {
    if (attempt.status === 'complete') {
      saveRememberChoice(true)
      await setActive({ session: attempt.createdSessionId })
      navigate(target, { replace: true })
      return true
    }
    if (attempt.status === 'missing_requirements' && attempt.missingFields?.length) {
      const names = attempt.missingFields.map((f) => FIELD_NAMES[f] ?? f.replace(/_/g, ' '))
      setErrors({
        form: `Your account also needs: ${names.join(', ')}. Ask the admin to turn these off in Clerk, or sign up with Google.`,
      })
      return true
    }
    return false
  }

  function handleSubmit(e) {
    e.preventDefault()
    const fieldErrors = {}
    const value = email.trim()
    if (!value) fieldErrors.email = 'Enter your email address.'
    else if (!isValidEmail(value)) fieldErrors.email = "That doesn't look like an email address."
    if (!password) fieldErrors.password = 'Choose a password.'
    else if (password.length < 8) fieldErrors.password = 'Use at least 8 characters.'
    if (Object.keys(fieldErrors).length) return setErrors(fieldErrors)

    run('create', async () => {
      const attempt = await signUp.create({ emailAddress: value, password })
      if (attempt.unverifiedFields?.includes('email_address')) {
        await attempt.prepareEmailAddressVerification({ strategy: 'email_code' })
        resend.start()
        setCode('')
        setView('verify')
        return
      }
      if (!(await finish(attempt))) {
        setErrors({ form: "We couldn't create your account. Please try again." })
      }
    })
  }

  function handleGoogle() {
    if (!isLoaded || pending) return
    setErrors({})
    setPending('google')
    saveRememberChoice(true)
    signUp
      .authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/login/sso-callback',
        redirectUrlComplete: target,
      })
      .catch((err) => {
        showError(err)
        setPending(null)
      })
  }

  function handleVerify(e) {
    e.preventDefault()
    if (code.length < 6) return setErrors({ code: 'Enter the 6-digit code.' })
    run('verify', async () => {
      const attempt = await signUp.attemptEmailAddressVerification({ code })
      if (!(await finish(attempt))) {
        setErrors({ form: "That didn't work. Request a new code and try again." })
      }
    })
  }

  function handleResend() {
    run('resend', async () => {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      resend.start()
    })
  }

  const clearError = (field) =>
    setErrors((prev) => (prev[field] || prev.form ? { ...prev, [field]: undefined, form: undefined } : prev))

  const busy = !isLoaded || pending !== null

  const content =
    view === 'verify' ? (
      <>
        <AuthHeading
          title="Check your email."
          subtitle={`We sent a 6-digit code to ${email.trim()}.`}
        />
        <form onSubmit={handleVerify} noValidate className="mt-8 space-y-6">
          <FormError>{errors.form}</FormError>
          <CodeField
            id="signup-code"
            label="Verification code"
            value={code}
            onChange={(v) => {
              setCode(v)
              clearError('code')
            }}
            error={errors.code}
            autoFocus
          />
          <SubmitButton loading={pending === 'verify'} disabled={busy}>
            Verify email
          </SubmitButton>
        </form>
        <div className="mt-6 flex items-center justify-between text-[13px]">
          <BackButton
            onClick={() => {
              setErrors({})
              setView('form')
            }}
          >
            Use a different email
          </BackButton>
          <ResendLink timer={resend} onClick={handleResend} disabled={busy} />
        </div>
      </>
    ) : (
      <>
        <AuthHeading
          title="Start your atlas."
          subtitle="A private place for your places, your people, your little things."
        />

        <div className="mt-6 sm:mt-8">
          <GoogleButton onClick={handleGoogle} loading={pending === 'google'} disabled={busy} />
        </div>

        <div className="my-5 sm:my-6">
          <OrDivider />
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-5 sm:space-y-6">
            <FormError>{errors.form}</FormError>
            <Field
              id="signup-email"
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                clearError('email')
              }}
              error={errors.email}
            />
            <PasswordField
              id="signup-password"
              label="Password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                clearError('password')
              }}
              error={errors.password}
            />
          </div>

          {/* Clerk puts its bot check here when it needs one (usually invisible) */}
          <div id="clerk-captcha" className="mt-5 empty:hidden" />

          <SubmitButton loading={pending === 'create'} disabled={busy} className="mt-6">
            Create account
          </SubmitButton>
        </form>

        <p className="mt-8 text-center text-[13px] text-ink/60">
          Already have an account?{' '}
          <Link
            to={{ pathname: '/login', search: redirectSearch(target) }}
            className="font-semibold text-teal underline underline-offset-2 outline-none hover:text-[#1a615e] focus-visible:ring-2 focus-visible:ring-teal/40"
          >
            Log in
          </Link>
        </p>
      </>
    )

  return (
    <AuthLayout>
      <div key={view} className="auth-fade">
        {content}
      </div>
    </AuthLayout>
  )
}
