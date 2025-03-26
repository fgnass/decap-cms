export type * from 'decap-cms-core';
import { DecapCmsCore as cms } from 'decap-cms-core';

import type { CMS, CmsBackendType, CmsConfig, CmsField, InitOptions } from 'decap-cms-core';
export { CMS };

// List of known backends, will be auto-loaded based on config
const backends = {
  'aws-cognito-github-proxy': async () =>
    (await import('decap-cms-backend-aws-cognito-github-proxy')).AwsCognitoGitHubProxyBackend,
  azure: async () => (await import('decap-cms-backend-azure')).AzureBackend,
  bitbucket: async () => (await import('decap-cms-backend-bitbucket')).BitbucketBackend,
  'git-gateway': async () => (await import('decap-cms-backend-git-gateway')).GitGatewayBackend,
  github: async () => (await import('decap-cms-backend-github')).GitHubBackend,
  gitlab: async () => (await import('decap-cms-backend-gitlab')).GitLabBackend,
  gitea: async () => (await import('decap-cms-backend-gitea')).GiteaBackend,
  'test-repo': async () => (await import('decap-cms-backend-test')).TestBackend,
  proxy: async () => (await import('decap-cms-backend-proxy')).ProxyBackend,
};

async function registerBackend(type: CmsBackendType) {
  const loader = backends[type];
  if (!loader) {
    throw new Error(`Backend type '${type}' not supported`);
  }
  cms.registerBackend(type, await loader());
}

// List of known widgets, will be auto-loaded based on config
const widgets = {
  map: async () => (await import('decap-cms-widget-map')).default.Widget(),
  code: async () => (await import('decap-cms-widget-code')).default.Widget(),
  string: async () => (await import('decap-cms-widget-string')).default.Widget(),
  number: async () => (await import('decap-cms-widget-number')).default.Widget(),
  text: async () => (await import('decap-cms-widget-text')).default.Widget(),
  image: async () => (await import('decap-cms-widget-image')).default.Widget(),
  file: async () => (await import('decap-cms-widget-file')).default.Widget(),
  select: async () => (await import('decap-cms-widget-select')).default.Widget(),
  markdown: async () => (await import('decap-cms-widget-markdown')).default.Widget(),
  list: async () => (await import('decap-cms-widget-list')).default.Widget(),
  object: async () => (await import('decap-cms-widget-object')).default.Widget(),
  relation: async () => (await import('decap-cms-widget-relation')).default.Widget(),
  boolean: async () => (await import('decap-cms-widget-boolean')).default.Widget(),
  datetime: async () => (await import('decap-cms-widget-datetime')).default.Widget(),
  color: async () => (await import('decap-cms-widget-colorstring')).default.Widget(),
};

// List of known editor components, will be auto-loaded based on config
const editorComponents = {
  image: async () => (await import('decap-cms-editor-component-image')).default,
  'code-block': () => ({
    id: 'code-block',
    label: 'Code Block',
    widget: 'code',
    type: 'code-block',
  }),
};

async function registerWidgetsAndEditorComponents(config: CmsConfig) {
  const usedWidgets = new Set<string>();
  const usedEditorComponents = new Set<string>();

  // Collect widgets and editor components used in collection fields
  for (const c of config.collections) {
    if (c.files) {
      for (const file of c.files) {
        if (file.fields) collectWidgets(file.fields, usedWidgets, usedEditorComponents);
      }
    }
    if (c.fields) collectWidgets(c.fields, usedWidgets, usedEditorComponents);
  }

  // Load and register all used editor components
  await Promise.all(
    [...usedEditorComponents].map(async type => {
      const loader = editorComponents[type as keyof typeof editorComponents];
      if (loader) {
        // Don't override manually registered components...
        if (!cms.getEditorComponents().has(type)) {
          cms.registerEditorComponent(await loader());
        }
      } else {
        // Check if the component has been manually registered...
        if (!cms.getEditorComponents().has(type)) {
          throw new Error(
            `Unknown editor component "${type}". If this is a custom component, make sure to register it.`,
          );
        }
      }
    }),
  );

  // Collect widgets from editor components (like the "code" widget from the code-block)
  cms
    .getEditorComponents()
    .valueSeq()
    .forEach(e => {
      if (e?.widget) usedWidgets.add(e.widget);
    });

  // Load and register all used widgets
  return Promise.all(
    usedWidgets.values().map(async type => {
      const loader = widgets[type as keyof typeof widgets];
      if (loader) {
        cms.registerWidget(await loader());
      } else {
        if (!cms.getWidget(type) && type !== 'hidden') {
          throw new Error(
            `Unknown widget type "${type}". If this is a custom widget, make sure to register it.`,
          );
        }
      }
    }),
  );
}

function collectWidgets(fields: CmsField[], widgets: Set<string>, editorComponents: Set<string>) {
  for (const f of fields) {
    if (f.widget) {
      widgets.add(f.widget);
    }
    if (f.widget === 'list') {
      collectWidgets(f.field ? [f.field] : f.fields ?? [], widgets, editorComponents);
    }
    if (f.widget === 'object') {
      collectWidgets(f.fields, widgets, editorComponents);
    }
    if (f.widget === 'markdown' && f.editor_components) {
      f.editor_components.forEach(c => editorComponents.add(c));
    }
  }
}

export async function registerLocale(locale: string) {
  const m = await import('decap-cms-locales');
  if (locale in m) {
    cms.registerLocale(locale, m[locale as keyof typeof m]);
  } else {
    throw new Error(`Locale ${locale} not found`);
  }
}

// List of available locales
export const availableLocales = [
  'bg', // Bulgarian
  'ca', // Catalan
  'cs', // Czech
  'da', // Danish
  'de', // German
  'en', // English
  'es', // Spanish
  'fa', // Persian
  'fr', // French
  'gr', // Greek
  'he', // Hebrew
  'hr', // Croatian
  'hu', // Hungarian
  'it', // Italian
  'ja', // Japanese
  'ko', // Korean
  'lt', // Lithuanian
  'nb_no', // Norwegian Bokmål
  'nl', // Dutch
  'nn_no', // Norwegian Nynorsk
  'pl', // Polish
  'pt', // Portuguese
  'ro', // Romanian
  'ru', // Russian
  'sl', // Slovenian
  'sv', // Swedish
  'th', // Thai
  'tr', // Turkish
  'ua', // Ukrainian
  'uk', // Ukrainian
  'vi', // Vietnamese
  'zh_Hans', // Simplified Chinese
  'zh_Hant', // Traditional Chinese
] as const;

type Options = InitOptions & { setup?: (cms: CMS) => void | Promise<void> };

export async function init(options: Options) {
  const { config, setup } = options;
  await Promise.all([
    setup && setup(cms),
    registerWidgetsAndEditorComponents(config),
    registerLocale(config.locale || 'en'),
    registerBackend(config.local_backend ? 'proxy' : config.backend.name),
  ]);
  cms.init(options);
}
