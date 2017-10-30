import React from 'react';
import PropTypes from 'prop-types';
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
