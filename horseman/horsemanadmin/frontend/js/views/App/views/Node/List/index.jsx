import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { nodes as nodesAction } from '../../../../../actions';
import { getNodeTypeFromURLComponents } from '../../../../../utils';


class NodeList extends Component {

  componentWillMount() {
    this.maybeGetNodes();
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.params.app !== nextProps.params.app ||
      this.props.params.model !== nextProps.params.model
    ) {
      this.maybeGetNodes(nextProps);
    }
  }

  maybeGetNodes(props) {
    const nodeType = this.getNodeType();
    if (nodeType) {
      this.props.nodesRequest({ type: nodeType });
    }    
  }

  getNodeType(props) {
    const { nodes, params, nodesRequest } = props || this.props;
    const { app, model } = params;
    return getNodeTypeFromURLComponents(nodes, app, model);
  }

  render() {
    const { nodes, location } = this.props;
    const nodeType = this.getNodeType();
    const nodeState = nodes[nodeType];
    const orderedNodes = nodeState && nodeState.ordered && nodeState.ordered.default;
    return (
      <div className='node-list'>

        <ul>
          { orderedNodes && orderedNodes.ids.map((pk) => {
            const node = nodeState.byId[pk];
            return (
              <li key={pk}>
                <Link to={`${location.pathname}${pk}/`}>
                  { node.title }
                </Link>
              </li>
            );
          }) }
        </ul>

      </div>
    );
  }
}

const mapStateToProps = state => ({
  nodes: state.nodes,
});

const nodesRequest = nodesAction.request;

export default connect(
  mapStateToProps, {
    nodesRequest,
  })(NodeList);
