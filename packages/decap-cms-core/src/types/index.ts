/* eslint-disable @typescript-eslint/no-explicit-any */

import type { ComponentType, JSX } from 'react';
import type { List, Map } from 'immutable';
import type { Pluggable } from 'unified';
import type { Implementation } from 'decap-cms-lib-util';
import type { CmsConfig } from './redux';
import type { CmsRegistryBackend } from '../backend';

export type * from './redux';
export type { CmsRegistryBackend };
export type CmsBackendClass = new (...args: any[]) => Implementation;

export interface InitOptions {
  config: CmsConfig;
}

export type EditorComponentField = {
  name: string;
  label: string;
} & (
  | {
      widget?: Exclude<string, 'image' | 'list'>;
    }
  | {
      widget: 'image';
      media_library?: {
        allow_multiple?: boolean;
      };
    }
  | {
      widget: 'list';
      /**
       * Used if widget === "list" to create a flat array
       */
      field?: EditorComponentField;
      /**
       * Used if widget === "list" to create an array of objects
       */
      fields?: EditorComponentField[];
    }
);

export interface EditorComponentOptions {
  id: string;
  label: string;
  icon?: string;
  type?: string;
  widget?: string;
  fields?: EditorComponentField[];
  pattern?: RegExp;
  allow_add?: boolean;
  fromBlock?: (match: RegExpMatchArray) => any;
  toBlock?: (data: any) => string;
  toPreview?: (data: any, getAsset: GetAssetFunction, fields: any) => string | JSX.Element;
}

export interface PreviewStyleOptions {
  raw: boolean;
}

export interface PreviewStyle extends PreviewStyleOptions {
  value: string;
}

export interface QueryHit {
  data: Record<string, unknown>;
  path: string;
  slug: string;
  i18n?: Record<string, unknown>;
}

export interface CmsWidgetControlProps<T = any> {
  // Core props
  value: T;
  field: Map<string, any>;
  onChange: (value: T, metadata?: Record<string, unknown>) => void;
  forID: string;
  classNameWrapper: string;
  setActiveStyle: () => void;
  setInactiveStyle: () => void;

  // Media related props
  getAsset?: (path: string) => { url: string; path: string };
  mediaPaths?: Map<string, string>;
  onAddAsset?: (path: string, file: { url: string; path: string }) => void;
  onRemoveInsertedMedia?: (path: string) => void;
  onOpenMediaLibrary?: (options: {
    allow_multiple?: boolean;
    config?: Record<string, unknown>;
  }) => void;
  onClearMediaControl?: () => void;
  onRemoveMediaControl?: (path: string) => void;
  onPersistMedia?: (path: string) => void;

  // Validation related props
  validate?: (skipWrapped?: Record<string, unknown>) => void;
  hasError?: boolean;

  // Object and List widget related props
  onChangeObject?: (value: Record<string, unknown>) => void;
  onValidateObject?: (value: Record<string, unknown>) => { error: boolean | string };
  editorControl?: React.ElementType;
  resolveWidget?: (name: string) => CmsWidget;
  widget?: CmsWidget;
  getEditorComponents?: () => {
    id: string;
    label: string;
    icon?: string;
    fields?: Map<string, any>[];
  }[];
  clearFieldErrors?: (path: string) => void;
  fieldsErrors?: Map<string, any>;

  // Additional props
  t: (key: string, options?: Record<string, unknown>) => string; // Translation function
  isDisabled?: boolean;
  hasActiveStyle?: boolean;
  classNameWidget?: string;
  classNameWidgetActive?: string;
  classNameLabel?: string;
  classNameLabelActive?: string;
  locale?: string;
  controlRef?: (ref: React.RefObject<any>) => void;
  metadata?: Map<string, unknown>;
  query?: (
    id: string,
    collection: string,
    searchFields: string[],
    value: string,
    file?: string,
  ) => Promise<{
    payload: {
      hits: QueryHit[];
    };
  }>;
  queryHits?: QueryHit[];
  clearSearch?: () => void;
  isFetching?: boolean;
  loadEntry?: (collection: string, slug: string) => Promise<{ payload: Record<string, unknown> }>;
  isEditorComponent?: boolean;
  isNewEditorComponent?: boolean;
  parentIds?: string[];
  isFieldDuplicate?: (field: Map<string, any>) => boolean;
  isFieldHidden?: (field: Map<string, any>) => boolean;
  isParentListCollapsed?: boolean;
  entry?: Map<string, any>;
  collection?: Map<string, any>;
  config?: CmsConfig;
  getRemarkPlugins?: () => Array<Pluggable>;
}

export interface CmsWidgetPreviewProps<T = any> {
  value: T;
  field: Map<string, any>;
  metadata?: Map<string, unknown>;
  getAsset: GetAssetFunction;
  entry: Map<string, any>;
  fieldsMetaData: Map<string, any>;
  resolveWidget?: (name: string) => CmsWidget;
  getRemarkPlugins?: () => Array<Pluggable>;
  collection?: Map<string, any>; // Immutable.Map representation of a CmsCollection object
  t?: (key: string, options?: Record<string, unknown>) => string;
}

export interface CmsWidgetParam {
  name: string;
  controlComponent: ComponentType<any>;
  previewComponent?: ComponentType<any>;
  globalStyles?: any;
  schema?: Record<string, any>;
  allowMapValue?: boolean;
}

export interface CmsWidget<T = any> {
  control: ComponentType<Partial<CmsWidgetControlProps<T>>>;
  preview?: ComponentType<Partial<CmsWidgetPreviewProps<T>>>;
  globalStyles?: any;
  schema?: Record<string, any>;
  allowMapValue?: boolean;
}

export type CmsWidgetValueSerializer = any; // TODO: type properly

export type CmsMediaLibraryOptions = any; // TODO: type properly

export interface CmsMediaLibrary {
  name: string;
  config?: CmsMediaLibraryOptions;
}

export interface CmsEventListener {
  name: 'prePublish' | 'postPublish' | 'preUnpublish' | 'postUnpublish' | 'preSave' | 'postSave';
  handler: ({
    entry,
    author,
  }: {
    entry: Map<string, any>;
    author: { login: string; name: string };
  }) => any;
}

export type CmsEventListenerOptions = any; // TODO: type properly

export type CmsLocalePhrases = any; // TODO: type properly

export type Formatter = {
  fromFile(content: string): unknown;
  toFile(data: object, sortedKeys?: string[], comments?: Record<string, string>): string;
};

export interface CmsRegistry {
  backends: {
    [name: string]: CmsRegistryBackend;
  };
  templates: {
    [name: string]: ComponentType<any>;
  };
  previewStyles: PreviewStyle[];
  widgets: {
    [name: string]: CmsWidget;
  };
  editorComponents: Map<string, EditorComponentOptions>;
  remarkPlugins: Pluggable[];
  widgetValueSerializers: {
    [name: string]: CmsWidgetValueSerializer;
  };
  mediaLibraries: CmsMediaLibrary[];
  locales: {
    [name: string]: CmsLocalePhrases;
  };
  formats: {
    [name: string]: {
      extension: string;
      formatter: Formatter;
    };
  };
  eventHandlers: {
    [name in CmsEventListener['name']]: Array<{
      handler: CmsEventListener['handler'];
      options: CmsEventListenerOptions;
    }>;
  };
}

type GetAssetFunction = (asset: string) => {
  url: string;
  path: string;
  field?: any;
  fileObj: File;
};

export type PreviewTemplateComponentProps = {
  entry: Map<string, any>;
  collection: Map<string, any>;
  getCollection: (collectionName: string, slug?: string) => Promise<Map<string, any>[]>;
  widgetFor: (name: any, fields?: any, values?: any, fieldsMetaData?: any) => JSX.Element | null;
  widgetsFor: (name: any) => any;
  getAsset: GetAssetFunction;
  boundGetAsset: (collection: any, path: any) => GetAssetFunction;
  fieldsMetaData: Map<string, any>;
  config: CmsConfig;
  fields: List<Map<string, any>>;
  isLoadingAsset: boolean;
  window: Window;
  document: Document;
};

export interface CMS {
  getBackend: (name: string) => CmsRegistryBackend | undefined;
  getEditorComponents: () => Map<string, EditorComponentOptions>;
  getRemarkPlugins: () => Array<Pluggable>;
  getLocale: (locale: string) => CmsLocalePhrases | undefined;
  getMediaLibrary: (name: string) => CmsMediaLibrary | undefined;
  getPreviewStyles: () => PreviewStyle[];
  getPreviewTemplate: (name: string) => ComponentType<PreviewTemplateComponentProps> | undefined;
  getWidget: (name: string) => CmsWidget | undefined;
  getWidgetValueSerializer: (widgetName: string) => CmsWidgetValueSerializer | undefined;
  init: (options?: InitOptions) => void;
  registerBackend: (name: string, backendClass: CmsBackendClass) => void;
  registerEditorComponent: (options: EditorComponentOptions) => void;
  registerRemarkPlugin: (plugin: Pluggable) => void;
  registerEventListener: (
    eventListener: CmsEventListener,
    options?: CmsEventListenerOptions,
  ) => void;
  registerLocale: (locale: string, phrases: CmsLocalePhrases) => void;
  registerMediaLibrary: (mediaLibrary: CmsMediaLibrary, options?: CmsMediaLibraryOptions) => void;
  registerPreviewStyle: (filePath: string, options?: PreviewStyleOptions) => void;
  registerPreviewTemplate: (
    name: string,
    component: ComponentType<PreviewTemplateComponentProps>,
  ) => void;
  registerWidget: (
    widget: string | CmsWidgetParam | CmsWidgetParam[],
    control?: ComponentType<any> | string,
    preview?: ComponentType<any>,
  ) => void;
  registerWidgetValueSerializer: (widgetName: string, serializer: CmsWidgetValueSerializer) => void;
  resolveWidget: (name: string) => CmsWidget | undefined;
  registerCustomFormat: (name: string, extension: string, formatter: Formatter) => void;
}
