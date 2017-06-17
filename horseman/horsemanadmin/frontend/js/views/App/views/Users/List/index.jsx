import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Helmet from 'react-helmet';

import { users as usersAction } from 'actions';

import './styles.css';


class UserList extends Component {

  static propTypes = {
    usersRequest: PropTypes.func.isRequired,
    usersById: PropTypes.object.isRequired,
    orderedUsers: PropTypes.shape({
      [PropTypes.string]: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,
    currentUser: PropTypes.string,
    adminBase: PropTypes.string.isRequired,
  };

  componentWillMount() {
    this.props.usersRequest();
  }

  render() {
    const { orderedUsers } = this.props;
    const ids = (orderedUsers && orderedUsers.default || [this.props.currentUser]);
    return (
      <div styleName='users'>

        <Helmet title='Users' />

        <ul styleName='users-list'>
          { ids.map((id) => {
            const user = this.props.usersById[id];
            return (
              <li key={id} styleName='user'>

                <div styleName='name'>

                  <div styleName='gravatar'>
                    <img src={user.gravatar} role='presentation' />
                  </div>

                  <Link to={`${this.props.adminBase}users/${user.pk}/`}>
                    { user.first_name || user.email }
                  </Link>

                </div>

              </li>
            );
          }) }
        </ul>

      </div>
    );
  }
}

const mapStateToProps = state => ({
  usersById: state.users.byId,
  orderedUsers: state.users.ordered,
  currentUser: state.users.current,
  adminBase: state.config.adminURLBase,
});

const usersRequest = usersAction.request;

export default connect(
  mapStateToProps, {
    usersRequest,
  })(UserList);
