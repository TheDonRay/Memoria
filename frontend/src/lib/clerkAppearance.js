// STYLES for Clerk's sign-in form, so it looks like the rest of Memoria.
// Clerk draws the form for us, by default as a white rounded card with a shadow and a gray footer.
// "variables" changes Clerk's base colors + font, "elements" restyles one named part at a time.
// Used by: Login

// the same values as the @theme block in index.css (Clerk needs real values, not class names)
const ink = '#101414'
const mist = '#e8edea'
const print = '#fafaf7'
const flash = '#ffd23f'
const teal = '#1f6f6b'
const line = 'rgba(16, 20, 20, 0.2)' // same as border-ink/20

const display = "'Playfair Display', Georgia, serif"
const body = "'Work Sans', system-ui, sans-serif"
const mono = "'IBM Plex Mono', ui-monospace, monospace"

// Clerk draws its own borders and shadows with very specific CSS, so a normal value loses.
// "!important" is how we tell the browser ours wins.
const must = (value) => `${value} !important`

// the small uppercase mono label used all over the site (labelClass in styles.js)
const monoLabel = {
  fontFamily: mono,
  fontSize: '11px',
  fontWeight: 400,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: 'rgba(16, 20, 20, 0.6)',
}

export const clerkAppearance = {
  variables: {
    colorPrimary: teal,
    colorBackground: mist,
    colorText: ink,
    colorInputBackground: print,
    colorInputText: ink,
    borderRadius: '0px',
    fontFamily: body,
    fontSize: '15px',
  },
  elements: {
    // the form fills the column instead of being a fixed 400px card
    rootBox: { width: '100%' },
    cardBox: {
      width: '100%',
      maxWidth: '100%',
      boxShadow: 'none',
      border: 'none',
      // Clerk cuts off anything outside the card, which would hide the button's hard shadow
      overflow: 'visible',
    },
    // no card look: no shadow, no border, no padding, it sits flat on the page
    card: {
      background: 'transparent',
      boxShadow: 'none',
      border: 'none',
      padding: 0,
      gap: '32px',
    },

    // the heading of each step ("Welcome back.", "Check your email", ...)
    header: { textAlign: 'left', gap: '12px' },
    headerTitle: {
      fontFamily: display,
      fontSize: 'clamp(2.25rem, 6vw, 3rem)',
      fontWeight: 700,
      lineHeight: 1.05,
      color: ink,
    },
    headerSubtitle: {
      marginTop: '12px',
      fontSize: '14px',
      color: 'rgba(16, 20, 20, 0.6)',
    },

    // "Continue with Google": an outlined button, same shape as the form button
    socialButtonsBlockButton: {
      minHeight: '48px',
      background: print,
      border: must(`1px solid ${ink}`),
      boxShadow: must('none'),
      '&:hover': { background: '#ffffff' },
      '&:focus-visible': { outline: `2px solid ${ink}`, outlineOffset: '2px' },
    },
    socialButtonsBlockButtonText: { fontSize: '14px', fontWeight: 500, color: ink },

    // the "or" line between Google and the email box
    dividerLine: { background: line },
    dividerText: monoLabel,

    formFieldLabel: monoLabel,
    formFieldInput: {
      minHeight: '48px',
      padding: '12px 16px',
      fontSize: '14px',
      background: print,
      border: must(`1px solid ${line}`),
      boxShadow: must('none'),
      '&:hover': { border: must(`1px solid rgba(16, 20, 20, 0.45)`) },
      '&:focus': { border: must(`1px solid ${ink}`) },
    },

    // the yellow button with the hard shadow (primaryButton in styles.js)
    formButtonPrimary: {
      minHeight: '48px',
      background: flash,
      color: ink,
      fontSize: '14px',
      fontWeight: 600,
      border: must(`2px solid ${ink}`),
      boxShadow: must(`3px 3px 0 ${ink}`),
      // Clerk paints a glossy highlight on top of its buttons, we want it flat
      '&::after': { display: 'none' },
      '&:hover': { background: '#ffdc66' },
      '&:focus-visible': { outline: `2px solid ${ink}`, outlineOffset: '4px' },
      // pressed: the button moves onto its shadow
      '&:active': {
        boxShadow: must(`1px 1px 0 ${ink}`),
        transform: 'translate(2px, 2px)',
      },
    },

    // the strip under the form ("Secured by Clerk"): no gray box, just a thin line above it
    // ("& div" means every box inside the footer, that is where the gray stripes are drawn)
    footer: {
      background: must('transparent'),
      borderTop: `1px solid ${line}`,
      marginTop: '32px',
      paddingTop: '8px',
      '& div': { background: must('transparent'), boxShadow: must('none') },
    },

    // later steps: the 6 boxes for the email code, and the "use another method" buttons
    otpCodeFieldInput: {
      background: print,
      border: must(`1px solid ${line}`),
      boxShadow: must('none'),
      '&:focus': { border: must(`1px solid ${ink}`) },
    },
    alternativeMethodsBlockButton: {
      minHeight: '48px',
      background: print,
      border: must(`1px solid ${ink}`),
      boxShadow: must('none'),
    },
  },
}

// Our own words for the first step. The other steps keep Clerk's wording.
// Clerk has two versions of the first step: plain sign-in (title) and
// "sign in or sign up in one form" (titleCombined). We set both so the heading
// stays the same whichever one the Clerk dashboard is set to.
const title = 'Welcome back.'
const subtitle = 'Your places, your people, your little things.'

export const clerkLocalization = {
  signIn: {
    start: {
      title,
      subtitle,
      titleCombined: title,
      subtitleCombined: subtitle,
    },
  },
}
