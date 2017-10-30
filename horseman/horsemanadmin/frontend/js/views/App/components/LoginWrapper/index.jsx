import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';

import './styles.css';


const LoginWrapper = ({ children }) => (
  <main id='login' styleName='main'>
    <div className='container' styleName='container'>

      <Helmet htmlAttributes={{ class: 'login' }} />

      { children }

    </div>

  </main>
);

LoginWrapper.propTypes = {
  children: PropTypes.node,
};

export default LoginWrapper;
