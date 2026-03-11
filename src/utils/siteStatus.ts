export type SiteLoginStatus = 'testing' | 'success' | 'error';

export type PublishStatus = 'idle' | 'running' | 'success' | 'error';

const siteLoginStatusStyles: Record<
    SiteLoginStatus,
    { badge: string; label: string; message: string }
> = {
    testing: {
        badge: 'border-cyan-400/40 bg-cyan-500/10 text-cyan-200',
        label: '测试中',
        message: 'text-cyan-300',
    },
    success: {
        badge: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200',
        label: '通过',
        message: 'text-emerald-300',
    },
    error: {
        badge: 'border-red-400/40 bg-red-500/10 text-red-200',
        label: '失败',
        message: 'text-red-300',
    },
};

const publishStatusStyles: Record<
    PublishStatus,
    { badge: string; label: string; text: string }
> = {
    idle: {
        badge: 'border-slate-600 bg-slate-700/40 text-slate-300',
        label: '未开始',
        text: 'text-slate-400',
    },
    running: {
        badge: 'border-cyan-400/40 bg-cyan-500/10 text-cyan-200',
        label: '发布中',
        text: 'text-cyan-300',
    },
    success: {
        badge: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200',
        label: '成功',
        text: 'text-emerald-300',
    },
    error: {
        badge: 'border-red-400/40 bg-red-500/10 text-red-200',
        label: '失败',
        text: 'text-red-300',
    },
};

export function getSiteLoginStateBadgeClass(status: SiteLoginStatus): string {
    return siteLoginStatusStyles[status].badge;
}

export function getSiteLoginStateLabel(status: SiteLoginStatus): string {
    return siteLoginStatusStyles[status].label;
}

export function getSiteLoginMessageClass(status: SiteLoginStatus): string {
    return siteLoginStatusStyles[status].message;
}

export function getPublishStatusBadgeClass(status: PublishStatus): string {
    return publishStatusStyles[status].badge;
}

export function getPublishStatusLabel(status: PublishStatus): string {
    return publishStatusStyles[status].label;
}

export function getPublishStatusTextClass(status: PublishStatus): string {
    return publishStatusStyles[status].text;
}