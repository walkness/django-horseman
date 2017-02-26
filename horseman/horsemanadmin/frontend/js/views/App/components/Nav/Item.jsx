import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import classNames from 'classnames';

import styles from './style.css';

const NavItem = ({ to, children, active, ...extraProps }) => {
  if (to) {
    return (
      <Link
        to={to}
        className='link'
        styleName='styles.NavItem'
        activeClassName='active'
        {...extraProps}
      >
        { children }
      </Link>
    );
  }
  return (
    <button
      type='button'
      className={classNames('link', { active })}
      styleName='styles.NavItem'
      {...extraProps}
    >
      { children }
    </button>
  );
};

NavItem.propTypes = {
  to: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({ pathname: PropTypes.string })]),
  children: PropTypes.node,
  onClick: PropTypes.func,
};

NavItem.defaultProps = {
  to: null,
  children: null,
  onClick: () => {},
};

export default NavItem;
