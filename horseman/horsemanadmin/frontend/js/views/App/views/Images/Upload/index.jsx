import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { imageUploaded } from '../../../../../actions';

import ImageUploader from '../../../components/ImageUploader';


class ImageUpload extends Component {
  render() {
    return (
      <ImageUploader
        onUploadSuccess={this.props.imageUploaded}
        multiple
      />
    );
  }
}

const mapStateToProps = state => ({
});

export default connect(
  mapStateToProps, {
    imageUploaded,
  })(ImageUpload);
