import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Formsy from 'formsy-react';
import { autobind } from 'core-decorators';

import { user as userAction, userUpdated } from '../../../../../actions';
import { updateUser } from '../../../../../services/api';

import { Input } from '../../../components/Forms';


class UserEdit extends Component {

  static propTypes = {
    params: PropTypes.object.isRequired,
    usersById: PropTypes.object.isRequired,
    userRequest: PropTypes.func.isRequired,
    userUpdated: PropTypes.func.isRequired,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      submitting: false,
    };
  }

  componentWillMount() {
    this.props.userRequest(this.props.params.id);
  }

  @autobind
  handleSubmit(data) {
    this.setState({ submitting: true }, () => {
      updateUser(this.props.params.id, data).then(({ response, error }) => {
        if (error) {
          this.setState({ submitting: false });
        } else {
          this.setState({ submitting: false });
          this.props.userUpdated(response);
        }
      });
    });
  }

  render() {
    const user = this.props.usersById[this.props.params.id];
    return (
      <div>

        <Formsy.Form
          onValidSubmit={this.handleSubmit}
          noValidate
        >

          <Input
            name='first_name'
            label='First name'
            value={user.first_name}
          />

          <Input
            name='last_name'
            label='Last name'
            value={user.last_name}
          />

          <Input
            name='email'
            label='Email'
            value={user.email}
            validations='isEmail'
            validationErrors={{
              isEmail: 'Please enter a valid email.',
            }}
            required
          />

          <button className='btn'>
            Update
          </button>

        </Formsy.Form>

      </div>
    );
  }
}

const mapStateToProps = state => ({
  usersById: state.users.byId,
});

const userRequest = userAction.request;

export default connect(
  mapStateToProps, {
    userRequest,
    userUpdated,
  })(UserEdit);
