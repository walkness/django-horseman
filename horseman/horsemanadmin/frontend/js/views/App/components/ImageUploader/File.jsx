/* globals FormData */

import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';

import uploadStatus from '../../../../constants/UploadTypes';
import { uploadImage } from '../../../../services/api';

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
      id: null,
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
          this.setState({
            status: uploadStatus.ERROR,
            progress: 1,
            uploadErrors: [],
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
    const { status, progress, uploadErrors, id } = this.state;
    return (
      <li
        className={classNames({
          [styles.file__uploading]: status === uploadStatus.UPLOADING,
          [styles.file__error]: status === uploadStatus.ERROR,
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

        <div styleName='styles.upload-status'>
          <FormattedMessage
            id='imageUpload.file.status'
            values={{
              status,
              progress,
              link: (
                id && (
                  <FormattedMessage
                    id='imageUpload.file.status.link'
                    defaultMessage='View'
                  >
                    { formatted => (
                      <a
                        href={`/images/${id}/`}
                        target='_blank' // eslint-disable-line react/jsx-no-target-blank
                      >
                        {formatted}
                      </a>
                    ) }
                  </FormattedMessage>
                )
              ),
              retry: (
                <FormattedMessage
                  id='imageUpload.file.status.retry'
                  defaultMessage='Retry'
                >
                  { formatted => (
                    <button
                      type='button'
                      className='link'
                      onClick={() => this.props.addToQueue(this.props.id)}
                    >
                      {formatted}
                    </button>
                  ) }
                </FormattedMessage>
              ),
            }}
            defaultMessage='{status, select,
              PENDING {Waiting to upload…}
              UPLOADING {{progress, plural,
                =1 {Processing…}
                other {Uploading: {progress, number, percent}}
              }}
              ERROR {An error occurred - {retry}}
              SUCCESS {Uploaded – {link}}
            }'
          />
        </div>

      </li>
    );
  }
}

export default File;
