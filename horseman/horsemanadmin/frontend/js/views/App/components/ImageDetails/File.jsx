import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

import Filesize from 'Components/Filesize';

import Row from './Row';


const File = ({ image, ...props }) => {
  const match = image.mime_type.match(/^image\/([^+]+)/);
  const type = match && match[1] && match[1].toUpperCase();
  return (
    <div {...props}>

      <h3>File Details</h3>

      <Row label='Dimensions'>
        <FormattedMessage
          id='image.fileDetails.dimensions'
          values={{
            width: image.width,
            height: image.height,
          }}
          defaultMessage='{width} × {height}'
        />
      </Row>

      <Row label='Size'>
        <Filesize size={image.filesize} />
      </Row>

      <Row label='Type'>
        { type || image.mime_type }
      </Row>

    </div>
  );
};

export default File;
