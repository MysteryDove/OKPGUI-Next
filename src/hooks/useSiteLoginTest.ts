import { invoke } from '@tauri-apps/api/core';
import { useMemo, useState } from 'react';
import { getSiteCookieText, SiteCookies } from '../utils/cookieUtils';
import { SiteLoginStatus } from '../utils/siteStatus';

export interface SiteLoginTestState {
    status: SiteLoginStatus;
    message: string;
}

export interface SiteDefinition {
    key: string;
    label: string;
    loginEnabled: boolean;
    nameField: string;
    tokenField?: string;
}

export interface ProfileLike {
    user_agent: string;
    site_cookies: SiteCookies;
    [key: string]: unknown;
}

interface SiteLoginTestResult {
    success: boolean;
    message: string;
}

export function useSiteLoginTest() {
    const [siteLoginTests, setSiteLoginTests] = useState<Record<string, SiteLoginTestState>>({});
    const [isTestingAllSiteLogins, setIsTestingAllSiteLogins] = useState(false);

    const hasRunningSiteLoginTest = useMemo(
        () => Object.values(siteLoginTests).some((test) => test.status === 'testing'),
        [siteLoginTests],
    );

    const clearSiteLoginTest = (siteCode: string) => {
        setSiteLoginTests((current) => {
            if (!(siteCode in current)) {
                return current;
            }

            const nextState = { ...current };
            delete nextState[siteCode];
            return nextState;
        });
    };

    const clearAllSiteLoginTests = () => {
        setSiteLoginTests({});
    };

    const runSiteLoginTest = async (
        site: SiteDefinition,
        profileData: ProfileLike,
    ) => {
        if (!site.loginEnabled) {
            return;
        }

        const rawText = getSiteCookieText(profileData.site_cookies, site.key);
        if (!rawText.trim()) {
            setSiteLoginTests((current) => ({
                ...current,
                [site.key]: {
                    status: 'error',
                    message: `请先在身份页面配置 ${site.label} 的 Cookie。`,
                },
            }));
            return;
        }

        setSiteLoginTests((current) => ({
            ...current,
            [site.key]: {
                status: 'testing',
                message: `正在测试 ${site.label} 登录状态...`,
            },
        }));

        try {
            const expectedName = String(profileData[site.nameField] ?? '').trim();
            const result = await invoke<SiteLoginTestResult>('test_site_login', {
                site: site.key,
                cookieText: rawText,
                userAgent: profileData.user_agent.trim() || null,
                expectedName: expectedName || null,
            });

            setSiteLoginTests((current) => ({
                ...current,
                [site.key]: {
                    status: result.success ? 'success' : 'error',
                    message: result.message,
                },
            }));
        } catch (error) {
            setSiteLoginTests((current) => ({
                ...current,
                [site.key]: {
                    status: 'error',
                    message: typeof error === 'string' ? error : '登录测试失败。',
                },
            }));
        }
    };

    const handleSiteLoginTest = async (
        site: SiteDefinition,
        profileData: ProfileLike | null,
    ) => {
        if (!profileData || !site.loginEnabled || isTestingAllSiteLogins) {
            return;
        }

        await runSiteLoginTest(site, profileData);
    };

    const handleTestAllSiteLogins = async (
        sites: SiteDefinition[],
        profileData: ProfileLike | null,
    ) => {
        if (!profileData || isTestingAllSiteLogins || hasRunningSiteLoginTest) {
            return;
        }

        const loginSites = sites.filter((site) => site.loginEnabled);
        if (loginSites.length === 0) {
            return;
        }

        setIsTestingAllSiteLogins(true);
        try {
            for (const site of loginSites) {
                await runSiteLoginTest(site, profileData);
            }
        } finally {
            setIsTestingAllSiteLogins(false);
        }
    };

    return {
        siteLoginTests,
        isTestingAllSiteLogins,
        hasRunningSiteLoginTest,
        clearSiteLoginTest,
        clearAllSiteLoginTests,
        handleSiteLoginTest,
        handleTestAllSiteLogins,
    };
}

export const siteDefinitions: SiteDefinition[] = [
    { key: 'dmhy', label: '动漫花园', loginEnabled: true, nameField: 'dmhy_name' },
    { key: 'nyaa', label: 'Nyaa', loginEnabled: true, nameField: 'nyaa_name' },
    { key: 'acgrip', label: 'ACG.RIP', loginEnabled: true, nameField: 'acgrip_name' },
    { key: 'bangumi', label: '萌番组', loginEnabled: true, nameField: 'bangumi_name' },
    {
        key: 'acgnx_asia',
        label: 'ACGNx Asia',
        loginEnabled: false,
        nameField: 'acgnx_asia_name',
        tokenField: 'acgnx_asia_token',
    },
    {
        key: 'acgnx_global',
        label: 'ACGNx Global',
        loginEnabled: false,
        nameField: 'acgnx_global_name',
        tokenField: 'acgnx_global_token',
    },
];
