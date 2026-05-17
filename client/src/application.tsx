import { Toaster } from 'sonner';
import { QueryProvider } from '@/lib/query-provider';
import { AppRouter } from '@/routes/app-router';
import { ThemeProvider } from '@/lib/theme-provider';

export function AppRoot() {
    return (
        <ThemeProvider defaultTheme="system" storageKey="adminkit-theme">
            <QueryProvider>
                <AppRouter />
                <Toaster richColors position="bottom-right" />
            </QueryProvider>
        </ThemeProvider>
    );
}
