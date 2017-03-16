import React, { Component, PropTypes } from 'react';
import { autobind } from 'core-decorators';
import Formsy from 'formsy-react';
import { FormattedMessage } from 'react-intl';

import { resetPassword } from '../../../../services/api';
import { Input } from '../../components/Forms';
import Modal, { ModalBody, ModalFooter } from '../../components/Modal';


class PasswordReset extends Component {

  static propTypes = {
    display: PropTypes.bool,
    handleClose: PropTypes.func.isRequired,
    handleSuccess: PropTypes.func,
  }

  static defaultProps = {
    display: false,
    handleSuccess: () => {},
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      enableSubmit: false,
      isSubmitting: false,
      serverError: [],
      success: null,
      emailSentTo: null,
    };
  }

  @autobind
  handleSubmit(data, resetForm, invalidateForm) {
    this.setState({ isSubmitting: true }, () => {
      resetPassword(data).then(({ response, error }) => {
        if (error) {
          // const { fields, other } = processServerError(error, Object.keys(data));
          // invalidateForm(fields);
          // this.setState({
          //   isSubmitting: false,
          //   success: false,
          //   serverError: other,
          // });
        } else {
          this.setState({
            isSubmitting: false,
            serverError: [],
            emailSentTo: response.email,
            success: true,
          });
          this.props.handleSuccess(response);
        }
      });
    });
  }

  render() {
    const { display, handleClose } = this.props;

    const { enableSubmit, isSubmitting, serverError, success, emailSentTo } = this.state;

    const inputOpts = {};
    if (success) inputOpts.disabled = 'disabled';

    return (
      <Modal
        title='Forgot Your Password?'
        display={display}
        handleClose={handleClose}
      >

        <Formsy.Form
          onValid={() => this.setState({ enableSubmit: true })}
          onInvalid={() => this.setState({ enableSubmit: false })}
          onValidSubmit={this.handleSubmit}
          noValidate
        >

          <ModalBody>

            <div className='error'>
              { serverError.length === 1 ? serverError[0] :
                <ul>
                  {serverError.map((error, i) => <li key={i}>{error}</li>)}
                </ul>
              }
            </div>

            <div className='success'>
              <FormattedMessage
                id='auth.password.reset.success'
                values={{ email: emailSentTo }}
                defaultMessage="We've sent an email to {email} with a link to reset your password!"
              />
            </div>

            <p className='help-block'>
              <FormattedMessage
                id='auth.password.reset.help'
                defaultMessage="Forgotten your password? Enter your email address below, and we'll email instructions for setting a new one." // eslint-disable-line max-len
              />
            </p>

            <Input
              name='email'
              label='Email Address'
              validations='isEmail'
              validationErrors={{
                isEmail: 'Must be a valid email address.',
              }}
              {...inputOpts}
              required
            />

          </ModalBody>

          <ModalFooter
            submitButtonLabel='Send Password Reset Email'
            submitButtonEnabled={enableSubmit && !success}
            isSubmitting={isSubmitting}
          />

        </Formsy.Form>

      </Modal>
    );
  }
}

export default PasswordReset;
