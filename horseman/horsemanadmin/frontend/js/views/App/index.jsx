import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { routerShape } from 'react-router/lib/PropTypes';

import { logout as logoutAction } from '../../actions';

import LoginWrapper from './components/LoginWrapper';
import Sidebar from './components/Sidebar';

import styles from './styles.css';


class App extends Component {

  static propTypes = {
    isLoggedIn: PropTypes.bool.isRequired,
    children: PropTypes.node.isRequired,
  };

  static contextTypes = {
    router: routerShape.isRequired,
  };

  componentWillReceiveProps(nextProps) {
    if (!nextProps.isLoggedIn && nextProps.isLoggedIn !== this.props.isLoggedIn) {
      this.context.router.push('/admin/login/');
    }
  }

  render() {
    const { children, ...props } = this.props;
    if (
      children &&
      children.props &&
      children.props.route &&
      children.props.route.unauthed
    ) {
      return (
        <LoginWrapper>
          { children }
        </LoginWrapper>
      );
    }
    return (
      <div id='app' styleName='styles.app'>

        <main styleName='styles.main-wrapper'>
          <div styleName='styles.main'>
            { children }
          </div>
        </main>

        <Sidebar {...props} />

      </div>
    );
  }
}

const mapStateToProps = state => ({
  nodes: state.nodes,
  isLoggedIn: state.users.isLoggedIn,
  currentUser: state.users.current,
  usersById: state.users.byId,
});

const logoutRequest = logoutAction.request;

export default connect(
  mapStateToProps, {
    logoutRequest,
  })(App);
