import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import titleCase from 'title-case';

import styles from './styles.css';


const Sidebar = ({ nodes, currentUser, usersById, isLoggedIn }) => {
  const apps = {};
  Object.keys(nodes).sort((a, b) => {
    const nodeA = nodes[a];
    const nodeB = nodes[b];
    if (nodeA.configuration.admin_order > nodeB.configuration.admin_order) return 1;
    if (nodeA.configuration.admin_order < nodeB.configuration.admin_order) return -1;
    return 0;
  }).forEach((nodeType) => {
    const node = nodes[nodeType];
    const appLabel = node.configuration.app_label;
    if (!apps[appLabel]) apps[appLabel] = [];
    apps[appLabel].push(node);
  });
  const currentUserObj = usersById[currentUser];
  return (
    <div className='sidebar' styleName='styles.sidebar-wrapper'>

      <div styleName='styles.sidebar'>

        <ul styleName='styles.apps'>
          { Object.keys(apps).map(appLabel => {
            const appNodes = apps[appLabel];
            return (
              <li key={appLabel}>
                <div styleName='styles.section-header'>{ titleCase(appLabel) }</div>
                <ul>
                  { appNodes.map(({ configuration }) => (
                    <li key={configuration.node_type} className='node'>
                      <Link
                        to={`/admin/${configuration.app_label}/${configuration.model_name}/`}
                        activeClassName='active'
                      >
                        { titleCase(configuration.name_plural) }
                      </Link>
                    </li>
                  )) }
                </ul>
              </li>
            );
          }) }

          <li className='images'>
            <div styleName='styles.section-header'>Images</div>
            <ul>
              <li><Link to='/admin/images/' activeClassName='active' onlyActiveOnIndex>Library</Link></li>
              <li><Link to='/admin/images/upload/' activeClassName='active'>Upload</Link></li>
            </ul>
          </li>

          <li className='settings'>
            <div styleName='styles.section-header'>Settings</div>
            <ul>
              <li><Link to='/admin/users/' activeClassName='active'>Users</Link></li>
            </ul>
          </li>

        </ul>

        <div styleName='styles.user'>
          <div styleName='styles.section-header'>Logged In As</div>
          <Link to={`/admin/users/${currentUserObj.pk}/`}>
            { currentUserObj.first_name || currentUserObj.email }
          </Link>
        </div>

      </div>

    </div>
  );
};

export default Sidebar;
