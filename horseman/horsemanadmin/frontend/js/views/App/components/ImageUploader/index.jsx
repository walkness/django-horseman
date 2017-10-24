import React, { Component, PropTypes } from 'react';
import { autobind } from 'core-decorators';
import Dropzone from 'react-dropzone';
import uuidV4 from 'uuid/v4';
import { FormattedMessage } from 'react-intl';

import { Checkbox } from 'react-formsy-bootstrap-components';

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
      duplicates: [],
      invalidateCaches: true,
    };
    this.fileComponents = {};
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

  removeFromDuplicates(id) {
    const duplicates = this.state.duplicates.slice(0);
    const index = duplicates.indexOf(id);
    if (index !== -1) {
      duplicates.splice(index, 1);
    }
    this.setState({ duplicates });
  }

  @autobind
  handleUploadSuccess(data, id) {
    this.advanceUpload(id);
    this.props.onUploadSuccess(data);
    this.removeFromDuplicates(id);
  }

  @autobind
  handleUploadError(error, id) {
    this.advanceUpload(id);
  }

  @autobind
  handleReplaceSuccess(data, id) {
    this.advanceUpload(id);
    this.props.onReplaceSuccess(data);
    this.removeFromDuplicates(id);
  }

  addMultipleToQueue(ids) {
    const { maxConcurrent } = this.props;
    const queue = this.state.queue.slice(0);
    const allowUpload = this.state.allowUpload.slice(0);
    const queued = ids.filter(id => (
      queue.indexOf(id) === -1 && allowUpload.indexOf(id) === -1
    ));
    const numImmediate = maxConcurrent - allowUpload.length;
    let immediate = [];
    if (numImmediate > 0) {
      immediate = queued.splice(0, numImmediate);
    }
    this.setState({
      queue: [...queue, ...queued],
      allowUpload: [...allowUpload, ...immediate],
    });
  }

  @autobind
  addToQueue(id) {
    this.addMultipleToQueue([id]);
    // const { maxConcurrent } = this.props;
    // const queue = this.state.queue.slice(0);
    // const index = queue.indexOf(id);
    // if (index === -1) {
    //   const allowUpload = this.state.allowUpload.slice(0);
    //   if (allowUpload.length < maxConcurrent) {
    //     allowUpload.push(id);
    //   } else {
    //     queue.push(id);
    //   }
    //   this.setState({ queue, allowUpload });
    // }
  }

  @autobind
  replaceAllDuplicates() {
    const { duplicates } = this.state;
    duplicates.forEach((id) => {
      const component = this.fileComponents[id];
      component.handleReplace(false);
    });
    this.addMultipleToQueue(duplicates);
  }

  @autobind
  ignoreAllDuplicates() {
    const { duplicates } = this.state;
    duplicates.forEach((id) => {
      const component = this.fileComponents[id];
      component.handleUploadAnyway(false);
    });
    this.addMultipleToQueue(duplicates);
  }

  @autobind
  addToDuplicates(id) {
    const duplicates = this.state.duplicates.slice(0);
    if (duplicates.indexOf(id) === -1) {
      duplicates.push(id);
    }
    this.setState({ duplicates });
  }

  render() {
    const { duplicates, allowUpload, invalidateCaches } = this.state;
    return (
      <div styleName='ImageUploader'>

        <div styleName='options'>

          <Checkbox
            name='invalidate_caches'
            label='Invalidate caches?'
            help='When selected, any nodes referencing replaced images will have their frontend caches invalidated.'
            value={invalidateCaches}
            onChange={v => this.setState({ invalidateCaches: v })}
          />

        </div>

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
              ref={(c) => { this.fileComponents[id] = c; }}
              key={id}
              id={id}
              file={this.state.filesById[id]}
              allowUpload={allowUpload.indexOf(id) !== -1}
              onUploadSuccess={this.handleUploadSuccess}
              onUploadError={this.handleUploadError}
              onReplaceSuccess={this.handleReplaceSuccess}
              addToQueue={this.addToQueue}
              imagesById={this.props.imagesById}
              imagesRequest={this.props.imagesRequest}
              onDuplicate={this.addToDuplicates}
              invalidateCaches={invalidateCaches}
            />
          )) }
        </ul>

        { duplicates.length > 0 ?
          <div styleName='bulk-actions'>

            <button
              type='button'
              className='btn btn-secondary'
              onClick={this.ignoreAllDuplicates}
              disabled={allowUpload.length > 0}
            >
              <FormattedMessage
                id='imageUploader.ignoreAllDuplicates'
                values={{ numDuplicates: duplicates.length }}
                defaultMessage='Ignore {numDuplicates, plural,
                  one {one duplicate}
                  other {all {numDuplicates, number} duplicates}
                }'
              />
            </button>

            <button
              type='button'
              className='btn btn-primary'
              onClick={this.replaceAllDuplicates}
              disabled={allowUpload.length > 0}
            >
              <FormattedMessage
                id='imageUploader.replaceAllDuplicates'
                values={{ numDuplicates: duplicates.length }}
                defaultMessage='Replace {numDuplicates, plural,
                  one {one duplicate}
                  other {all {numDuplicates, number} duplicates}
                }'
              />
            </button>

          </div>
        : null }

      </div>
    );
  }
}

export default ImageUploader;
