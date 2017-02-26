import React, { PropTypes } from 'react';

import Item from './Item';

import styles from './styles.css';


const ImageBrowserGrid = ({ ids, imagesById, getLink, onImageClick, selected }) => {
  return (
    <div className='image-browser-grid' styleName='styles.grid'>

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

export default ImageBrowserGrid;
