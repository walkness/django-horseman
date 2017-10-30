import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

import Image from 'Components/Image';
import Exposure from 'Components/ImageDetails/Exposure';
import GPS from 'Components/ImageDetails/GPS';
import DateTime from 'Components/ImageDetails/DateTime';
import Row from 'Components/ImageDetails/Row';

import './styles.scss';


const SelectedPreview = ({ image }) => (
  <div>
    <div styleName='imagePreview'>
      <Image
        image={image}
        srcSize='thumbnail_300'
      />
    </div>

    <h3>{ image.title }</h3>

    { image.captured_at ?
      <Row label='Captured at'>
        <DateTime
          value={image.captured_at}
          timezone={image.captured_at_tz}
          defaultTimezone='UTC'
          displayTimezone={!!image.captured_at_tz}
        />
      </Row>
    : null }

    <Row label='Uploaded at'>
      <DateTime value={image.created_at} />
    </Row>

    <Exposure image={image} />

    <GPS image={image} />

    <Link to={`/images/${image.pk}/`}>
      View/edit image
    </Link>

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
