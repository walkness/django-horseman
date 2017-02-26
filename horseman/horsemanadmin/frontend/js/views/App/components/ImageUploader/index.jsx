import React, { Component, PropTypes } from 'react';
import { autobind } from 'core-decorators';

import Dropzone from 'react-dropzone';


class ImageUploader extends Component {

  static propTypes = {
    multiple: PropTypes.bool,
  };

  static defaultProps = {
    multiple: false,
  };

  @autobind
  handleDrop(files) {
    console.log(files);
  }

  render() {
    return (
      <div>

        <Dropzone
          onDrop={this.handleDrop}
          accept='image/*'
          multiple={this.props.multiple}
        />

      </div>
    );
  }
}

export default ImageUploader;
