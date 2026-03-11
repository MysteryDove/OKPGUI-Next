import { useMemo, useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import MarkdownContentView from './MarkdownContentView';

type ContentTab = 'markdown-edit' | 'html-edit' | 'markdown-preview' | 'html-preview';

interface PublishContentEditorProps {
    markdown: string;
    html: string;
    onMarkdownChange: (markdown: string) => void;
    onHtmlChange: (html: string) => void;
    onTransformMarkdownToHtml: () => void;
}

const tabs: { key: ContentTab; label: string }[] = [
    { key: 'markdown-edit', label: 'MD 编辑' },
    { key: 'html-edit', label: 'HTML 编辑' },
    { key: 'markdown-preview', label: 'MD 预览' },
    { key: 'html-preview', label: 'HTML 预览' },
];

function buildHtmlPreviewDocument(html: string) {
    const body = html.trim()
        ? html
        : '<p class="okp-html-preview-empty">暂无内容</p>';

    return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <base target="_blank" />
  <style>
    :root { color-scheme: dark; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 20px;
      background: #0f172a;
      color: #cbd5e1;
      font: 14px/1.7 ui-sans-serif, system-ui, sans-serif;
      word-break: break-word;
    }
    a { color: #22d3ee; }
    img { max-width: 100%; height: auto; border-radius: 12px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #334155; padding: 8px 10px; }
    code, pre {
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
    }
    pre {
      overflow-x: auto;
      padding: 14px;
      border-radius: 12px;
      background: #020617;
    }
    blockquote {
      margin: 0 0 16px;
      padding-left: 16px;
      border-left: 4px solid rgba(16, 185, 129, 0.65);
      color: #94a3b8;
    }
    .okp-html-preview-empty {
      margin: 0;
      padding: 32px 0;
      text-align: center;
      color: #64748b;
    }
  </style>
</head>
<body>${body}</body>
</html>`;
}

export default function PublishContentEditor({
    markdown,
    html,
    onMarkdownChange,
    onHtmlChange,
    onTransformMarkdownToHtml,
}: PublishContentEditorProps) {
    const [activeTab, setActiveTab] = useState<ContentTab>('markdown-edit');

    const htmlPreviewDocument = useMemo(() => buildHtmlPreviewDocument(html), [html]);

    return (
        <div className="rounded-xl border border-slate-700/70 bg-slate-900/40">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/70 px-4 py-3">
                <div>
                    <label className="block text-xs text-slate-500">描述内容</label>
                    <p className="mt-1 text-xs text-slate-500">
                        Markdown 使用 react-md-editor 编辑，图片仍仅支持通过 URL 插入，本地图片上传不在此编辑器中处理。
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        onTransformMarkdownToHtml();
                        setActiveTab('html-edit');
                    }}
                    className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-xs font-medium text-cyan-300 transition-colors hover:border-cyan-400 hover:bg-cyan-500/15 hover:text-cyan-200"
                >
                    MD 转 HTML
                </button>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-slate-700/70 px-4 py-3">
                {tabs.map((tab) => {
                    const selected = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setActiveTab(tab.key)}
                            className={[
                                'rounded-lg px-3 py-1.5 text-sm transition-colors',
                                selected
                                    ? 'bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/40'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200',
                            ].join(' ')}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            <div className="p-4">
                {activeTab === 'markdown-edit' ? (
                    <div className="space-y-3">
                        <div data-color-mode="dark" className="okp-md-editor-shell overflow-hidden rounded-lg border border-slate-700">
                            <MDEditor
                                value={markdown}
                                onChange={(value) => onMarkdownChange(value ?? '')}
                                preview="edit"
                                visibleDragbar={false}
                                height={360}
                                textareaProps={{
                                    placeholder: '输入 Markdown 内容',
                                }}
                            />
                        </div>
                        <p className="text-xs text-slate-500">
                            HTML 站点可使用转换后的 HTML；Nyaa 和 ACG.RIP 仍以 Markdown 内容为准。
                        </p>
                    </div>
                ) : null}

                {activeTab === 'html-edit' ? (
                    <div className="space-y-3">
                        <textarea
                            value={html}
                            onChange={(event) => onHtmlChange(event.target.value)}
                            placeholder="可手动调整将要提交给 HTML 站点的内容；留空时发布会回退到 Markdown。"
                            rows={14}
                            className="w-full resize-y rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 font-mono text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <p className="text-xs text-slate-500">
                            HTML 仅用于 HTML 站点。若此处为空，发布时会回退到 Markdown 并交给 OKP 进行转换。
                        </p>
                    </div>
                ) : null}

                {activeTab === 'markdown-preview' ? (
                    <div className="min-h-72 rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                        <MarkdownContentView content={markdown} />
                    </div>
                ) : null}

                {activeTab === 'html-preview' ? (
                    <iframe
                        title="HTML 预览"
                        sandbox="allow-popups"
                        srcDoc={htmlPreviewDocument}
                        className="min-h-72 w-full rounded-lg border border-slate-700 bg-slate-800"
                    />
                ) : null}
            </div>
        </div>
    );
}