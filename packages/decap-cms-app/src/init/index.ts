export type * from 'decap-cms-core';
import { DecapCmsCore as CMS } from 'decap-cms-core';
export { CMS };

// Backend registration functions
export async function registerGitGatewayBackend() {
  const m = await import('decap-cms-backend-git-gateway');
  console.log('Loaded decap-cms-backend-git-gateway', m);
  CMS.registerBackend('git-gateway', m.GitGatewayBackend);
}

export async function registerAzureBackend() {
  const m = await import('decap-cms-backend-azure');
  console.log('Loaded decap-cms-backend-azure', m);
  CMS.registerBackend('azure', m.AzureBackend);
}

export async function registerAwsCognitoGithubProxyBackend() {
  const m = await import('decap-cms-backend-aws-cognito-github-proxy');
  console.log('Loaded decap-cms-backend-aws-cognito-github-proxy', m);
  CMS.registerBackend('aws-cognito-github-proxy', m.AwsCognitoGitHubProxyBackend);
}

export async function registerGitHubBackend() {
  const m = await import('decap-cms-backend-github');
  console.log('Loaded decap-cms-backend-github', m);
  CMS.registerBackend('github', m.GitHubBackend);
}

export async function registerGitLabBackend() {
  const m = await import('decap-cms-backend-gitlab');
  console.log('Loaded decap-cms-backend-gitlab', m);
  CMS.registerBackend('gitlab', m.GitLabBackend);
}

export async function registerGiteaBackend() {
  const m = await import('decap-cms-backend-gitea');
  console.log('Loaded decap-cms-backend-gitea', m);
  CMS.registerBackend('gitea', m.GiteaBackend);
}

export async function registerBitbucketBackend() {
  const m = await import('decap-cms-backend-bitbucket');
  console.log('Loaded decap-cms-backend-bitbucket', m);
  CMS.registerBackend('bitbucket', m.BitbucketBackend);
}

export async function registerTestBackend() {
  const m = await import('decap-cms-backend-test');
  console.log('Loaded decap-cms-backend-test', m);
  CMS.registerBackend('test-repo', m.TestBackend);
}

export async function registerProxyBackend() {
  const m = await import('decap-cms-backend-proxy');
  console.log('Loaded decap-cms-backend-proxy', m);
  CMS.registerBackend('proxy', m.ProxyBackend);
}

// Widget registration functions
export async function registerCoreWidgets() {
  const { widgets } = await import('./core-widgets');
  CMS.registerWidget(widgets);
}

export async function registerMapWidget() {
  const m = await import('decap-cms-widget-map');
  CMS.registerWidget(m.default.Widget() as any);
}

export async function registerCodeWidget() {
  const m = await import('decap-cms-widget-code');
  CMS.registerWidget(m.default.Widget() as any);
}

// Editor component registration functions
export async function registerImageComponent() {
  const m = await import('decap-cms-editor-component-image');
  CMS.registerEditorComponent(m.default);
}

// Locale registration functions
export async function registerLocale(locale: string) {
  const m = await import('decap-cms-locales');
  if (locale in m) {
    CMS.registerLocale(locale, m[locale as keyof typeof m]);
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
    registerGitGatewayBackend(),
    registerAzureBackend(),
    registerAwsCognitoGithubProxyBackend(),
    registerGitHubBackend(),
    registerGitLabBackend(),
    registerGiteaBackend(),
    registerBitbucketBackend(),
    registerTestBackend(),
    registerProxyBackend(),
    registerCoreWidgets(),
    registerMapWidget(),
    registerCodeWidget(),
    registerImageComponent(),
    registerLocale('en'), // Register English by default
  ]);
}
