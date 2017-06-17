import React, { Component, PropTypes } from 'react';
import { autobind } from 'core-decorators';
import Dropzone from 'react-dropzone';
import uuidV4 from 'uuid/v4';

import File from './File';

import './styles.scss';


class ImageUploader extends Component {

  static propTypes = {
    multiple: PropTypes.bool,
    maxConcurrent: PropTypes.number,
    onUploadSuccess: PropTypes.func,
    onReplaceSuccess: PropTypes.func,
    imagesById: PropTypes.object.isRequired,
    imagesRequest: PropTypes.func.isRequired,
  };

  static defaultProps = {
    multiple: false,
    maxConcurrent: 1,
    onUploadSuccess: () => {},
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      filesById: {},
      files: [],
      queue: [],
      allowUpload: [],
    };
  }

  @autobind
  handleDrop(files) {
    const { maxConcurrent } = this.props;
    const filesById = {};
    const fileIds = files.map((file) => {
      const id = uuidV4();
      filesById[id] = file;
      return id;
    });
    let allowUpload = this.state.allowUpload.slice(0);
    const queue = [...this.state.queue, ...fileIds];
    if (allowUpload.length < maxConcurrent) {
      const uploadingFiles = fileIds.slice(0, maxConcurrent - allowUpload.length);
      allowUpload = [...allowUpload, ...uploadingFiles];
      queue.splice(queue.indexOf(uploadingFiles[0]), uploadingFiles.length);
    }
    this.setState({
      files: [...this.state.files, ...fileIds],
      filesById: Object.assign({}, this.state.filesById, filesById),
      queue,
      allowUpload,
    });
  }

  advanceUpload(id) {
    const { queue } = this.state;
    let allowUpload = this.state.allowUpload.slice(0);
    const index = allowUpload.indexOf(id);
    if (index !== -1) allowUpload.splice(index, 1);
    if (queue.length > 0) {
      allowUpload = [...allowUpload, queue.shift()];
    }
    this.setState({ allowUpload });
  }

  @autobind
  handleUploadSuccess(data, id) {
    this.advanceUpload(id);
    this.props.onUploadSuccess(data);
  }

  @autobind
  handleUploadError(error, id) {
    this.advanceUpload(id);
  }

  @autobind
  handleReplaceSuccess(data, id) {
    this.advanceUpload(id);
    this.props.onReplaceSuccess(data);
  }

  @autobind
  addToQueue(id) {
    const { maxConcurrent } = this.props;
    const queue = this.state.queue.slice(0);
    const index = queue.indexOf(id);
    if (index === -1) {
      const allowUpload = this.state.allowUpload.slice(0);
      if (allowUpload.length < maxConcurrent) {
        allowUpload.push(id);
      } else {
        queue.push(id);
      }
      this.setState({ queue, allowUpload });
    }
  }

  render() {
    return (
      <div styleName='ImageUploader'>

        <Dropzone
          onDrop={this.handleDrop}
          accept='image/*'
          multiple={this.props.multiple}
          className='dropzone'
        >
          <div>Drop files here (or click) to upload…</div>
        </Dropzone>

        <ul styleName='files'>
          { this.state.files.map(id => (
            <File
              key={id}
              id={id}
              file={this.state.filesById[id]}
              allowUpload={this.state.allowUpload.indexOf(id) !== -1}
              onUploadSuccess={this.handleUploadSuccess}
              onUploadError={this.handleUploadError}
              onReplaceSuccess={this.handleReplaceSuccess}
              addToQueue={this.addToQueue}
              imagesById={this.props.imagesById}
              imagesRequest={this.props.imagesRequest}
            />
          )) }
        </ul>

      </div>
    );
  }
}

export default ImageUploader;
