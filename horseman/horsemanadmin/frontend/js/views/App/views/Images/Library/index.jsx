import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { images as imagesAction } from '../../../../../actions';

import ImageBrowser from '../../../components/ImageBrowser';


class ImageLibrary extends Component {
  render() {
    const { imagesById, orderedImages } = this.props;
    return (
      <div>

        <ImageBrowser
          orderedImages={orderedImages}
          imagesById={imagesById}
          imagesRequest={this.props.imagesRequest}
          getLink={image => `/admin/images/${image.pk}/`}
          useWindowScroll
        />

      </div>
    );
  }
}

const mapStateToProps = state => ({
  orderedImages: state.images.ordered,
  imagesById: state.images.byId,
});

const imagesRequest = imagesAction.request;

export default connect(
  mapStateToProps, {
    imagesRequest,
  })(ImageLibrary);
