export const OKP_CONTENT_TAGS = [
    'Anime',
    'Music',
    'Action',
    'Picture',
    'Comic',
    'Novel',
    'Software',
    'Others',
    'MV',
    'Chinese',
    'HongKong',
    'Taiwan',
    'English',
    'Japanese',
    'TV',
    'Movie',
    'Batch',
    'Collection',
    'Raw',
    'Lossless',
    'Lossy',
    'ACG',
    'Doujin',
    'Pop',
    'Idol',
    'Tokusatsu',
    'Show',
    'Graphics',
    'Photo',
    'App',
    'Game',
] as const;

export const DEFAULT_OKP_TAGS = 'Anime';

export function parseOkpTagString(raw: string): string[] {
    return raw
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
}

export function serializeOkpTags(tags: readonly string[]): string {
    return Array.from(
        new Set(
            tags
                .map((tag) => tag.trim())
                .filter((tag) => tag.length > 0),
        ),
    ).join(', ');
}