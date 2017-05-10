import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

import './styles.scss';


const Status = (props) => {
  const { status, progress, uploadError, id, pk, addToQueue, duplicates, toggleDuplicates, updatedIds } = props;
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
    ((duplicates && duplicates.length > 0) || (updatedIds && updatedIds.length > 0)) && (
      <button
        type='button'
        className='link'
        onClick={() => toggleDuplicates()}
      >
        <FormattedMessage
          id='imageUpload.file.status.duplicates'
          values={{
            numDuplicates: duplicates.length,
            showing: props.showDuplicates ? 'yes' : 'no',
            numUpdated: (updatedIds && updatedIds.length) || 0,
          }}
          defaultMessage='{showing, select,
            yes {Hide}
            no {Show}
          } {numUpdated, plural,
            =0 {{numDuplicates, plural,
              =1 {duplicate}
              other {{numDuplicates, number} duplicates}
            }}
            other {{numUpdated, plural,
              =1 {updated image}
              other {{numUpdated, number} updated images}
            }}
          }'
        />
      </button>
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
          new: updatedIds && updatedIds.length > 0 ? 'no' : 'yes',
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
          SUCCESS {Uploaded – {new, select,
            yes {{link}}
            no {{showDuplicates}}
          }}
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
  showDuplicates: PropTypes.bool.isRequired,
  updatedIds: PropTypes.arrayOf(PropTypes.string).isRequired,
};

Status.defaultProps = {
  pk: null,
  duplicates: [],
};

export default Status;
