import React, { PropTypes } from 'react';

import Image from '../../../Image';
import DateTime from '../../../ImageDetails/DateTime';
import Exposure from '../../../ImageDetails/Exposure';

import './styles.scss';


const Duplicate = ({ image, replace, toggleReplace, viewOnly }) => {
  const checkboxId = `replace_${image.pk}`;
  return (
    <li styleName='duplicate'>

      <label htmlFor={checkboxId}>

        <div styleName='duplicate-info'>

          <div styleName='image-details'>

            <div styleName='preview'>
              <Image image={image} srcSize='thumbnail_150' sizes='7rem' />
            </div>

            <div styleName='file-details'>

              <div styleName='title'>{ image.title }</div>

              <div styleName='original-filename'>{ image.original_filename }</div>

              <DateTime
                value={image.captured_at}
                timezone={image.captured_at_tz}
                defaultTimezone='UTC'
                displayTimezone={!!image.captured_at_tz}
                styleName='capture-time'
              />

            </div>

          </div>

          <Exposure image={image} styleName='exposure' />

        </div>

        <div styleName='duplicate-actions'>
          { !viewOnly ?
            <input
              type='checkbox'
              id={checkboxId}
              name={checkboxId}
              checked={replace}
              onChange={toggleReplace}
            />
          : null }

          <a href={`/images/${image.pk}/`} target='_blank'>View</a>
        </div>

      </label>

    </li>
  );
};

Duplicate.propTypes = {
  image: PropTypes.shape({
    title: PropTypes.string,
  }).isRequired,
  replace: PropTypes.bool,
  toggleReplace: PropTypes.func,
  viewOnly: PropTypes.bool,
};

Duplicate.defaultProps = {
  replace: false,
  toggleReplace: () => {},
  viewOnly: false,
};

export default Duplicate;
