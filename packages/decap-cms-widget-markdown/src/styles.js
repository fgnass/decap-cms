import styled from '@emotion/styled';
import { borders, zIndex, colors, lengths } from 'decap-cms-ui-default';

export const editorStyleVars = {
  stickyDistanceBottom: '100px',
};

export const EditorControlBar = styled.div`
  z-index: ${zIndex.zIndex200};
  position: sticky;
  top: 0;
  margin-bottom: ${editorStyleVars.stickyDistanceBottom};
  border: ${borders.textField};
  border-top-right-radius: ${lengths.borderRadius};
  border-style: solid;
  border-color: ${colors.textFieldBorder};
  border-bottom: none;
  :has(+ :focus-within) {
    border-color: ${colors.active};
  }
`;
