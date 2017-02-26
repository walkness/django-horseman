import React, { Component, PropTypes } from 'react';

import Grid from './Grid';


class ImageBrowser extends Component {

  componentWillMount() {
    this.props.imagesRequest();
  }

  render() {
    const { imagesById, orderedImages, selected, onImageClick } = this.props;
    const ids = orderedImages.default || [];
    return (
      <div className='image-browser'>

        <Grid
          ids={ids}
          imagesById={imagesById}
          getLink={this.props.getLink}
          selected={selected}
          onImageClick={onImageClick}
        />

      </div>
    );
  }
}

export default ImageBrowser;
