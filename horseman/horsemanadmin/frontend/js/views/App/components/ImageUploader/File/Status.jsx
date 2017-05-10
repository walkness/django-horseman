import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

import './styles.scss';


const Status = (props) => {
  const { status, progress, uploadError, id, pk, addToQueue, duplicates, toggleDuplicates } = props;
  const link = (
    id && (
      <FormattedMessage
        id='imageUpload.file.status.link'
        defaultMessage='View'
      >
        { formatted => (
          <a
            href={`/images/${pk}/`}
            target='_blank' // eslint-disable-line react/jsx-no-target-blank
          >
            {formatted}
          </a>
        ) }
      </FormattedMessage>
    )
  );

  const retry = (
    <FormattedMessage
      id='imageUpload.file.status.retry'
      defaultMessage='Retry'
    >
      { formatted => (
        <button
          type='button'
          className='link'
          onClick={() => addToQueue(id)}
        >
          {formatted}
        </button>
      ) }
    </FormattedMessage>
  );

  const showDuplicates = (
    duplicates && duplicates.length > 0 && (
      <FormattedMessage
        id='imageUpload.file.status.duplicates'
        values={{ numDuplicates: duplicates.length }}
        defaultMessage='Show {numDuplicates, plural,
          =1 {duplicate}
          other {{numDuplicates, number} duplicates}
        }'
      >
        { formatted => (
          <button
            type='button'
            className='link'
            onClick={() => toggleDuplicates()}
          >
            {formatted}
          </button>
        ) }
      </FormattedMessage>
    )
  );

  return (
    <div styleName='upload-status'>
      <FormattedMessage
        id='imageUpload.file.status'
        values={{
          status,
          progress,
          errorCode: uploadError && uploadError.code,
          defaultErrorMessage: (uploadError && uploadError.message) || 'An error occurred',
          link,
          retry,
          showDuplicates,
        }}
        defaultMessage='{status, select,
          PENDING {Waiting to upload…}
          UPLOADING {{progress, plural,
            =1 {Processing…}
            other {Uploading: {progress, number, percent}}
          }}
          ERROR {{errorCode, select,
            other {{defaultErrorMessage} - {retry}}
          }}
          DUPLICATE {{errorCode, select,
            other {{defaultErrorMessage}}
          } – {showDuplicates}}
          SUCCESS {Uploaded – {link}}
        }'
      />
    </div>
  );
};

Status.propTypes = {
  status: PropTypes.string.isRequired,
  progress: PropTypes.number.isRequired,
  uploadError: PropTypes.shape({
    code: PropTypes.string,
    message: PropTypes.string,
  }).isRequired,
  id: PropTypes.string.isRequired,
  pk: PropTypes.string,
  duplicates: PropTypes.arrayOf(PropTypes.string),
  addToQueue: PropTypes.func.isRequired,
  toggleDuplicates: PropTypes.func.isRequired,
};

Status.defaultProps = {
  pk: null,
  duplicates: [],
};

export default Status;
