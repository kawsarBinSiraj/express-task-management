'use client';

import * as React from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeProviderProps {
    children: React.ReactNode;
    defaultTheme?: Theme;
    storageKey?: string;
}

interface ThemeContextValue {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = React.createContext<ThemeContextValue>({
    theme: 'system',
    setTheme: () => {},
});

export function ThemeProvider({
    children,
    defaultTheme = 'system',
    storageKey = 'vite-ui-theme',
}: ThemeProviderProps) {
    const [theme, setThemeState] = React.useState<Theme>(
        () => (localStorage.getItem(storageKey) as Theme) ?? defaultTheme,
    );

    React.useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        const resolved =
            theme === 'system'
                ? window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? 'dark'
                    : 'light'
                : theme;
        root.classList.add(resolved);
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        localStorage.setItem(storageKey, newTheme);
        setThemeState(newTheme);
    };

    return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => React.useContext(ThemeContext);
