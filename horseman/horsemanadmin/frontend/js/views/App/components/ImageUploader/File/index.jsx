/* globals FormData */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import { autobind } from 'core-decorators';

import uploadStatus from 'constants/UploadTypes';
import { uploadImage } from 'services/api';
import { flattenErrors } from 'utils';

import Status from './Status';
import Duplicates from './Duplicates';

import styles from './styles.scss';


class File extends Component {

  static propTypes = {
    file: PropTypes.shape({
      preview: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }).isRequired,
    allowUpload: PropTypes.bool,
    onUploadSuccess: PropTypes.func,
    onUploadError: PropTypes.func,
    onReplaceSuccess: PropTypes.func,
    onDuplicate: PropTypes.func,
    addToQueue: PropTypes.func.isRequired,
    id: PropTypes.string.isRequired,
    imagesById: PropTypes.object.isRequired,
    imagesRequest: PropTypes.func.isRequired,
    invalidateCaches: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    allowUpload: true,
    onUploadSuccess: () => {},
    onUploadError: () => {},
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      status: uploadStatus.PENDING,
      progress: 0,
      uploadErrors: [],
      duplicates: [],
      id: null,
      updatedIds: [],
      showDuplicates: false,
      replaceIds: [],
      uploadArgs: {},
      ignoreIds: [],
    };
  }

  componentWillMount() {
    if (this.props.allowUpload) {
      this.handleUpload();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.allowUpload && !this.props.allowUpload) {
      this.handleUpload(nextProps);
    }
  }

  handleUpload(props) {
    const { file, id, invalidateCaches } = props || this.props;
    this.setState({ status: uploadStatus.UPLOADING }, () => {
      const data = new FormData();
      data.append('file', file);
      const uploadArgs = Object.assign({}, this.state.uploadArgs, {
        invalidate_caches: invalidateCaches,
      });
      uploadImage(data, uploadArgs, ({ error, response }) => {
        if (error) {
          const uploadErrors = flattenErrors(error);
          const uploadError = uploadErrors[0];
          const isDuplicate = [
            'duplicate', 'duplicate_hash', 'duplicate_name', 'duplicate_exif',
          ].indexOf(uploadError && uploadError.code) !== -1;
          const replaceIds = this.state.replaceIds.slice(0);
          if (isDuplicate) {
            this.props.onDuplicate(id);
            ((uploadError && uploadError.duplicates) || []).forEach((duplicate) => {
              const index = replaceIds.indexOf(duplicate);
              if (index === -1) {
                replaceIds.push(duplicate);
              }
            });
          }
          this.setState({
            status: isDuplicate ? uploadStatus.DUPLICATE : uploadStatus.ERROR,
            progress: 1,
            duplicates: uploadError && uploadError.duplicates,
            replaceIds,
            uploadErrors,
          });
          this.props.onUploadError(error, id);
        } else {
          this.setState({
            status: uploadStatus.SUCCESS,
            progress: 1,
            uploadErrors: [],
            id: response.pk || null,
            updatedIds: Array.isArray(response) ? response.map(image => image.pk) : [],
          }, () => {
            if (this.state.uploadArgs.replace) {
              this.props.onReplaceSuccess(response, id);
            } else {
              this.props.onUploadSuccess(response, id);
            }
          });
        }
      }, (progress) => {
        if (progress.lengthComputable) {
          this.setState({ progress: progress.loaded / progress.total });
        }
      });
    });
  }

  @autobind
  toggleReplaceIds(ids) {
    const replaceIds = this.state.replaceIds.slice(0);
    const ignoreIds = this.state.ignoreIds.slice(0);
    (Array.isArray(ids) ? ids : [ids]).forEach((id) => {
      const index = replaceIds.indexOf(id);
      if (index === -1) {
        replaceIds.push(id);
      } else {
        replaceIds.splice(index, 1);
      }

      const ignoreIndex = ignoreIds.indexOf(id);
      if (ignoreIndex === -1) {
        ignoreIds.push(id);
      } else {
        ignoreIds.splice(ignoreIndex, 1);
      }
    });
    this.setState({ replaceIds, ignoreIds });
  }

  @autobind
  handleUploadAnyway(addToQueue = true) {
    const uploadError = this.state.uploadErrors[0];

    const ignore_duplicates = (this.state.uploadArgs.ignore_duplicates || []).slice(0); // eslint-disable-line camelcase, max-len
    if (uploadError && uploadError.duplicates) {
      uploadError.duplicates.forEach((id) => {
        const index = ignore_duplicates.indexOf(id);
        if (index === -1) {
          ignore_duplicates.push(id);
        }
      });
    }

    const uploadArgs = { ignore_duplicates };

    uploadArgs[`ignore_${uploadError.code}`] = true;
    this.setState({ uploadArgs }, () => {
      if (addToQueue) this.props.addToQueue(this.props.id);
    });
  }

  @autobind
  handleReplace(addToQueue = true) {
    const { replaceIds, ignoreIds } = this.state;

    const ignore_duplicates = (this.state.uploadArgs.ignore_duplicates || []).slice(0); // eslint-disable-line camelcase, max-len
    ignoreIds.forEach((id) => {
      const index = ignore_duplicates.indexOf(id);
      if (index === -1) {
        ignore_duplicates.push(id);
      }
    });

    const replace = (this.state.uploadArgs.replace || []).slice(0);
    replaceIds.forEach((id) => {
      const index = replace.indexOf(id);
      if (index === -1) {
        replace.push(id);
      }
    });

    const uploadArgs = { replace, ignore_duplicates };

    const uploadError = this.state.uploadErrors[0];
    uploadArgs[`ignore_${uploadError.code}`] = true;

    this.setState({ uploadArgs }, () => {
      if (addToQueue) this.props.addToQueue(this.props.id);
    });
  }

  render() {
    const { file } = this.props;
    const { status, progress, uploadErrors, showDuplicates, replaceIds, updatedIds } = this.state;
    const uploadError = uploadErrors[0];
    return (
      <li
        className={classNames({
          [styles.file__uploading]: status === uploadStatus.UPLOADING,
          [styles.file__error]: status === uploadStatus.ERROR,
          [styles.file__duplicate]: status === uploadStatus.DUPLICATE,
          [styles.file__success]: status === uploadStatus.SUCCESS,
        })}
        styleName='styles.file'
      >

        <div styleName='file-details'>
          <img
            src={file.preview}
            alt={file.name}
            styleName='styles.filePreview'
          />

          <div styleName='styles.fileName'>{ file.name }</div>
        </div>

        <Status
          status={status}
          progress={progress}
          uploadError={uploadError}
          id={this.props.id}
          pk={this.state.id}
          duplicates={uploadError && uploadError.duplicates}
          addToQueue={this.props.addToQueue}
          toggleDuplicates={() => this.setState({ showDuplicates: !showDuplicates })}
          showDuplicates={showDuplicates}
          updatedIds={updatedIds}
        />

        { showDuplicates ?
          <Duplicates
            ids={(uploadError && uploadError.duplicates) || updatedIds}
            imagesById={this.props.imagesById}
            imagesRequest={this.props.imagesRequest}
            replaceIds={replaceIds}
            toggleReplaceIds={this.toggleReplaceIds}
            uploadAndReplace={this.handleReplace}
            uploadAnyway={this.handleUploadAnyway}
            viewOnly={!(uploadError && uploadError.duplicates)}
          />
        : null }

      </li>
    );
  }
}

export default File;
