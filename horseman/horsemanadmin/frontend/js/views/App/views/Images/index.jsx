import React, { PropTypes } from 'react';
import { Link } from 'react-router';


const Images = ({ children }) => (
  <div>

    <nav>
      <Link to='/admin/images/' activeClassName='active' indexOnly>
        Library
      </Link>
      <Link to='/admin/images/upload/' activeClassName='active'>
        Upload
      </Link>
    </nav>

    { children }
  </div>
);

Images.propTypes = {
  children: PropTypes.node,
};

export default Images;
