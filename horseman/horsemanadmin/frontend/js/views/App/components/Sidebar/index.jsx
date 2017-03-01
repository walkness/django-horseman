import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import titleCase from 'title-case';

import styles from './styles.css';


const Sidebar = ({ nodes, currentUser, usersById, isLoggedIn }) => {
  const apps = {};
  Object.keys(nodes).forEach((nodeType) => {
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
              <li>
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

          <li className='image'>
            <div styleName='styles.section-header'>Images</div>
            <ul>
              <li><Link to='/admin/images/' activeClassName='active' onlyActiveOnIndex>Library</Link></li>
              <li><Link to='/admin/images/upload/' activeClassName='active'>Upload</Link></li>
            </ul>
          </li>

        </ul>

        <div styleName='styles.user'>
          <div styleName='styles.section-header'>Logged In As</div>
          { currentUserObj.email }
        </div>

      </div>

    </div>
  );
};

export default Sidebar;
