/** Tokens tomados directamente de DESIGN.md (Artisanal Coffee Lab Editorial) */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F1E7D8',
        'paper-dim': '#E8DECB',
        'paper-card': '#ECE1D0',
        'paper-border': '#D4C5B0',
        espresso: '#3D2314',
        'espresso-dark': '#2C1810',
        caramel: '#C87A28',
        'caramel-dark': '#A45E14',
        cerulean: '#7CB9C8',
        coral: '#D97D78',
        mustard: '#E5A93C',
        'muted-text': '#5C3E2D'
      },
      fontFamily: {
        display: ['Epilogue', 'sans-serif'],
        body: ['Manrope', 'sans-serif']
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem'
      },
      spacing: {
        '3xs': '0.125rem',
        '2xs': '0.25rem',
        xs: '0.5rem',
        sm: '0.75rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        '3xl': '4rem'
      }
    }
  },
  plugins: []
};
