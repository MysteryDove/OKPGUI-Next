import MDEditor from '@uiw/react-md-editor';

interface MarkdownContentViewProps {
    content: string;
    emptyMessage?: string;
}

export default function MarkdownContentView({
    content,
    emptyMessage = '暂无内容',
}: MarkdownContentViewProps) {
    if (!content.trim()) {
        return <p className="py-8 text-center text-slate-500">{emptyMessage}</p>;
    }

    return (
        <div data-color-mode="dark" className="okp-md-preview">
            <MDEditor.Markdown source={content} style={{ whiteSpace: 'pre-wrap' }} />
        </div>
    );
}