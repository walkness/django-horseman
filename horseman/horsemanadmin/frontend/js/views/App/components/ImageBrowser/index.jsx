import React, { Component, PropTypes } from 'react';

import Grid from './Grid';


class ImageBrowser extends Component {

  componentWillMount() {
    this.props.imagesRequest();
  }

  render() {
    const { imagesById, orderedImages } = this.props;
    const ids = orderedImages.default;
    return (
      <div className='image-browser'>

        <Grid
          ids={ids}
          imagesById={imagesById}
          getLink={this.props.getLink}
        />

      </div>
    );
  }
}

export default ImageBrowser;
