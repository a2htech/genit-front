const BLACK = '#000000'

/** Réplique les tokens neo-brutalistes de app/styles/main.css (bordures 2px, ombres dures, radius 0). */
export const clerkAppearance = {
  variables: {
    colorPrimary: '#3b6e91',
    colorPrimaryForeground: '#ffffff',
    colorBackground: '#ffffff',
    colorForeground: BLACK,
    colorMutedForeground: 'rgba(0, 0, 0, 0.6)',
    colorInput: '#ffffff',
    colorInputForeground: BLACK,
    colorNeutral: BLACK,
    colorBorder: BLACK,
    colorDanger: '#ef4444',
    colorSuccess: '#22c55e',
    colorWarning: '#facc15',
    colorRing: '#3b6e91',
    fontFamily: '"Inter", sans-serif',
    fontFamilyButtons: '"Space Grotesk", sans-serif',
    borderRadius: '0px',
  },
  elements: {
    /** cl-button / cl-input portent des règles bordure/ombre définies après les descripteurs cl-form*,
     * elles gagnent la cascade à spécificité égale : !important nécessaire pour ces deux propriétés. */
    cardBox: {
      border: '0 !important',
      boxShadow: 'none !important',
    },
    card: {
      border: `2px solid ${BLACK}`,
      boxShadow: `4px 4px 0 0 ${BLACK}`,
    },
    formButtonPrimary: {
      border: `2px solid ${BLACK} !important`,
      boxShadow: `4px 4px 0 0 ${BLACK} !important`,
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '0.02em',
      transition: 'all 100ms',
      '&:hover': {
        transform: 'translate(2px, 2px)',
        boxShadow: `2px 2px 0 0 ${BLACK} !important`,
      },
    },
    socialButtonsBlockButton: {
      border: `2px solid ${BLACK} !important`,
      boxShadow: `2px 2px 0 0 ${BLACK} !important`,
    },
    formFieldInput: {
      border: `2px solid ${BLACK} !important`,
    },
    footerActionLink: {
      color: '#3b6e91',
      fontWeight: 700,
    },
    dividerLine: {
      backgroundColor: BLACK,
    },
  },
}
