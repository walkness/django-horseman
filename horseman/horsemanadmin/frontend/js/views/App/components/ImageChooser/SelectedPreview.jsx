import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

import Image from '../Image';

import styles from './styles.css';


const SelectedPreview = ({ image }) => (
  <div>
    <div styleName='styles.imagePreview'>
      <Image
        image={image}
        srcSize='thumbnail_300'
      />
    </div>

    <h3>{ image.title }</h3>

    <FormattedMessage
      id='imageChooser.preview.date'
      values={{ date: new Date(image.created_at) }}
      defaultMessage='{date, date, long} at {date, time, long}'
    >
      { (formatted) => <time dateTime={image.created_at}>{ formatted }</time> }
    </FormattedMessage>

  </div>
);

SelectedPreview.propTypes = {
  image: PropTypes.shape({
    title: PropTypes.string,
    renditions: PropTypes.shape({
      [PropTypes.string]: PropTypes.shape({
        url: PropTypes.string.isRequired,
      }),
    }),
  }).isRequired,
};

export default SelectedPreview;
