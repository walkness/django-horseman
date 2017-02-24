import React, { PropTypes } from 'react';


const Item = ({ image, getLink, onClick }) => {
  const inner = (
    <img
      src={image.renditions.thumbnail_150.url}
      alt={image.title}
    />
  );

  const wrapperProps = { className: 'image' };
  if (onClick) {
    wrapperProps.onClick = onClick;
  }

  if (getLink) {
    return (
      <a href={getLink(image)} {...wrapperProps}>
        { inner }
      </a>
    );
  }
  if (onClick) {
    return (
      <button {...wrapperProps}>
        { inner }
      </button>
    );
  }
  return (
    <div {...wrapperProps}>
      { inner }
    </div>
  );
};

export default Item;
