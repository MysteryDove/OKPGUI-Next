import { invoke } from '@tauri-apps/api/core';
import { open, save } from '@tauri-apps/plugin-dialog';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    ContentTemplate,
    QuickPublishConfigPayload,
    QuickPublishTemplate,
    createDefaultContentTemplate,
    createDefaultPublishHistory,
    createDefaultQuickPublishTemplate,
    createTemplateIdFromName,
    createUpdatedAtTimestamp,
    normalizeContentTemplate,
    normalizeQuickPublishTemplate,
} from '../utils/quickPublish';

type AnyTemplate = QuickPublishTemplate | ContentTemplate;

interface TemplateManagerConfig<T extends AnyTemplate> {
    configKey: 'quick_publish_templates' | 'content_templates';
    createDefault: () => T;
    normalize: (t: Partial<T>) => T;
    saveCommand: string;
    deleteCommand: string;
    importCommand: string;
    exportCommand: string;
    fallbackPrefix: string;
    fallbackName: string;
    fileFilterName: string;
    entityLabel: string;
}

function serializeForComparison<T extends AnyTemplate>(template: T): string {
    return JSON.stringify({
        ...template,
        updated_at: '',
    });
}

function buildPersistableTemplate<T extends AnyTemplate>(
    template: T,
    normalize: (t: Partial<T>) => T,
    fallbackPrefix: string,
    fallbackName: string,
): T {
    const name = (template as AnyTemplate).name.trim() || fallbackName;

    return normalize({
        ...template,
        id: (template as AnyTemplate).id.trim() || createTemplateIdFromName(name, fallbackPrefix),
        name,
        updated_at: createUpdatedAtTimestamp(),
    } as Partial<T>);
}

export interface TemplateManagerState<T extends AnyTemplate> {
    templates: Record<string, T>;
    draft: T;
    selectedTemplateId: string;
    sortedTemplates: T[];
    statusMessage: string;
    errorMessage: string;
    hasPendingAutosave: boolean;

    selectTemplate: (id: string) => void;
    createTemplate: () => void;
    duplicateTemplate: () => void;
    updateDraft: (updater: (current: T) => T) => void;
    deleteTemplate: () => Promise<void>;
    importTemplate: () => Promise<void>;
    exportTemplate: () => Promise<void>;
    loadData: (preferredId?: string) => Promise<void>;
}

export function useTemplateManager<T extends AnyTemplate>(
    config: TemplateManagerConfig<T>,
): TemplateManagerState<T> {
    const [templates, setTemplates] = useState<Record<string, T>>({});
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [draft, setDraft] = useState<T>(config.createDefault());
    const [statusMessage, setStatusMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [hasPendingAutosave, setHasPendingAutosave] = useState(false);
    const latestDraftRef = useRef(draft);
    const lastPersistedSnapshotRef = useRef(serializeForComparison(config.createDefault()));

    latestDraftRef.current = draft;

    const sortedTemplates = useMemo(
        () =>
            Object.values(templates).sort((left, right) => {
                const byUpdatedAt = right.updated_at.localeCompare(left.updated_at);
                if (byUpdatedAt !== 0) {
                    return byUpdatedAt;
                }

                return left.name.localeCompare(right.name, 'zh-CN');
            }),
        [templates],
    );

    useEffect(() => {
        void loadData();
    }, []);

    useEffect(() => {
        if (!hasPendingAutosave) {
            return undefined;
        }

        const autosaveTimer = window.setTimeout(() => {
            void persistDraft(latestDraftRef.current);
        }, 700);

        return () => window.clearTimeout(autosaveTimer);
    }, [draft, hasPendingAutosave]);

    const loadData = async (preferredId?: string) => {
        const fullConfig = await invoke<QuickPublishConfigPayload>('get_config');
        const rawTemplates = (fullConfig[config.configKey] ?? {}) as Record<string, Partial<T>>;

        const nextTemplates = Object.fromEntries(
            Object.entries(rawTemplates).map(([id, template]) => [
                id,
                config.normalize({ id, ...template } as Partial<T>),
            ]),
        ) as Record<string, T>;

        setTemplates(nextTemplates);

        const resolvedId =
            preferredId && nextTemplates[preferredId]
                ? preferredId
                : selectedTemplateId && nextTemplates[selectedTemplateId]
                  ? selectedTemplateId
                  : sortedObjectKeys(nextTemplates)[0] ?? '';

        if (!resolvedId) {
            setSelectedTemplateId('');
            const emptyDraft = config.createDefault();
            setDraft(emptyDraft);
            lastPersistedSnapshotRef.current = serializeForComparison(emptyDraft);
            setHasPendingAutosave(false);
            return;
        }

        setSelectedTemplateId(resolvedId);
        setDraft(nextTemplates[resolvedId]);
        lastPersistedSnapshotRef.current = serializeForComparison(nextTemplates[resolvedId]);
        setHasPendingAutosave(false);
    };

    const persistDraft = async (sourceDraft: T) => {
        const sourceSnapshot = serializeForComparison(sourceDraft);
        const templateToSave = buildPersistableTemplate(
            sourceDraft,
            config.normalize,
            config.fallbackPrefix,
            config.fallbackName,
        );
        const persistedSnapshot = serializeForComparison(templateToSave);

        if (persistedSnapshot === lastPersistedSnapshotRef.current) {
            if (serializeForComparison(latestDraftRef.current) === sourceSnapshot) {
                setHasPendingAutosave(false);
            }
            return;
        }

        try {
            await invoke(config.saveCommand, { template: templateToSave });
            lastPersistedSnapshotRef.current = persistedSnapshot;
            setTemplates((current) => ({
                ...current,
                [templateToSave.id]: templateToSave,
            }));
            setSelectedTemplateId(templateToSave.id);
            setDraft((current) =>
                serializeForComparison(current) === sourceSnapshot
                    ? templateToSave
                    : current,
            );
            if (serializeForComparison(latestDraftRef.current) === sourceSnapshot) {
                setHasPendingAutosave(false);
            }
            setStatusMessage(`${config.entityLabel}"${templateToSave.name}"已自动保存。`);
            setErrorMessage('');
        } catch (error) {
            setErrorMessage(typeof error === 'string' ? error : `自动保存${config.entityLabel}失败。`);
            setStatusMessage('');
        }
    };

    const updateDraft = (updater: (current: T) => T) => {
        setDraft((current) => updater(current));
        setHasPendingAutosave(true);
        setStatusMessage('');
        setErrorMessage('');
    };

    const selectTemplate = (id: string) => {
        setSelectedTemplateId(id);
        const nextDraft = templates[id] ?? config.createDefault();
        setDraft(nextDraft);
        lastPersistedSnapshotRef.current = serializeForComparison(nextDraft);
        setHasPendingAutosave(false);
        setStatusMessage('');
        setErrorMessage('');
    };

    const createTemplate = () => {
        const emptyDraft = config.createDefault();
        setSelectedTemplateId('');
        setDraft(emptyDraft);
        setHasPendingAutosave(false);
        setStatusMessage(`已创建空白${config.entityLabel}草稿。`);
        setErrorMessage('');
    };

    const duplicateTemplate = () => {
        const duplicatedName = draft.name.trim() ? `${draft.name} 副本` : config.fallbackName;

        const duplicated = {
            ...draft,
            id: '',
            name: duplicatedName,
            updated_at: '',
        } as T;

        // Clear publish_history for QuickPublishTemplate copies
        if ('publish_history' in duplicated) {
            (duplicated as QuickPublishTemplate).publish_history = createDefaultPublishHistory();
        }

        setSelectedTemplateId('');
        setDraft(duplicated);
        setHasPendingAutosave(false);
        setStatusMessage(`已基于当前${config.entityLabel}创建副本草稿。`);
        setErrorMessage('');
    };

    const importTemplate = async () => {
        try {
            const selectedFile = await open({
                filters: [{ name: config.fileFilterName, extensions: ['json'] }],
                multiple: false,
            });

            const importPath = Array.isArray(selectedFile) ? selectedFile[0] : selectedFile;
            if (!importPath) {
                return;
            }

            const imported = await invoke<{ id: string; template: T }>(
                config.importCommand,
                { path: importPath },
            );

            await loadData(imported.id);
            setStatusMessage(`已导入${config.entityLabel}"${imported.template.name || imported.id}"。`);
            setErrorMessage('');
        } catch (error) {
            setErrorMessage(typeof error === 'string' ? error : `导入${config.entityLabel}失败。`);
            setStatusMessage('');
        }
    };

    const exportTemplate = async () => {
        const id = selectedTemplateId || draft.id.trim();
        if (!id) {
            setErrorMessage(`请先选择或保存一个${config.entityLabel}。`);
            setStatusMessage('');
            return;
        }

        try {
            const name = draft.name.trim() || id;
            const selectedPath = await save({
                defaultPath: `${name}.json`,
                filters: [{ name: config.fileFilterName, extensions: ['json'] }],
            });
            if (!selectedPath) {
                return;
            }

            await invoke(config.exportCommand, {
                id,
                path: selectedPath,
            });
            setStatusMessage(`已导出${config.entityLabel}"${name}"。`);
            setErrorMessage('');
        } catch (error) {
            setErrorMessage(typeof error === 'string' ? error : `导出${config.entityLabel}失败。`);
            setStatusMessage('');
        }
    };

    const deleteTemplate = async () => {
        if (!selectedTemplateId) {
            setDraft(config.createDefault());
            return;
        }

        try {
            await invoke(config.deleteCommand, { id: selectedTemplateId });
            const deletedName = draft.name || selectedTemplateId;
            await loadData();
            setStatusMessage(`${config.entityLabel}"${deletedName}"已删除。`);
            setErrorMessage('');
        } catch (error) {
            setErrorMessage(typeof error === 'string' ? error : `删除${config.entityLabel}失败。`);
            setStatusMessage('');
        }
    };

    return {
        templates,
        draft,
        selectedTemplateId,
        sortedTemplates,
        statusMessage,
        errorMessage,
        hasPendingAutosave,
        selectTemplate,
        createTemplate,
        duplicateTemplate,
        updateDraft,
        deleteTemplate,
        importTemplate,
        exportTemplate,
        loadData,
    };
}

export const quickPublishTemplateManagerConfig: TemplateManagerConfig<QuickPublishTemplate> = {
    configKey: 'quick_publish_templates',
    createDefault: createDefaultQuickPublishTemplate,
    normalize: normalizeQuickPublishTemplate,
    saveCommand: 'save_quick_publish_template',
    deleteCommand: 'delete_quick_publish_template',
    importCommand: 'import_quick_publish_template_from_file',
    exportCommand: 'export_quick_publish_template_to_file',
    fallbackPrefix: 'quick-publish',
    fallbackName: '未命名发布模板',
    fileFilterName: '快速发布模板文件',
    entityLabel: '发布模板',
};

export const contentTemplateManagerConfig: TemplateManagerConfig<ContentTemplate> = {
    configKey: 'content_templates',
    createDefault: createDefaultContentTemplate,
    normalize: normalizeContentTemplate,
    saveCommand: 'save_content_template',
    deleteCommand: 'delete_content_template',
    importCommand: 'import_content_template_from_file',
    exportCommand: 'export_content_template_to_file',
    fallbackPrefix: 'content',
    fallbackName: '未命名公共正文模板',
    fileFilterName: '正文模板文件',
    entityLabel: '公共正文模板',
};

function sortedObjectKeys<T>(collection: Record<string, T>): string[] {
    return Object.keys(collection).sort((left, right) => left.localeCompare(right, 'zh-CN'));
}
