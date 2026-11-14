// PAGE: /login
// Our own login form (Clerk's useSignIn hook does the real work).
// Views: "signin" -> email + password or Google
//        "mfa"    -> code from email / authenticator app, when Clerk asks for it
//        "forgot" -> send a reset code to your email
//        "reset"  -> code + new password

import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth, useSignIn } from '@clerk/clerk-react'
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
  textLink,
} from '../components/AuthForm'
import {
  isValidEmail,
  readClerkError,
  redirectSearch,
  saveRememberChoice,
} from '../lib/auth'
import useAuthTarget from '../lib/useAuthTarget'
import useResendTimer from '../lib/useResendTimer'

export default function Login() {
  const { isLoaded, signIn, setActive } = useSignIn()
  const { isLoaded: authLoaded, isSignedIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const target = useAuthTarget()

  const [view, setView] = useState(
    location.state?.view === 'forgot' ? 'forgot' : 'signin',
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [mfa, setMfa] = useState(null) // { strategy, hint }
  const [errors, setErrors] = useState({})
  const [pending, setPending] = useState(null) // which button is loading
  const resend = useResendTimer()

  // "Need a hand?" links here with state { view: 'forgot' }.
  // Switch to that view, then clear the state so a page refresh starts at the normal login.
  const requestedView = location.state?.view
  useEffect(() => {
    if (requestedView !== 'forgot') return
    goTo('forgot')
    navigate({ search: redirectSearch(target), hash: '' }, { replace: true, state: null })
  }, [location.key, requestedView, navigate, target]) // key changes on every click, even if already on /login

  // already logged in? no need to be here
  if (authLoaded && isSignedIn && !pending) {
    return <Navigate to={target} replace />
  }

  function goTo(next) {
    setErrors({})
    setCode('')
    setView(next)
  }

  function showError(err) {
    const { message, field } = readClerkError(err)
    setErrors(field ? { [field]: message } : { form: message })
  }

  // run one Clerk call with a loading button + error handling
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

  // every sign in path ends here: either we're in, or Clerk wants one more step
  async function finish(attempt) {
    switch (attempt.status) {
      case 'complete':
        await setActive({ session: attempt.createdSessionId })
        navigate(target, { replace: true })
        return
      case 'needs_second_factor':
      case 'needs_client_trust': // new device check, also done with an email code
        await startSecondFactor(attempt)
        return
      case 'needs_new_password':
        goTo('forgot')
        setErrors({ form: 'Please set a new password for your account.' })
        return
      default:
        setErrors({
          form: "We couldn't finish logging you in. Try again, or continue with Google.",
        })
    }
  }

  async function startSecondFactor(attempt) {
    const factors = attempt.supportedSecondFactors ?? []
    const byEmail = factors.find((f) => f.strategy === 'email_code')
    const byPhone = factors.find((f) => f.strategy === 'phone_code')
    const byApp = factors.find((f) => f.strategy === 'totp')

    if (byEmail) {
      await attempt.prepareSecondFactor({
        strategy: 'email_code',
        emailAddressId: byEmail.emailAddressId,
      })
      setMfa({ strategy: 'email_code', id: byEmail.emailAddressId, hint: byEmail.safeIdentifier })
      resend.start()
    } else if (byPhone) {
      await attempt.prepareSecondFactor({
        strategy: 'phone_code',
        phoneNumberId: byPhone.phoneNumberId,
      })
      setMfa({ strategy: 'phone_code', id: byPhone.phoneNumberId, hint: byPhone.safeIdentifier })
      resend.start()
    } else if (byApp) {
      setMfa({ strategy: 'totp' })
    } else {
      setErrors({ form: "This account needs a verification step we don't support yet." })
      return
    }
    goTo('mfa')
  }

  // ---------- handlers ----------

  function checkEmail() {
    const value = email.trim()
    if (!value) return 'Enter your email address.'
    if (!isValidEmail(value)) return "That doesn't look like an email address."
    return null
  }

  function handleSignIn(e) {
    e.preventDefault()
    const fieldErrors = {}
    const emailError = checkEmail()
    if (emailError) fieldErrors.email = emailError
    if (!password) fieldErrors.password = 'Enter your password.'
    if (Object.keys(fieldErrors).length) return setErrors(fieldErrors)

    run('password', async () => {
      saveRememberChoice(remember)
      const attempt = await signIn.create({ identifier: email.trim(), password })
      await finish(attempt)
    })
  }

  function handleGoogle() {
    if (!isLoaded || pending) return
    setErrors({})
    setPending('google')
    saveRememberChoice(remember)
    // leaves the page; we only come back here if it fails to start
    signIn
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

  function handleMfa(e) {
    e.preventDefault()
    if (code.length < 6) return setErrors({ code: 'Enter the 6-digit code.' })
    run('code', async () => {
      const attempt = await signIn.attemptSecondFactor({ strategy: mfa.strategy, code })
      await finish(attempt)
    })
  }

  function resendMfa() {
    run('resend', async () => {
      await signIn.prepareSecondFactor(
        mfa.strategy === 'email_code'
          ? { strategy: 'email_code', emailAddressId: mfa.id }
          : { strategy: 'phone_code', phoneNumberId: mfa.id },
      )
      resend.start()
    })
  }

  function sendResetCode() {
    return signIn.create({
      strategy: 'reset_password_email_code',
      identifier: email.trim(),
    })
  }

  function handleForgot(e) {
    e.preventDefault()
    const emailError = checkEmail()
    if (emailError) return setErrors({ email: emailError })
    run('forgot', async () => {
      await sendResetCode()
      resend.start()
      goTo('reset')
    })
  }

  function handleReset(e) {
    e.preventDefault()
    const fieldErrors = {}
    if (code.length < 6) fieldErrors.code = 'Enter the 6-digit code.'
    if (!newPassword) fieldErrors.password = 'Choose a new password.'
    if (Object.keys(fieldErrors).length) return setErrors(fieldErrors)

    run('reset', async () => {
      saveRememberChoice(remember)
      const attempt = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password: newPassword,
      })
      setPassword('')
      setNewPassword('')
      await finish(attempt)
    })
  }

  function resendReset() {
    run('resend', async () => {
      await sendResetCode()
      resend.start()
    })
  }

  const clearError = (field) =>
    setErrors((prev) => (prev[field] || prev.form ? { ...prev, [field]: undefined, form: undefined } : prev))

  const busy = !isLoaded || pending !== null

  // ---------- views ----------

  let content

  if (view === 'mfa') {
    const where =
      mfa?.strategy === 'totp'
        ? 'Enter the 6-digit code from your authenticator app.'
        : `We sent a 6-digit code to ${mfa?.hint ?? 'you'}.`
    content = (
      <>
        <AuthHeading title="One more step." subtitle={where} />
        <form onSubmit={handleMfa} noValidate className="mt-8 space-y-6">
          <FormError>{errors.form}</FormError>
          <CodeField
            id="mfa-code"
            label="Verification code"
            value={code}
            onChange={(v) => {
              setCode(v)
              clearError('code')
            }}
            error={errors.code}
            autoFocus
            disabled={busy}
          />
          <SubmitButton loading={pending === 'code'} disabled={busy}>
            Verify
          </SubmitButton>
        </form>
        <div className="mt-6 flex items-center justify-between text-[13px]">
          <BackButton onClick={() => goTo('signin')}>Back to log in</BackButton>
          {mfa?.strategy !== 'totp' && (
            <ResendLink timer={resend} onClick={resendMfa} disabled={busy} />
          )}
        </div>
      </>
    )
  } else if (view === 'forgot') {
    content = (
      <>
        <AuthHeading
          title="Forgot password?"
          subtitle="Enter your email and we'll send you a code to reset it."
        />
        <form onSubmit={handleForgot} noValidate className="mt-8 space-y-6">
          <FormError>{errors.form}</FormError>
          <Field
            id="forgot-email"
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
            autoFocus
          />
          <SubmitButton loading={pending === 'forgot'} disabled={busy}>
            Send reset code
          </SubmitButton>
        </form>
        <div className="mt-6">
          <BackButton onClick={() => goTo('signin')}>Back to log in</BackButton>
        </div>
      </>
    )
  } else if (view === 'reset') {
    content = (
      <>
        <AuthHeading
          title="Check your email."
          subtitle={`We sent a 6-digit code to ${email.trim()}.`}
        />
        <form onSubmit={handleReset} noValidate className="mt-8 space-y-6">
          <FormError>{errors.form}</FormError>
          <CodeField
            id="reset-code"
            label="Reset code"
            value={code}
            onChange={(v) => {
              setCode(v)
              clearError('code')
            }}
            error={errors.code}
            autoFocus
          />
          <PasswordField
            id="new-password"
            label="New password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value)
              clearError('password')
            }}
            error={errors.password}
          />
          <SubmitButton loading={pending === 'reset'} disabled={busy}>
            Reset password
          </SubmitButton>
        </form>
        <div className="mt-6 flex items-center justify-between text-[13px]">
          <BackButton onClick={() => goTo('forgot')}>Use a different email</BackButton>
          <ResendLink timer={resend} onClick={resendReset} disabled={busy} />
        </div>
      </>
    )
  } else {
    content = (
      <>
        <AuthHeading
          title="Welcome back."
          subtitle="Your places, your people, your little things."
        />

        <div className="mt-6 sm:mt-8">
          <GoogleButton
            onClick={handleGoogle}
            loading={pending === 'google'}
            disabled={busy}
          />
        </div>

        <div className="my-5 sm:my-6">
          <OrDivider />
        </div>

        <form onSubmit={handleSignIn} noValidate>
          <div className="space-y-5 sm:space-y-6">
            <FormError>{errors.form}</FormError>
            <Field
              id="email"
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
              id="password"
              label="Password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                clearError('password')
              }}
              error={errors.password}
            />
          </div>

          <div className="mt-5 flex items-center justify-between text-[13px]">
            <label className="flex cursor-pointer select-none items-center gap-2 text-ink/80">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="size-[15px] cursor-pointer accent-teal"
              />
              Remember me
            </label>
            <button type="button" onClick={() => goTo('forgot')} className={textLink}>
              Forgot password?
            </button>
          </div>

          <SubmitButton loading={pending === 'password'} disabled={busy} className="mt-6">
            Log in
          </SubmitButton>
        </form>

        <p className="mt-8 text-center text-[13px] text-ink/60">
          New to Memoria?{' '}
          <Link
            to={{ pathname: '/signup', search: redirectSearch(target) }}
            className="font-semibold text-teal underline underline-offset-2 outline-none hover:text-[#1a615e] focus-visible:ring-2 focus-visible:ring-teal/40"
          >
            Create an account
          </Link>
        </p>
      </>
    )
  }

  // key={view} restarts the fade-in each time the view changes
  return (
    <AuthLayout>
      <div key={view} className="auth-fade">
        {content}
      </div>
    </AuthLayout>
  )
}
