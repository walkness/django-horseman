import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import styles from './styles.scss';


function InputWrapper(WrappedComponent) {
  return class extends Component {

    static propTypes = {
      wrapperClassName: PropTypes.string,
      heading: PropTypes.bool,
    };

    static defaultProps = {
      wrapperClassName: null,
      heading: false,
    };

    render() {
      const { wrapperClassName, heading, ...otherProps } = this.props;
      return (
        <WrappedComponent
          {...otherProps}
          wrapperClassName={classNames(styles.wrapper, wrapperClassName, { heading })}
          labelClassName={styles.label}
          controlWrapperClassName={styles['control-wrapper']}
        />
      );
    }
  };
}

export default InputWrapper;
