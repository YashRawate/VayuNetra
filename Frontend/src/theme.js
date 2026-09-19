/**
 * Forest Sage & Warm Amber Color Palette & Theme Tokens
 */

export const colors = {
  // 1. Primary Colors: Forest Sage
  sage: {
    50: '#F1F5EE',
    100: '#E0E9DA',
    200: '#C7D5BD',
    300: '#A6BC97', // SAGE_LIGHT
    500: '#7D9B76', // SAGE - Base
    600: '#647F5E',
    700: '#4F664A', // SAGE_DARK
    900: '#2D3A2B',
  },

  // 2. Secondary & Accent: Warm Amber
  amber: {
    50: '#FBF5EA',
    100: '#F4E5C7',
    200: '#ECD3A0',
    500: '#C8923A', // AMBER - Base
    600: '#A87A2C', // AMBER_DARK
    700: '#855F22',
  },

  // 3. Neutrals: Ink & Surfaces
  ink: {
    900: '#2C2C2C', // INK
    700: '#5A5A5A', // INK_BODY
    500: '#7A7A7A', // INK_MUTED
    300: '#A0A0A0',
    100: '#E8E8E8',
  },

  surface: {
    0: '#FFFFFF',
    1: '#FBFBFA',
    2: '#F6F4F0',
  },

  // 4. Semantic Status Indicators
  status: {
    success: {
      bg: '#E0E9DA',
      text: '#4F664A',
      border: '#C7D5BD',
    },
    warning: {
      bg: '#FBF5EA',
      text: '#855F22',
      border: '#ECD3A0',
    },
    error: {
      bg: '#FBEDED',
      text: '#9B2C2C',
      border: '#F2C8C8',
    },
  },

  // 5. Signature UI Gradients & Visual Effects
  effects: {
    gradient: 'linear-gradient(135deg, #7D9B76, #C8923A)',
    text3d: `
      0 1px 0 #7D9B76,
      0 2px 0 #6F8C69,
      0 3px 0 #647F5E,
      0 4px 0 #586F52,
      0 5px 0 #4F664A
    `,
    sageGlow: 'rgba(125, 155, 118, 0.18)',
    amberGlow: 'rgba(200, 146, 58, 0.18)',
  },
};

export default colors;
