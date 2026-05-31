export const THEME_KEY = 'fitnessApp_activeTheme';

export const themes = [
  {
    name: 'The Beast',
    id: 'beast',
    palette: {
      'brand-primary': '#A3E635',
      'brand-secondary': '#82b82a',
      'brand-alert': '#EF4444',
      'brand-orange': '#FF9500',
      'base-100': '#121212',
      'base-200': 'rgba(45, 45, 45, 0.6)',
      'base-300': 'rgba(255, 255, 255, 0.1)',
      'content-100': '#FFFFFF',
      'content-200': '#94a3b8',
    },
  },
  {
    name: 'Nordic Fog',
    id: 'nordic_fog',
    palette: {
      'brand-primary': '#798071',
      'brand-secondary': '#999ac6',
      'brand-alert': '#EF4444',
      'brand-orange': '#FF9500',
      'base-100': '#eef0f5',
      'base-200': 'rgba(210, 213, 221, 0.6)',
      'base-300': 'rgba(184, 186, 207, 0.5)',
      'content-100': '#333333',
      'content-200': '#666666',
    },
  },
  {
    name: 'Alpine Lake',
    id: 'alpine_lake',
    palette: {
      'brand-primary': '#c6ebbe',
      'brand-secondary': '#95b2b0',
      'brand-alert': '#EF4444',
      'brand-orange': '#FF9500',
      'base-100': '#0f172a',
      'base-200': 'rgba(100, 122, 163, 0.2)',
      'base-300': 'rgba(149, 178, 176, 0.2)',
      'content-100': '#f1f5f9',
      'content-200': '#94a3b8',
    },
  },
  {
    name: 'Earthen Core',
    id: 'earthen_core',
    palette: {
      'brand-primary': '#82a6b1',
      'brand-secondary': '#76877d',
      'brand-alert': '#EF4444',
      'brand-orange': '#FF9500',
      'base-100': '#291d11',
      'base-200': 'rgba(114, 105, 83, 0.3)',
      'base-300': 'rgba(118, 135, 125, 0.2)',
      'content-100': '#f5f5f4',
      'content-200': '#a8a29e',
    },
  },
  {
    name: 'Cyber Ocean',
    id: 'cyber_ocean',
    palette: {
      'brand-primary': '#63ccca',
      'brand-secondary': '#5da399',
      'brand-alert': '#EF4444',
      'brand-orange': '#FF9500',
      'base-100': '#1a202c',
      'base-200': 'rgba(66, 133, 140, 0.6)',
      'base-300': 'rgba(57, 115, 103, 0.2)',
      'content-100': '#FFFFFF',
      'content-200': '#a0aec0',
    },
  },
  {
    name: 'Retro Neon',
    id: 'retro_neon',
    palette: {
      'brand-primary': '#cc59d2',
      'brand-secondary': '#9046cf',
      'brand-alert': '#EF4444',
      'brand-orange': '#FF9500',
      'base-100': '#1c0f2b',
      'base-200': 'rgba(144, 70, 207, 0.2)',
      'base-300': 'rgba(204, 89, 210, 0.2)',
      'content-100': '#fff3f0',
      'content-200': '#f487b6',
    },
  },
];

export const applyTheme = (themeId) => {
    document.documentElement.setAttribute('data-theme', themeId);
};

export const getSavedTheme = () => {
    return localStorage.getItem(THEME_KEY) || 'beast';
};

export const saveTheme = (themeId) => {
    localStorage.setItem(THEME_KEY, themeId);
};
