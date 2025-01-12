import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { ClassNames } from '@emotion/react';
import styled from '@emotion/styled';
import { colors, lengths, fonts } from 'decap-cms-ui-default';
import { createEditor } from 'slate';
import { Editable, Slate, withReact } from 'slate-react';
import { withHistory } from 'slate-history';

import { editorStyleVars, EditorControlBar } from '../styles';
import Toolbar from './Toolbar';
import defaultEmptyBlock from './plugins/blocks/defaultEmptyBlock';
import { useFocus } from './hooks';

function rawEditorStyles({ minimal }) {
  return `
  position: relative;
  overflow: hidden;
  overflow-x: auto;
  min-height: ${minimal ? 'auto' : lengths.richTextEditorMinHeight};
  font-family: ${fonts.mono};
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  border-top: 0;
  margin-top: -${editorStyleVars.stickyDistanceBottom};
  :focus {
    border-color: ${colors.active};
  }
`;
}

const RawEditorContainer = styled.div`
  position: relative;
`;
function RawEditor(props) {
  const { className, field, isShowModeToggle, t, onChange, pendingFocus, onFocus, onBlur } = props;

  const editor = useMemo(() => withReact(withHistory(createEditor())), []);

  const [value, setValue] = useState(
    props.value
      ? props.value.split('\n').map(line => defaultEmptyBlock(line))
      : [defaultEmptyBlock()],
  );

  useFocus(editor, pendingFocus);

  function handleToggleMode() {
    props.onMode('rich_text');
  }

  function handleChange(value) {
    onChange(value.map(line => line.children[0].text).join('\n'));
    setValue(value);
  }

  return (
    <Slate editor={editor} value={value} onChange={handleChange}>
      <RawEditorContainer>
        <EditorControlBar>
          <Toolbar
            onToggleMode={handleToggleMode}
            buttons={field.get('buttons')}
            disabled
            rawMode
            isShowModeToggle={isShowModeToggle}
            t={t}
          />
        </EditorControlBar>
        <ClassNames>
          {({ css, cx }) => (
            <Editable
              className={cx(
                className,
                css`
                  ${rawEditorStyles({ minimal: field.get('minimal') })}
                `,
              )}
              value={value}
              onChange={handleChange}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          )}
        </ClassNames>
      </RawEditorContainer>
    </Slate>
  );
}

RawEditor.propTypes = {
  onChange: PropTypes.func.isRequired,
  onMode: PropTypes.func.isRequired,
  className: PropTypes.string.isRequired,
  value: PropTypes.string,
  field: ImmutablePropTypes.map.isRequired,
  isShowModeToggle: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  pendingFocus: PropTypes.func,
};

export default RawEditor;
