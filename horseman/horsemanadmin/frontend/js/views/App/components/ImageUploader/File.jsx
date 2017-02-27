/* globals FormData */

import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

import uploadStatus from '../../../../constants/UploadTypes';
import { uploadImage } from '../../../../services/api';

import styles from './styles.css';


class File extends Component {

  static propTypes = {
    file: PropTypes.shape({
      preview: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }).isRequired,
    allowUpload: PropTypes.bool,
    onUploadSuccess: PropTypes.func,
  };

  static defaultProps = {
    allowUpload: true,
    onUploadSuccess: () => {},
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      status: uploadStatus.PENDING,
      progress: 0,
      uploadErrors: [],
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
    const { file } = props || this.props;
    this.setState({ status: uploadStatus.UPLOADING }, () => {
      const data = new FormData();
      data.append('file', file);
      uploadImage(data, ({ error, response }) => {
        if (error) {
          this.setState({
            status: uploadStatus.ERROR,
            progress: 1,
            uploadErrors: [],
          });
        } else {
          this.setState({
            status: uploadStatus.SUCCESS,
            progress: 1,
            uploadErrors: [],
          }, () => {
            this.props.onUploadSuccess(response, file.preview);
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
    const { status, progress, uploadErrors } = this.state;
    return (
      <li
        className={classNames({
          [styles.file__error]: status === uploadStatus.ERROR,
          [styles.file__success]: status === uploadStatus.SUCCESS,
        })}
        styleName='styles.file'
      >

        <img
          src={file.preview}
          alt={file.name}
          styleName='styles.filePreview'
        />

        <div styleName='styles.fileName'>{ file.name }</div>

      </li>
    );
  }
}

export default File;
