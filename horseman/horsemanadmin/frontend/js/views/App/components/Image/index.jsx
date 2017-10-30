import React from 'react';
import PropTypes from 'prop-types';


const threshold = 100;


const Image = ({ image, srcSize, alt, sizes, ...props }) => {
  if (!image) return null;
  const rendition = image.renditions[srcSize];
  const src = rendition || image;
  const aspect = src.width / src.height;
  const roundedAspect = Math.round(aspect * threshold);
  const srcs = Object.values(image.renditions || {}).filter(({ width, height }) => {
    const renditionAspect = width / height;
    return Math.round(renditionAspect * threshold) === roundedAspect;
  });
  if (Math.round((image.width / image.height) * threshold) === roundedAspect) {
    srcs.push(image);
  }
  srcs.sort((a, b) => {
    if (a.width > b.width) return 1;
    if (a.width < b.width) return -1;
    return 0;
  });
  const responsiveProps = {};
  if (srcs.length > 0) {
    responsiveProps.srcSet = srcs.map(({ url, width }) => `${url} ${width}w`).join(', ');
    if (sizes) {
      responsiveProps.sizes = Array.isArray(sizes) ? sizes.join(', ') : sizes;
    } else {
      responsiveProps.sizes = `${src.width}px`;
    }
  }
  return (
    <img
      src={src.url}
      width={src.width}
      height={src.height}
      alt={alt || image.title}
      {...responsiveProps}
      {...props}
    />
  );
};

Image.propTypes = {
  image: PropTypes.shape({
    title: PropTypes.string,
    renditions: PropTypes.shape({
      [PropTypes.string]: PropTypes.shape({
        url: PropTypes.string.isRequired,
      }),
    }),
  }).isRequired,
  srcSize: PropTypes.string,
  sizes: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
};

Image.defaultProps = {
  srcSize: null,
  sizes: null,
  alt: null,
};

export default Image;
