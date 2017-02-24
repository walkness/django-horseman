import React, { PropTypes } from 'react';

import Item from './Item';


const ImageBrowserGrid = ({ ids, imagesById, getLink, onClick }) => {
  return (
    <div className='image-browser-grid'>

      { ids.map(id => (
        <Item
          image={imagesById[id]}
          getLink={getLink}
          onClick={onClick}
        />
      )) }

    </div>
  );
};

export default ImageBrowserGrid;
