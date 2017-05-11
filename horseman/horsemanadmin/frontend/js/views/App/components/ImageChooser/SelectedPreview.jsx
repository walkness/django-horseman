import React, { PropTypes } from 'react';

import Image from '../Image';

import Exposure from '../ImageDetails/Exposure';
import GPS from '../ImageDetails/GPS';
import DateTime from '../ImageDetails/DateTime';
import Row from '../ImageDetails/Row';

import styles from './styles.scss';


const SelectedPreview = ({ image }) => (
  <div>
    <div styleName='styles.imagePreview'>
      <Image
        image={image}
        srcSize='thumbnail_300'
      />
    </div>

    <h3>{ image.title }</h3>

    <Row label='Captured at'>
      <DateTime
        value={image.captured_at}
        timezone={image.captured_at_tz}
        defaultTimezone='UTC'
        displayTimezone={!!image.captured_at_tz}
      />
    </Row>

    <Row label='Uploaded at'>
      <DateTime value={image.created_at} />
    </Row>

    <Exposure image={image} />

    <GPS image={image} />

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
