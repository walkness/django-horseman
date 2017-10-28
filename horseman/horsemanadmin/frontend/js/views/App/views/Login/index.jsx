import React, { Component, PropTypes } from 'react';
import { routerShape, locationShape } from 'react-router/lib/PropTypes';
import { connect } from 'react-redux';
import { autobind } from 'core-decorators';
import Helmet from 'react-helmet';
import Formsy from 'formsy-react';

import { login } from 'actions';

import { Input } from 'Components/Forms';
import FormMessages from 'Components/FormMessages';

import PasswordReset from './PasswordReset';

import './styles.css';


class Login extends Component {

  static propTypes = {
    isLoggedIn: PropTypes.bool,
    loggingIn: PropTypes.bool,
    loginRequest: PropTypes.func.isRequired,
    location: locationShape.isRequired,
    adminBase: PropTypes.string.isRequired,
    error: PropTypes.shape({ field_errors: PropTypes.object, non_field_errors: PropTypes.array }),
  };

  static defaultProps = {
    isLoggedIn: false,
    error: null,
  };

  static contextTypes = {
    router: routerShape.isRequired,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      formValid: false,
      serverError: [],
      showPasswordReset: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isLoggedIn && !this.props.isLoggedIn) {
      this.context.router.push(this.props.location.query.next || this.props.adminBase);
    }
    if (nextProps.error) {
      this.form.updateInputsWithError(nextProps.error.field_errors);
      this.setState({ serverError: nextProps.error.non_field_errors });
    }
  }

  @autobind
  handleSubmit(data) {
    this.props.loginRequest(data.username, data.password);
  }

  render() {
    const { loggingIn } = this.props;

    const { serverError, showPasswordReset, formValid } = this.state;

    return (
      <div>

        <Helmet title='Login' />

        <Formsy.Form
          ref={(c) => { this.form = c; }}
          className='form-signin'
          onValid={() => this.setState({ formValid: true })}
          onInvalid={() => this.setState({ formValid: false })}
          onValidSubmit={this.handleSubmit}
          noValidate
        >

          <h1 styleName='heading'>Please Sign In</h1>

          <FormMessages errors={serverError} />

          <Input
            name='username'
            label='Username'
            required
            large
          />

          <Input
            type='password'
            name='password'
            label='Password'
            large
            required
          />

          <button
            className='btn'
          >
            Sign In
          </button>

          <button
            type='button'
            className='btn'
            onClick={() => this.setState({ showPasswordReset: !showPasswordReset })}
          >
            Forgot your password?
          </button>

        </Formsy.Form>

        { showPasswordReset ?
          <PasswordReset
            handleClose={() => this.setState({ showPasswordReset: false })}
          />
        : null }

      </div>
    );
  }
}

const mapStateToProps = state => ({
  isLoggedIn: state.users.isLoggedIn,
  loggingIn: state.users.loggingIn,
  error: state.users.loginError,
  adminBase: state.config.adminURLBase,
});

const loginRequest = login.request;

export default connect(
  mapStateToProps, {
    loginRequest,
  })(Login);
