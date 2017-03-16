import React, { PropTypes } from 'react';
import Helmet from 'react-helmet';

import styles from './styles.css';


const LoginWrapper = ({ children }) => (
  <main id='login' styleName='styles.main'>
    <div className='container' styleName='styles.container'>

      <Helmet htmlAttributes={{ class: 'login' }} />

      { children }

    </div>

  </main>
);

LoginWrapper.propTypes = {
  children: PropTypes.node,
};

export default LoginWrapper;
