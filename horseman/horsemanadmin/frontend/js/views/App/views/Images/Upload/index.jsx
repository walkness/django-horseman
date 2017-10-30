import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';

import { imageUploaded, images as imagesAction, imagesUpdated } from 'actions';

import ImageUploader from 'Components/ImageUploader';


class ImageUpload extends Component {
  render() {
    return (
      <div>

        <Helmet title='Upload images' />

        <ImageUploader
          onUploadSuccess={this.props.imageUploaded}
          onReplaceSuccess={this.props.imagesUpdated}
          imagesById={this.props.imagesById}
          imagesRequest={this.props.imagesRequest}
          multiple
        />

      </div>
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
    imagesUpdated,
  })(ImageUpload);
