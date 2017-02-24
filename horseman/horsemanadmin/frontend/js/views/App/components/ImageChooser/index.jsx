import React, { Component, PropTypes } from 'react';

import ImageBrowser from '../ImageBrowser';


class ImageChooser extends Component {
  render() {
    return (
      <div className='image-chooser'>

        <ImageBrowser
          imagesById={this.props.imagesById}
          orderedImages={this.props.orderedImages}
          imagesRequest={this.props.imagesRequest}
        />

      </div>
    );
  }
}

export default ImageChooser;
