export const COLORS = {
    primary: '#6366f1', // Indigo 500
    secondary: '#ec4899', // Pink 500
    accent: '#10b981', // Emerald 500
    warning: '#f59e0b', // Amber 500
    error: '#ef4444', // Red 500
    background: '#f8fafc', // Slate 50
    card: '#ffffff',
    text: {
        primary: '#1e293b', // Slate 800
        secondary: '#64748b', // Slate 500
        light: '#94a3b8', // Slate 400
        inverted: '#ffffff',
    },
    border: '#e2e8f0', // Slate 200
    gradients: {
        primary: ['#6366f1', '#818cf8'],
        warm: ['#f43f5e', '#fb7185'],
        cool: ['#06b6d4', '#22d3ee'],
    }
};

export const SPACING = {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 40,
};

export const SHADOWS = {
    small: {
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    medium: {
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    large: {
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
};

export const FONTS = {
    sizes: {
        h1: 32,
        h2: 24,
        h3: 20,
        body: 16,
        small: 14,
        tiny: 12,
    },
    weights: {
        regular: '400',
        medium: '500',
        bold: '700',
        extraBold: '800',
    } as const
};
