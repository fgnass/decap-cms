import PropTypes from 'prop-types';
import React from 'react';
import { isElement } from 'react-is';
import { ScrollSyncPane } from 'react-scroll-sync';
import { FrameContextConsumer } from 'react-frame-component';
import { vercelStegaDecode } from '@vercel/stega';

/**
 * PreviewContent renders the preview component and optionally handles visual editing interactions.
 * By default it uses scroll sync, but can be configured to use visual editing instead.
 */
class PreviewContent extends React.Component {
  handleClick = e => {
    const { previewProps } = this.props;
    const visualEditing = previewProps?.collection?.getIn(['editor', 'visualEditing'], false);
    console.log('Click event:', {
      target: e.target,
      visualEditing,
    });

    if (!visualEditing) {
      return;
    }

    try {
      const text = e.target.textContent;
      console.log('Clicked text:', text);
      const decoded = vercelStegaDecode(text);
      console.log('Decoded data:', decoded);
      if (decoded?.decap) {
        console.log('Clicked field:', decoded.decap);
      }
    } catch (err) {
      console.log('Error extracting stega data:', {
        error: err.message,
        text: e.target.textContent,
      });
    }
  };

  renderPreview() {
    const { previewComponent, previewProps } = this.props;
    return (
      <div onClick={this.handleClick}>
        {isElement(previewComponent)
          ? React.cloneElement(previewComponent, previewProps)
          : React.createElement(previewComponent, previewProps)}
      </div>
    );
  }

  render() {
    const { previewProps } = this.props;
    const visualEditing = previewProps?.collection?.getIn(['editor', 'visualEditing'], false);
    const showScrollSync = !visualEditing;

    return (
      <FrameContextConsumer>
        {context => {
          const preview = this.renderPreview();
          if (showScrollSync) {
            return (
              <ScrollSyncPane attachTo={context.document.scrollingElement}>
                {preview}
              </ScrollSyncPane>
            );
          }
          return preview;
        }}
      </FrameContextConsumer>
    );
  }
}

PreviewContent.propTypes = {
  previewComponent: PropTypes.func.isRequired,
  previewProps: PropTypes.object,
};

export default PreviewContent;
