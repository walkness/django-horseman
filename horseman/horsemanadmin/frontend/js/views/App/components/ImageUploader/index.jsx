import React, { Component, PropTypes } from 'react';
import { autobind } from 'core-decorators';
import Dropzone from 'react-dropzone';

import File from './File';

import styles from './styles.css';


class ImageUploader extends Component {

  static propTypes = {
    multiple: PropTypes.bool,
    maxConcurrent: PropTypes.number,
    onUploadSuccess: PropTypes.func,
  };

  static defaultProps = {
    multiple: false,
    maxConcurrent: 5,
    onUploadSuccess: () => {},
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      filesById: {},
      files: [],
      allowUpload: [],
    };
  }

  @autobind
  handleDrop(files) {
    const { maxConcurrent } = this.props;
    const filesById = {};
    const fileIds = files.map((file) => {
      filesById[file.preview] = file;
      return file.preview;
    });
    let allowUpload = this.state.allowUpload.slice(0);
    if (allowUpload.length < maxConcurrent) {
      allowUpload = allowUpload.concat(fileIds.slice(0, maxConcurrent - allowUpload.length));
    }
    this.setState({
      files: [...this.state.files, ...fileIds],
      filesById: Object.assign({}, this.state.filesById, filesById),
      allowUpload,
    });
  }

  @autobind
  handleUploadSuccess(data, id) {
    const allowUpload = this.state.allowUpload.slice(0);
    const index = allowUpload.indexOf(id);
    if (index !== -1) allowUpload.splice(index, 1);
    this.setState({ allowUpload });
    this.props.onUploadSuccess(data);
  }

  render() {
    return (
      <div styleName='styles.ImageUploader'>

        <Dropzone
          onDrop={this.handleDrop}
          accept='image/*'
          multiple={this.props.multiple}
          className='dropzone'
        />

        <ul styleName='styles.files'>
          { this.state.files.map(id => (
            <File
              key={id}
              file={this.state.filesById[id]}
              allowUpload={this.state.allowUpload.indexOf(id) !== -1}
              onUploadSuccess={this.handleUploadSuccess}
            />
          )) }
        </ul>

      </div>
    );
  }
}

export default ImageUploader;
