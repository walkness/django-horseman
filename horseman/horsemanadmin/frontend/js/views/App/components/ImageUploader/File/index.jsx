/* globals FormData */

import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';

import uploadStatus from '../../../../../constants/UploadTypes';
import { uploadImage } from '../../../../../services/api';
import { flattenErrors } from '../../../../../utils';

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
    addToQueue: PropTypes.func.isRequired,
    id: PropTypes.string.isRequired,
    imagesById: PropTypes.object.isRequired,
    imagesRequest: PropTypes.func.isRequired,
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
      showDuplicates: false,
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
    const { file, id } = props || this.props;
    this.setState({ status: uploadStatus.UPLOADING }, () => {
      const data = new FormData();
      data.append('file', file);
      uploadImage(data, ({ error, response }) => {
        if (error) {
          const uploadErrors = flattenErrors(error);
          const uploadError = uploadErrors[0];
          const isDuplicate = [
            'duplicate', 'duplicate_hash', 'duplicate_name', 'duplicate_exif',
          ].indexOf(uploadError.code) !== -1;
          this.setState({
            status: isDuplicate ? uploadStatus.DUPLICATE : uploadStatus.ERROR,
            progress: 1,
            duplicates: uploadError && uploadError.duplicates,
            uploadErrors,
          });
          this.props.onUploadError(error, id);
        } else {
          this.setState({
            status: uploadStatus.SUCCESS,
            progress: 1,
            uploadErrors: [],
            id: response.pk,
          }, () => {
            this.props.onUploadSuccess(response, id);
          });
        }
      }, (progress) => {
        if (progress.lengthComputable) {
          this.setState({ progress: progress.loaded / progress.total });
        }
      });
    });
  }

  render() {
    const { file } = this.props;
    const { status, progress, uploadErrors, showDuplicates } = this.state;
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
        />

        { showDuplicates ?
          <Duplicates
            ids={uploadError && uploadError.duplicates}
            imagesById={this.props.imagesById}
            imagesRequest={this.props.imagesRequest}
          />
        : null }

      </li>
    );
  }
}

export default File;
