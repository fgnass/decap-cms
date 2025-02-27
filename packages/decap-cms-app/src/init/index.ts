export type * from 'decap-cms-core';
import { DecapCmsCore as cms } from 'decap-cms-core';

import type { CMS, CmsBackendType, InitOptions } from 'decap-cms-core';
export { CMS };

// Backend registration functions
export async function registerBackend(type: CmsBackendType) {
  switch (type) {
    case 'aws-cognito-github-proxy':
      cms.registerBackend(
        type,
        (await import('decap-cms-backend-aws-cognito-github-proxy')).AwsCognitoGitHubProxyBackend,
      );
      break;
    case 'azure':
      cms.registerBackend(type, (await import('decap-cms-backend-azure')).AzureBackend);
      break;
    case 'bitbucket':
      cms.registerBackend(type, (await import('decap-cms-backend-bitbucket')).BitbucketBackend);
      break;
    case 'git-gateway':
      cms.registerBackend(type, (await import('decap-cms-backend-git-gateway')).GitGatewayBackend);
      break;
    case 'github':
      cms.registerBackend(type, (await import('decap-cms-backend-github')).GitHubBackend);
      break;
    case 'gitlab':
      cms.registerBackend(type, (await import('decap-cms-backend-gitlab')).GitLabBackend);
      break;
    case 'gitea':
      cms.registerBackend(type, (await import('decap-cms-backend-gitea')).GiteaBackend);
      break;
    case 'test-repo':
      cms.registerBackend(type, (await import('decap-cms-backend-test')).TestBackend);
      break;
    case 'proxy':
      cms.registerBackend(type, (await import('decap-cms-backend-proxy')).ProxyBackend);
      break;
    default:
      throw new Error(`Backend type '${type}' not supported`);
  }
}

// Widget registration functions
export async function registerCoreWidgets() {
  const { widgets } = await import('./core-widgets');
  cms.registerWidget(widgets);
}

export async function registerMapWidget() {
  const m = await import('decap-cms-widget-map');
  cms.registerWidget(m.default.Widget() as any);
}

export async function registerCodeWidget() {
  const m = await import('decap-cms-widget-code');
  cms.registerWidget(m.default.Widget() as any);
}

// Editor component registration functions
export async function registerImageComponent() {
  const m = await import('decap-cms-editor-component-image');
  cms.registerEditorComponent(m.default);
}

// Locale registration functions
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

// Convenience function to register everything
export async function registerAll() {
  await Promise.all([
    registerBackend('git-gateway'),
    registerBackend('azure'),
    registerBackend('aws-cognito-github-proxy'),
    registerBackend('github'),
    registerBackend('gitlab'),
    registerBackend('gitea'),
    registerBackend('bitbucket'),
    registerBackend('test-repo'),
    registerBackend('proxy'),
    registerCoreWidgets(),
    registerMapWidget(),
    registerCodeWidget(),
    registerImageComponent(),
    registerLocale('en'), // Register English by default
  ]);
}

type Options = InitOptions & { setup?: (cms: CMS) => Promise<void> };

export async function init(options: Options) {
  const { config, setup } = options;
  await Promise.all([
    setup,
    registerCoreWidgets(),
    registerLocale(config.locale || 'en'),
    registerBackend(config.local_backend ? 'proxy' : config.backend.name),
  ]);
  cms.init(options);
}
