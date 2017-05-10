import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { imageUploaded, images as imagesAction } from '../../../../../actions';

import ImageUploader from '../../../components/ImageUploader';


class ImageUpload extends Component {
  render() {
    return (
      <ImageUploader
        onUploadSuccess={this.props.imageUploaded}
        imagesById={this.props.imagesById}
        imagesRequest={this.props.imagesRequest}
        multiple
      />
    );
  }
}

const mapStateToProps = state => ({
  imagesById: state.images.byId,
});

const imagesRequest = imagesAction.request;

export default connect(
  mapStateToProps, {
    imageUploaded,
    imagesRequest,
  })(ImageUpload);
