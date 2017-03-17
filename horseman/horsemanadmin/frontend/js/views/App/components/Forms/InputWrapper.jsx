import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

import styles from './styles.css';


function InputWrapper(WrappedComponent) {
  return class extends Component {

    static propTypes = {
      setValidations: PropTypes.func,
      resetValue: PropTypes.func,
      hasValue: PropTypes.func,
      getErrorMessage: PropTypes.func,
      getErrorMessages: PropTypes.func,
      isFormDisabled: PropTypes.func,
      isValid: PropTypes.func,
      isPristine: PropTypes.func,
      isFormSubmitted: PropTypes.func,
      isRequired: PropTypes.func,
      showRequired: PropTypes.func,
      showError: PropTypes.func,
      isValidValue: PropTypes.func,
      validationError: PropTypes.func,
      validationErrors: PropTypes.func,
      label: PropTypes.string,
      wrappedComponentRef: PropTypes.func,
      highlightSuccess: PropTypes.bool,
      highlightError: PropTypes.bool,
    };

    static defaultProps = {
      setValidations: () => {},
      resetValue: () => {},
      hasValue: () => true,
      getErrorMessage: () => null,
      getErrorMessages: () => [],
      isFormDisabled: () => false,
      isValid: () => true,
      isPristine: () => true,
      isFormSubmitted: () => {},
      isRequired: () => false,
      showRequired: () => false,
      showError: () => false,
      isValidValue: () => true,
      validationError: () => null,
      validationErrors: () => [],
      label: null,
      wrappedComponentRef: () => {},
      highlightSuccess: false,
      highlightError: true,
    };

    render() {
      /* eslint-disable no-unused-vars */
      const {
        setValidations,
        resetValue,
        hasValue,
        getErrorMessage,
        getErrorMessages,
        isFormDisabled,
        isValid,
        isPristine,
        isFormSubmitted,
        isRequired,
        showRequired,
        showError,
        isValidValue,
        validationError,
        validationErrors,
        label,
        wrappedComponentRef,
        highlightSuccess,
        highlightError,
        heading,
        large,
        wrapperClassName,
        ...wrappedComponentProps
      } = this.props;
      /* eslint-enable no-unused-vars */
      const valid = isValid();
      const pristine = isPristine();
      return (
        <div
          className={classNames(
            'input-wrapper', wrapperClassName, {
              required: isRequired(),
              success: highlightSuccess && !pristine && valid,
              error: highlightError && !pristine && !valid,
              empty: !hasValue(),
              heading,
              large,
            },
          )}
          styleName='styles.wrapper'
        >

          { label ?
            <label className='input-label' styleName='styles.label'>{ label }</label>
          : null }

          <div className='control-wrapper' styleName='styles.control-wrapper'>
            <WrappedComponent
              ref={wrappedComponentRef}
              placeholder={label}
              {...wrappedComponentProps}
            />
          </div>

        </div>
      );
    }
  };
}

export default InputWrapper;
