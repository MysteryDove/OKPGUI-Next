use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

#[derive(Debug, Clone, Serialize, Deserialize)]
struct PortableTemplate {
    pub ep_pattern: String,
    #[serde(default)]
    pub resolution_pattern: String,
    pub title_pattern: String,
    pub poster: String,
    pub about: String,
    pub tags: String,
    pub description: String,
    #[serde(default)]
    pub description_html: String,
    pub profile: String,
    pub title: String,
    #[serde(default)]
    pub publish_history: SitePublishHistory,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ContentTemplate {
    pub id: String,
    pub name: String,
    #[serde(default)]
    pub summary: String,
    #[serde(default)]
    pub markdown: String,
    #[serde(default)]
    pub html: String,
    #[serde(default)]
    pub site_notes: String,
    #[serde(default)]
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct QuickPublishTemplate {
    pub id: String,
    pub name: String,
    #[serde(default)]
    pub summary: String,
    #[serde(default)]
    pub title: String,
    #[serde(default)]
    pub ep_pattern: String,
    #[serde(default)]
    pub resolution_pattern: String,
    #[serde(default)]
    pub title_pattern: String,
    #[serde(default)]
    pub poster: String,
    #[serde(default)]
    pub about: String,
    #[serde(default)]
    pub tags: String,
    #[serde(default)]
    pub default_profile: String,
    #[serde(default)]
    pub default_sites: SiteSelection,
    #[serde(default)]
    pub body_markdown: String,
    #[serde(default)]
    pub body_html: String,
    #[serde(default)]
    pub shared_content_template_id: Option<String>,
    #[serde(default, rename = "content_template_id", skip_serializing)]
    pub legacy_content_template_id: Option<String>,
    #[serde(default)]
    pub publish_history: SitePublishHistory,
    #[serde(default)]
    pub updated_at: String,
}

impl From<Template> for PortableTemplate {
    fn from(template: Template) -> Self {
        Self {
            ep_pattern: template.ep_pattern,
            resolution_pattern: template.resolution_pattern,
            title_pattern: template.title_pattern,
            poster: template.poster,
            about: template.about,
            tags: template.tags,
            description: template.description,
            description_html: template.description_html,
            profile: template.profile,
            title: template.title,
            publish_history: template.publish_history,
        }
    }
}

impl From<PortableTemplate> for Template {
    fn from(template: PortableTemplate) -> Self {
        Self {
            ep_pattern: template.ep_pattern,
            resolution_pattern: template.resolution_pattern,
            title_pattern: template.title_pattern,
            poster: template.poster,
            about: template.about,
            tags: template.tags,
            description: template.description,
            description_html: template.description_html,
            profile: template.profile,
            title: template.title,
            publish_history: template.publish_history,
            sites: SiteSelection::default(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct ImportedTemplateFile {
    #[serde(default)]
    name: String,
    template: PortableTemplate,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct ImportedQuickPublishTemplateFile {
    #[serde(default)]
    id: String,
    template: QuickPublishTemplate,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct ImportedContentTemplateFile {
    #[serde(default)]
    id: String,
    template: ContentTemplate,
}

#[derive(Debug, Clone, Serialize)]
pub struct ImportedTemplatePayload {
    pub name: String,
    pub template: Template,
}

#[derive(Debug, Clone, Serialize)]
pub struct ImportedQuickPublishTemplatePayload {
    pub id: String,
    pub template: QuickPublishTemplate,
}

#[derive(Debug, Clone, Serialize)]
pub struct ImportedContentTemplatePayload {
    pub id: String,
    pub template: ContentTemplate,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(untagged)]
enum TemplateImportFileFormat {
    Wrapped(ImportedTemplateFile),
    Portable(PortableTemplate),
    Raw(Template),
}

#[derive(Debug, Clone, Deserialize)]
#[serde(untagged)]
enum QuickPublishTemplateImportFileFormat {
    Wrapped(ImportedQuickPublishTemplateFile),
    Raw(QuickPublishTemplate),
}

#[derive(Debug, Clone, Deserialize)]
#[serde(untagged)]
enum ContentTemplateImportFileFormat {
    Wrapped(ImportedContentTemplateFile),
    Raw(ContentTemplate),
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SiteSelection {
    pub dmhy: bool,
    pub nyaa: bool,
    pub acgrip: bool,
    pub bangumi: bool,
    pub acgnx_asia: bool,
    pub acgnx_global: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SitePublishHistoryEntry {
    #[serde(default)]
    pub last_published_at: String,
    #[serde(default)]
    pub last_published_episode: String,
    #[serde(default)]
    pub last_published_resolution: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SitePublishHistory {
    #[serde(default)]
    pub dmhy: SitePublishHistoryEntry,
    #[serde(default)]
    pub nyaa: SitePublishHistoryEntry,
    #[serde(default)]
    pub acgrip: SitePublishHistoryEntry,
    #[serde(default)]
    pub bangumi: SitePublishHistoryEntry,
    #[serde(default)]
    pub acgnx_asia: SitePublishHistoryEntry,
    #[serde(default)]
    pub acgnx_global: SitePublishHistoryEntry,
}

impl SitePublishHistory {
    fn get_mut(&mut self, site_key: &str) -> Option<&mut SitePublishHistoryEntry> {
        match site_key {
            "dmhy" => Some(&mut self.dmhy),
            "nyaa" => Some(&mut self.nyaa),
            "acgrip" => Some(&mut self.acgrip),
            "bangumi" => Some(&mut self.bangumi),
            "acgnx_asia" => Some(&mut self.acgnx_asia),
            "acgnx_global" => Some(&mut self.acgnx_global),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, Deserialize)]
pub struct TemplatePublishHistoryUpdate {
    pub site_key: String,
    pub last_published_at: String,
    pub last_published_episode: String,
    #[serde(default)]
    pub last_published_resolution: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct Template {
    pub ep_pattern: String,
    #[serde(default)]
    pub resolution_pattern: String,
    pub title_pattern: String,
    pub poster: String,
    pub about: String,
    pub tags: String,
    pub description: String,
    #[serde(default)]
    pub description_html: String,
    pub profile: String,
    pub title: String,
    #[serde(default)]
    pub publish_history: SitePublishHistory,
    pub sites: SiteSelection,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProxyConfig {
    pub proxy_type: String,
    pub proxy_host: String,
}

impl Default for ProxyConfig {
    fn default() -> Self {
        Self {
            proxy_type: "none".to_string(),
            proxy_host: String::new(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AppConfig {
    pub last_used_template: Option<String>,
    #[serde(default)]
    pub last_used_quick_publish_template: Option<String>,
    pub proxy: ProxyConfig,
    #[serde(default)]
    pub okp_executable_path: String,
    #[serde(default)]
    pub templates: HashMap<String, Template>,
    #[serde(default)]
    pub quick_publish_templates: HashMap<String, QuickPublishTemplate>,
    #[serde(default)]
    pub content_templates: HashMap<String, ContentTemplate>,
}

fn config_path(app: &AppHandle) -> PathBuf {
    let data_dir = app
        .path()
        .app_data_dir()
        .expect("failed to get app data dir");
    std::fs::create_dir_all(&data_dir).ok();
    data_dir.join("okpgui_config.json")
}

pub fn load_config(app: &AppHandle) -> AppConfig {
    let path = config_path(app);
    if path.exists() {
        let data = std::fs::read_to_string(&path).unwrap_or_default();
        let mut config: AppConfig = serde_json::from_str(&data).unwrap_or_default();
        migrate_quick_publish_templates(&mut config);
        config
    } else {
        AppConfig::default()
    }
}

fn migrate_quick_publish_templates(config: &mut AppConfig) {
    let content_templates = config.content_templates.clone();

    for template in config.quick_publish_templates.values_mut() {
        migrate_quick_publish_template(template, &content_templates);
    }
}

fn migrate_quick_publish_template(
    template: &mut QuickPublishTemplate,
    content_templates: &HashMap<String, ContentTemplate>,
) {
    let legacy_template_id = template.legacy_content_template_id.take();

    if template.shared_content_template_id.is_none()
        && template.body_markdown.trim().is_empty()
        && template.body_html.trim().is_empty()
    {
        if let Some(content_template_id) = legacy_template_id.as_deref() {
            if let Some(content_template) = content_templates.get(content_template_id) {
                template.body_markdown = content_template.markdown.clone();
                template.body_html = content_template.html.clone();
            }
        }
    }
}

pub fn save_config_to_disk(app: &AppHandle, config: &AppConfig) {
    let path = config_path(app);
    if let Ok(data) = serde_json::to_string_pretty(config) {
        std::fs::write(path, data).ok();
    }
}

#[tauri::command]
pub fn get_config(app: AppHandle) -> AppConfig {
    load_config(&app)
}

#[tauri::command]
pub fn get_template_list(app: AppHandle) -> Vec<String> {
    let config = load_config(&app);
    config.templates.keys().cloned().collect()
}

#[tauri::command]
pub fn save_template(app: AppHandle, name: String, template: Template) {
    let mut config = load_config(&app);
    config.templates.insert(name.clone(), template);
    config.last_used_template = Some(name);
    save_config_to_disk(&app, &config);
}

#[tauri::command]
pub fn delete_template(app: AppHandle, name: String) {
    let mut config = load_config(&app);
    config.templates.remove(&name);
    if config.last_used_template.as_deref() == Some(&name) {
        config.last_used_template = None;
    }
    save_config_to_disk(&app, &config);
}

#[tauri::command]
pub fn save_proxy(app: AppHandle, proxy_type: String, proxy_host: String) {
    let mut config = load_config(&app);
    config.proxy = ProxyConfig {
        proxy_type,
        proxy_host,
    };
    save_config_to_disk(&app, &config);
}

#[tauri::command]
pub fn get_proxy(app: AppHandle) -> ProxyConfig {
    load_config(&app).proxy
}

#[tauri::command]
pub fn save_okp_executable_path(app: AppHandle, okp_executable_path: String) {
    let mut config = load_config(&app);
    config.okp_executable_path = okp_executable_path;
    save_config_to_disk(&app, &config);
}

#[tauri::command]
pub fn save_quick_publish_template(
    app: AppHandle,
    mut template: QuickPublishTemplate,
) -> Result<(), String> {
    let template_id = template.id.trim().to_string();
    if template_id.is_empty() {
        return Err("快速发布模板 ID 不能为空。".to_string());
    }

    template.legacy_content_template_id = None;

    let mut config = load_config(&app);
    config.quick_publish_templates.insert(template_id.clone(), template);
    config.last_used_quick_publish_template = Some(template_id);
    save_config_to_disk(&app, &config);
    Ok(())
}

#[tauri::command]
pub fn delete_quick_publish_template(app: AppHandle, id: String) -> Result<(), String> {
    let mut config = load_config(&app);
    if config.quick_publish_templates.remove(&id).is_none() {
        return Err(format!("未找到快速发布模板: {}", id));
    }

    if config.last_used_quick_publish_template.as_deref() == Some(&id) {
        config.last_used_quick_publish_template = None;
    }

    save_config_to_disk(&app, &config);
    Ok(())
}

#[tauri::command]
pub fn save_content_template(app: AppHandle, template: ContentTemplate) -> Result<(), String> {
    let template_id = template.id.trim().to_string();
    if template_id.is_empty() {
        return Err("正文模板 ID 不能为空。".to_string());
    }

    let mut config = load_config(&app);
    config.content_templates.insert(template_id, template);
    save_config_to_disk(&app, &config);
    Ok(())
}

#[tauri::command]
pub fn delete_content_template(app: AppHandle, id: String) -> Result<(), String> {
    let mut config = load_config(&app);
    if config.content_templates.remove(&id).is_none() {
        return Err(format!("未找到正文模板: {}", id));
    }

    for template in config.quick_publish_templates.values_mut() {
        if template.shared_content_template_id.as_deref() == Some(id.as_str()) {
            template.shared_content_template_id = None;
        }
    }

    save_config_to_disk(&app, &config);
    Ok(())
}

#[tauri::command]
pub fn update_quick_publish_template_publish_history(
    app: AppHandle,
    id: String,
    updates: Vec<TemplatePublishHistoryUpdate>,
) -> Result<(), String> {
    let mut config = load_config(&app);
    let template = config
        .quick_publish_templates
        .get_mut(&id)
        .ok_or_else(|| format!("未找到快速发布模板: {}", id))?;

    for update in updates {
        let history_entry = template
            .publish_history
            .get_mut(&update.site_key)
            .ok_or_else(|| format!("不支持的站点代码: {}", update.site_key))?;
        history_entry.last_published_at = update.last_published_at;
        history_entry.last_published_episode = update.last_published_episode;
        history_entry.last_published_resolution = update.last_published_resolution;
    }

    save_config_to_disk(&app, &config);
    Ok(())
}

#[tauri::command]
pub fn export_quick_publish_template_to_file(
    app: AppHandle,
    id: String,
    path: String,
) -> Result<(), String> {
    let config = load_config(&app);
    let template = config
        .quick_publish_templates
        .get(&id)
        .cloned()
        .ok_or_else(|| format!("未找到快速发布模板: {}", id))?;

    let export_payload = ImportedQuickPublishTemplateFile {
        id,
        template,
    };

    let export_path = PathBuf::from(&path);
    if let Some(parent) = export_path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|error| format!("无法创建导出目录: {}", error))?;
    }

    let file_content = serde_json::to_string_pretty(&export_payload)
        .map_err(|error| format!("无法序列化快速发布模板文件: {}", error))?;

    std::fs::write(&export_path, file_content)
        .map_err(|error| format!("无法导出快速发布模板文件: {}", error))?;

    Ok(())
}

#[tauri::command]
pub fn import_quick_publish_template_from_file(
    app: AppHandle,
    path: String,
) -> Result<ImportedQuickPublishTemplatePayload, String> {
    let import_path = PathBuf::from(&path);
    let file_content = std::fs::read_to_string(&import_path)
        .map_err(|error| format!("无法读取快速发布模板文件: {}", error))?;

    let import_file: QuickPublishTemplateImportFileFormat = serde_json::from_str(&file_content)
        .map_err(|error| format!("快速发布模板文件格式无效: {}", error))?;

    let fallback_id = import_path
        .file_stem()
        .and_then(|value| value.to_str())
        .unwrap_or("imported-quick-publish-template")
        .to_string();

    let (id, mut template) = match import_file {
        QuickPublishTemplateImportFileFormat::Wrapped(file) => {
            let imported_id = file.id.trim().to_string();
            let resolved_id = if imported_id.is_empty() {
                fallback_id.clone()
            } else {
                imported_id
            };

            (resolved_id, file.template)
        }
        QuickPublishTemplateImportFileFormat::Raw(template) => {
            let imported_id = template.id.trim().to_string();
            let resolved_id = if imported_id.is_empty() {
                fallback_id.clone()
            } else {
                imported_id
            };

            (resolved_id, template)
        }
    };

    template.id = id.clone();
    if template.name.trim().is_empty() {
        template.name = id.clone();
    }

    let mut config = load_config(&app);
    migrate_quick_publish_template(&mut template, &config.content_templates);
    config.quick_publish_templates.insert(id.clone(), template.clone());
    config.last_used_quick_publish_template = Some(id.clone());
    save_config_to_disk(&app, &config);

    Ok(ImportedQuickPublishTemplatePayload { id, template })
}

#[tauri::command]
pub fn export_content_template_to_file(
    app: AppHandle,
    id: String,
    path: String,
) -> Result<(), String> {
    let config = load_config(&app);
    let template = config
        .content_templates
        .get(&id)
        .cloned()
        .ok_or_else(|| format!("未找到正文模板: {}", id))?;

    let export_payload = ImportedContentTemplateFile {
        id,
        template,
    };

    let export_path = PathBuf::from(&path);
    if let Some(parent) = export_path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|error| format!("无法创建导出目录: {}", error))?;
    }

    let file_content = serde_json::to_string_pretty(&export_payload)
        .map_err(|error| format!("无法序列化正文模板文件: {}", error))?;

    std::fs::write(&export_path, file_content)
        .map_err(|error| format!("无法导出正文模板文件: {}", error))?;

    Ok(())
}

#[tauri::command]
pub fn import_content_template_from_file(
    app: AppHandle,
    path: String,
) -> Result<ImportedContentTemplatePayload, String> {
    let import_path = PathBuf::from(&path);
    let file_content = std::fs::read_to_string(&import_path)
        .map_err(|error| format!("无法读取正文模板文件: {}", error))?;

    let import_file: ContentTemplateImportFileFormat = serde_json::from_str(&file_content)
        .map_err(|error| format!("正文模板文件格式无效: {}", error))?;

    let fallback_id = import_path
        .file_stem()
        .and_then(|value| value.to_str())
        .unwrap_or("imported-content-template")
        .to_string();

    let (id, mut template) = match import_file {
        ContentTemplateImportFileFormat::Wrapped(file) => {
            let imported_id = file.id.trim().to_string();
            let resolved_id = if imported_id.is_empty() {
                fallback_id.clone()
            } else {
                imported_id
            };

            (resolved_id, file.template)
        }
        ContentTemplateImportFileFormat::Raw(template) => {
            let imported_id = template.id.trim().to_string();
            let resolved_id = if imported_id.is_empty() {
                fallback_id.clone()
            } else {
                imported_id
            };

            (resolved_id, template)
        }
    };

    template.id = id.clone();
    if template.name.trim().is_empty() {
        template.name = id.clone();
    }

    let mut config = load_config(&app);
    config.content_templates.insert(id.clone(), template.clone());
    save_config_to_disk(&app, &config);

    Ok(ImportedContentTemplatePayload { id, template })
}

#[tauri::command]
pub fn update_template_publish_history(
    app: AppHandle,
    name: String,
    updates: Vec<TemplatePublishHistoryUpdate>,
) -> Result<(), String> {
    let mut config = load_config(&app);
    let template = config
        .templates
        .get_mut(&name)
        .ok_or_else(|| format!("未找到模板: {}", name))?;

    for update in updates {
        let history_entry = template
            .publish_history
            .get_mut(&update.site_key)
            .ok_or_else(|| format!("不支持的站点代码: {}", update.site_key))?;
        history_entry.last_published_at = update.last_published_at;
        history_entry.last_published_episode = update.last_published_episode;
        history_entry.last_published_resolution = update.last_published_resolution;
    }

    save_config_to_disk(&app, &config);
    Ok(())
}

#[tauri::command]
pub fn export_template_to_file(app: AppHandle, name: String, path: String) -> Result<(), String> {
    let config = load_config(&app);
    let template = config
        .templates
        .get(&name)
        .cloned()
        .ok_or_else(|| format!("未找到模板: {}", name))?;

    let export_payload = ImportedTemplateFile {
        name,
        template: template.into(),
    };

    let export_path = PathBuf::from(&path);
    if let Some(parent) = export_path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|error| format!("无法创建导出目录: {}", error))?;
    }

    let file_content = serde_json::to_string_pretty(&export_payload)
        .map_err(|error| format!("无法序列化模板文件: {}", error))?;

    std::fs::write(&export_path, file_content)
        .map_err(|error| format!("无法导出模板文件: {}", error))?;

    Ok(())
}

#[tauri::command]
pub fn import_template_from_file(app: AppHandle, path: String) -> Result<ImportedTemplatePayload, String> {
    let import_path = PathBuf::from(&path);
    let file_content = std::fs::read_to_string(&import_path)
        .map_err(|error| format!("无法读取模板文件: {}", error))?;

    let import_file: TemplateImportFileFormat = serde_json::from_str(&file_content)
        .map_err(|error| format!("模板文件格式无效: {}", error))?;

    let (name, template) = match import_file {
        TemplateImportFileFormat::Wrapped(file) => {
            let imported_name = file.name.trim().to_string();
            let fallback_name = import_path
                .file_stem()
                .and_then(|value| value.to_str())
                .unwrap_or("imported-template")
                .to_string();
            let resolved_name = if imported_name.is_empty() {
                fallback_name
            } else {
                imported_name
            };

            (resolved_name, Template::from(file.template))
        }
        TemplateImportFileFormat::Portable(template) => ( 
            import_path
                .file_stem()
                .and_then(|value| value.to_str())
                .unwrap_or("imported-template")
                .to_string(),
            Template::from(template),
        ),
        TemplateImportFileFormat::Raw(template) => {
            let fallback_name = import_path
                .file_stem()
                .and_then(|value| value.to_str())
                .unwrap_or("imported-template")
                .to_string();
            (
                fallback_name,
                Template {
                    sites: SiteSelection::default(),
                    ..template
                },
            )
        }
    };

    let mut config = load_config(&app);
    config.templates.insert(name.clone(), template.clone());
    config.last_used_template = Some(name.clone());
    save_config_to_disk(&app, &config);

    Ok(ImportedTemplatePayload { name, template })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_config() {
        let config = AppConfig::default();
        assert!(config.templates.is_empty());
        assert!(config.quick_publish_templates.is_empty());
        assert!(config.content_templates.is_empty());
        assert_eq!(config.proxy.proxy_type, "none");
        assert!(config.okp_executable_path.is_empty());
        assert!(config.last_used_template.is_none());
        assert!(config.last_used_quick_publish_template.is_none());
    }

    #[test]
    fn test_site_selection_default() {
        let sites = SiteSelection::default();
        assert!(!sites.dmhy);
        assert!(!sites.nyaa);
        assert!(!sites.acgrip);
        assert!(!sites.bangumi);
        assert!(!sites.acgnx_asia);
        assert!(!sites.acgnx_global);
    }

    #[test]
    fn test_portable_template_omits_site_selection() {
        let template = Template {
            ep_pattern: "(?P<ep>\\d+)".to_string(),
            resolution_pattern: "(?P<res>1080p)".to_string(),
            title_pattern: "<ep>".to_string(),
            poster: "poster".to_string(),
            about: "about".to_string(),
            tags: "tags".to_string(),
            description: "description".to_string(),
            description_html: "<p>description</p>".to_string(),
            profile: "profile".to_string(),
            title: "title".to_string(),
            publish_history: SitePublishHistory::default(),
            sites: SiteSelection {
                dmhy: true,
                nyaa: true,
                acgrip: false,
                bangumi: false,
                acgnx_asia: false,
                acgnx_global: true,
            },
        };

        let portable = PortableTemplate::from(template);
        let restored = Template::from(portable);

        assert!(!restored.sites.dmhy);
        assert!(!restored.sites.nyaa);
        assert!(!restored.sites.acgnx_global);
    }

    #[test]
    fn test_legacy_config_defaults_new_quick_publish_fields() {
        let config: AppConfig = serde_json::from_str(
            r#"{
                "last_used_template": "legacy",
                "proxy": { "proxy_type": "none", "proxy_host": "" },
                "okp_executable_path": "",
                "templates": {}
            }"#,
        )
        .expect("legacy config should deserialize");

        assert!(config.quick_publish_templates.is_empty());
        assert!(config.content_templates.is_empty());
        assert!(config.last_used_quick_publish_template.is_none());
    }

    #[test]
    fn test_quick_publish_template_roundtrip() {
        let config = AppConfig {
            last_used_quick_publish_template: Some("demo-template".to_string()),
            quick_publish_templates: HashMap::from([(
                "demo-template".to_string(),
                QuickPublishTemplate {
                    id: "demo-template".to_string(),
                    name: "Demo Template".to_string(),
                    summary: "summary".to_string(),
                    title: "[Group] Show - 01 [1080p]".to_string(),
                    ep_pattern: "(?P<ep>\\d+)".to_string(),
                    resolution_pattern: "(?P<res>1080p)".to_string(),
                    title_pattern: "<ep>".to_string(),
                    poster: "poster".to_string(),
                    about: "about".to_string(),
                    tags: "Anime".to_string(),
                    default_profile: "default".to_string(),
                    default_sites: SiteSelection {
                        dmhy: true,
                        nyaa: false,
                        acgrip: false,
                        bangumi: true,
                        acgnx_asia: false,
                        acgnx_global: false,
                    },
                    body_markdown: "body markdown".to_string(),
                    body_html: "<p>body html</p>".to_string(),
                    shared_content_template_id: Some("content-1".to_string()),
                    legacy_content_template_id: None,
                    publish_history: SitePublishHistory::default(),
                    updated_at: "2026-03-14T00:00:00Z".to_string(),
                },
            )]),
            content_templates: HashMap::from([(
                "content-1".to_string(),
                ContentTemplate {
                    id: "content-1".to_string(),
                    name: "Intro".to_string(),
                    summary: "content summary".to_string(),
                    markdown: "# markdown".to_string(),
                    html: "<p>html</p>".to_string(),
                    site_notes: "notes".to_string(),
                    updated_at: "2026-03-14T00:00:00Z".to_string(),
                },
            )]),
            ..AppConfig::default()
        };

        let serialized = serde_json::to_string(&config).expect("config should serialize");
        let restored: AppConfig = serde_json::from_str(&serialized).expect("config should deserialize");

        assert_eq!(
            restored.last_used_quick_publish_template.as_deref(),
            Some("demo-template")
        );
        assert_eq!(restored.quick_publish_templates.len(), 1);
        assert_eq!(restored.content_templates.len(), 1);
        assert_eq!(
            restored.quick_publish_templates["demo-template"]
                .shared_content_template_id
                .as_deref(),
            Some("content-1")
        );
        assert_eq!(
            restored.quick_publish_templates["demo-template"].body_markdown,
            "body markdown"
        );
        assert_eq!(restored.content_templates["content-1"].name, "Intro");
    }

    #[test]
    fn test_legacy_quick_publish_template_migrates_content_into_body_fields() {
        let mut config: AppConfig = serde_json::from_str(
            r#"{
                "proxy": { "proxy_type": "none", "proxy_host": "" },
                "quick_publish_templates": {
                    "demo-template": {
                        "id": "demo-template",
                        "name": "Demo Template",
                        "content_template_id": "content-1"
                    }
                },
                "content_templates": {
                    "content-1": {
                        "id": "content-1",
                        "name": "Shared",
                        "markdown": "legacy markdown",
                        "html": "<p>legacy html</p>"
                    }
                }
            }"#,
        )
        .expect("legacy quick publish config should deserialize");

        migrate_quick_publish_templates(&mut config);

        let migrated = config.quick_publish_templates["demo-template"].clone();
        assert_eq!(migrated.body_markdown, "legacy markdown");
        assert_eq!(migrated.body_html, "<p>legacy html</p>");
        assert!(migrated.shared_content_template_id.is_none());
        assert!(migrated.legacy_content_template_id.is_none());
    }
}
