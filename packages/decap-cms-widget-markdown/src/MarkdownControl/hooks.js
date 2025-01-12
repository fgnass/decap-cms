import { useEffect } from 'react';
import { Editor, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';

export function useFocus(editor, pendingFocus) {
  useEffect(() => {
    if (pendingFocus) {
      const end = Editor.end(editor, []);
      ReactEditor.deselect(editor);
      Transforms.select(editor, { anchor: end, focus: end });
      ReactEditor.focus(editor);
      pendingFocus();
    }
  }, [editor, pendingFocus]);
}
