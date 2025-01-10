import { Map as ImmutableMap, List } from 'immutable';

import type { CmsField, CmsFieldBase, CmsFieldList, CmsFieldObject } from 'decap-cms-core';

export function isListField(field: CmsField): field is CmsFieldBase & CmsFieldList {
  return field.widget === 'list';
}

export function isObjectField(field: CmsField): field is CmsFieldBase & CmsFieldObject {
  return field.widget === 'object';
}

export function isImmutableMap(value: unknown): value is ImmutableMap<string, unknown> {
  return ImmutableMap.isMap(value);
}

export function isImmutableList(value: unknown): value is List<unknown> {
  return List.isList(value);
}
