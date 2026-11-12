// HELPER: one look for every Clerk form (sign in + sign up), matching the Figma colors
// Used by Login and SignUp

const ink = '#101414'
const print = '#fafaf7'
const flash = '#ffd23f'
const line = 'rgba(16, 20, 20, 0.2)'

export const clerkAppearance = {
  variables: {
    colorPrimary: '#1f6f6b',
    colorBackground: '#e8edea',
    colorText: ink,
    colorInputBackground: print,
    colorInputText: ink,
    borderRadius: '0px',
    fontFamily: "'Work Sans', system-ui, sans-serif",
  },
  elements: {
    // the form fills the column instead of Clerk's fixed 400px card,
    // so it never overflows on a small phone
    rootBox: { width: '100%' },
    cardBox: {
      width: '100%',
      maxWidth: '100%',
      boxShadow: 'none',
      border: 'none',
      borderRadius: 0,
    },
    card: {
      boxShadow: 'none',
      border: 'none',
      background: 'transparent',
      padding: 0,
      width: '100%',
    },
    footer: { background: 'transparent' },

    // Clerk's own title, restyled as our big serif heading.
    // It changes with each step ("Verify your email"), so people always know where they are.
    header: { textAlign: 'left', alignItems: 'flex-start' },
    headerTitle: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontWeight: 700,
      fontSize: 'clamp(2.25rem, 10vw, 3rem)',
      lineHeight: 1.02,
      color: ink,
    },
    headerSubtitle: {
      marginTop: '0.5rem',
      fontSize: '0.875rem',
      color: 'rgba(16, 20, 20, 0.6)',
    },

    // 16px text stops iPhones zooming in when a field is tapped,
    // and 46px tall is a comfortable size for a thumb
    formFieldInput: {
      minHeight: '46px',
      fontSize: '16px',
      border: `1px solid ${line}`,
      boxShadow: 'none',
      '&:hover': { border: `1px solid ${line}`, boxShadow: 'none' },
      '&:focus': { border: `1px solid ${ink}`, boxShadow: `0 0 0 1px ${ink}` },
    },
    otpCodeFieldInput: {
      fontSize: '18px',
      border: `1px solid ${line}`,
      '&:focus': { border: `1px solid ${ink}`, boxShadow: `0 0 0 1px ${ink}` },
    },
    socialButtonsBlockButton: {
      minHeight: '46px',
      background: print,
      border: `1px solid ${line}`,
      boxShadow: 'none',
      '&:hover': { background: print, border: `1px solid ${ink}` },
    },

    // the yellow button with the hard shadow, same as the rest of the site
    formButtonPrimary: {
      minHeight: '48px',
      background: flash,
      color: ink,
      fontSize: '0.875rem',
      fontWeight: 600,
      border: `2px solid ${ink}`,
      boxShadow: `3px 3px 0 ${ink}`,
      '&:hover': { background: flash, boxShadow: `3px 3px 0 ${ink}` },
      '&:focus-visible': {
        background: flash,
        outline: `2px solid ${ink}`,
        outlineOffset: '3px',
      },
      // pressed: the button sinks into its shadow
      '&:active': {
        background: flash,
        boxShadow: `1px 1px 0 ${ink}`,
        transform: 'translate(2px, 2px)',
      },
    },
  },
}
