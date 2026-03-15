export type StartupPage = 'home' | 'quick_publish';

const STARTUP_PAGE_STORAGE_KEY = 'okpgui:startup-page';

export function getStartupPagePreference(): StartupPage {
    if (typeof window === 'undefined') {
        return 'home';
    }

    const storedValue = window.localStorage.getItem(STARTUP_PAGE_STORAGE_KEY);

    return storedValue === 'quick_publish' ? 'quick_publish' : 'home';
}

export function setStartupPagePreference(page: StartupPage) {
    if (typeof window === 'undefined') {
        return;
    }

    window.localStorage.setItem(STARTUP_PAGE_STORAGE_KEY, page);
}