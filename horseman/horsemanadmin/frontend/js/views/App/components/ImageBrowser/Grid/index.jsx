import React, { PropTypes } from 'react';

import Item from './Item';

import styles from './styles.css';


const ImageBrowserGrid = ({ ids, imagesById, getLink, onImageClick, selected, contentRef }) => {
  return (
    <div className='image-browser-grid' styleName='styles.grid' ref={contentRef}>

      { ids.map(id => (
        <Item
          image={imagesById[id]}
          getLink={getLink}
          onClick={onImageClick}
          selected={selected.indexOf(id) !== -1}
        />
      )) }

    </div>
  );
};

ImageBrowserGrid.propTypes = {
  ids: PropTypes.arrayOf(PropTypes.string).isRequired,
  imagesById: PropTypes.shape({
    [PropTypes.string]: PropTypes.shape({
      pk: PropTypes.string,
    }),
  }).isRequired,
  selected: PropTypes.arrayOf(PropTypes.string),
};

ImageBrowserGrid.defaultProps = {
  selected: [],
};

export default ImageBrowserGrid;
