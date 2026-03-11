import Tags from '@yaireo/tagify/react';
import { OKP_CONTENT_TAGS, parseOkpTagString, serializeOkpTags } from '../utils/okpTags';

interface TagInputProps {
    value: string;
    placeholder?: string;
    onChange: (value: string) => void;
    onBlur?: (value: string) => void;
}

interface TagifyCleanTag {
    value?: string;
}

interface TagifyEventDetail {
    tagify?: {
        getCleanValue?: () => TagifyCleanTag[];
    };
}

interface TagifyEvent {
    detail?: TagifyEventDetail;
}

const TAGIFY_SETTINGS = {
    delimiters: ',',
    duplicates: false,
    dropdown: {
        enabled: 0,
        maxItems: 12,
        closeOnSelect: false,
        highlightFirst: true,
    },
};

function extractSerializedTags(event: TagifyEvent, fallbackValue: string): string {
    const cleanTags = event.detail?.tagify?.getCleanValue?.();
    if (!cleanTags) {
        return fallbackValue;
    }

    return serializeOkpTags(cleanTags.map((tag) => tag.value ?? ''));
}

export default function TagInput({ value, placeholder, onChange, onBlur }: TagInputProps) {
    return (
        <Tags
            className="okp-tag-input"
            settings={TAGIFY_SETTINGS}
            whitelist={[...OKP_CONTENT_TAGS]}
            value={parseOkpTagString(value)}
            placeholder={placeholder}
            onChange={(event: TagifyEvent) => {
                onChange(extractSerializedTags(event, value));
            }}
            onBlur={(event: TagifyEvent) => {
                onBlur?.(extractSerializedTags(event, value));
            }}
        />
    );
}