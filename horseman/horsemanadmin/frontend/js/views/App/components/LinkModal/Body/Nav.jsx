import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import NavTabs from 'Components/NavTabs';


const LinkModalBody = ({ modes, activeMode, changeMode }) => (
  <NavTabs>
    { modes.map(({ label, mode }) => (
      <button
        type='button'
        onClick={() => changeMode(mode)}
        className={classNames({ active: activeMode === mode })}
      >
        { label }
      </button>
    )) }
  </NavTabs>
);

LinkModalBody.propTypes = {
  modes: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    mode: PropTypes.string,
  })).isRequired,
  activeMode: PropTypes.string.isRequired,
  changeMode: PropTypes.func.isRequired,
};

export default LinkModalBody;
