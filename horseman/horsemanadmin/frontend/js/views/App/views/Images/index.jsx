import React, { PropTypes } from 'react';
import { Link } from 'react-router';


const Images = ({ children }) => (
  <div>
    { children }
  </div>
);

Images.propTypes = {
  children: PropTypes.node,
};

export default Images;
