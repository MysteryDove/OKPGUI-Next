import MarkdownIt from 'markdown-it';

const markdownRenderer = new MarkdownIt({
    html: true,
    breaks: true,
    linkify: false,
    typographer: false,
});

export function renderMarkdownToHtml(markdown: string) {
    return markdownRenderer.render(markdown);
}