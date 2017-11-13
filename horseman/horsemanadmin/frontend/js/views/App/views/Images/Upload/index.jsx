import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';

import {
  imageUploaded,
  images as imagesAction,
  imagesUpdated,
  timezones as timezonesAction,
} from 'actions';

import ImageUploader from 'Components/ImageUploader';


class ImageUpload extends Component {

  static propTypes = {
    imagesById: PropTypes.shape({ [PropTypes.string]: PropTypes.object }).isRequired,
    imagesRequest: PropTypes.func.isRequired,
    imagesUpdated: PropTypes.func.isRequired,
    imageUploaded: PropTypes.func.isRequired,
    timezones: PropTypes.arrayOf(PropTypes.string).isRequired,
    timezonesRequest: PropTypes.func.isRequired,
  };

  componentDidMount() {
    if (this.props.timezones.length === 0) {
      this.props.timezonesRequest();
    }
  }

  render() {
    return (
      <div>

        <Helmet title='Upload images' />

        <ImageUploader
          onUploadSuccess={this.props.imageUploaded}
          onReplaceSuccess={this.props.imagesUpdated}
          imagesById={this.props.imagesById}
          imagesRequest={this.props.imagesRequest}
          timezones={this.props.timezones}
          multiple
        />

      </div>
    );
  }
}

const mapStateToProps = state => ({
  imagesById: state.images.byId,
  timezones: state.timezones,
});

const imagesRequest = imagesAction.request;
const timezonesRequest = timezonesAction.request;

export default connect(
  mapStateToProps, {
    imageUploaded,
    imagesRequest,
    imagesUpdated,
    timezonesRequest,
  })(ImageUpload);
