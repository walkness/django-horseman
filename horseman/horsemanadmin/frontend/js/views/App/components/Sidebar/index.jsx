import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import titleCase from 'title-case';


const Sidebar = ({ nodes }) => (
  <div className='sidebar'>

    <ul className='nav'>
      { Object.keys(nodes).map(nodeType => {
        const node = nodes[nodeType];
        return (
          <li key={nodeType} className='node'>
            <Link to={`/admin/${node.configuration.app_label}/${node.configuration.model_name}/`}>
              { titleCase(node.configuration.name_plural) }
            </Link>
          </li>
        );
      }) }
    </ul>

  </div>
);

export default Sidebar;
