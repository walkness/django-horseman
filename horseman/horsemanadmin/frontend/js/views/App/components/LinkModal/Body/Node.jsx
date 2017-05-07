import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { autobind } from 'core-decorators';
import classNames from 'classnames';

import { nodes as nodesAction } from '../../../../../actions';

import { Input, Select } from '../../Forms/Select';

import './styles.css';


class Node extends Component {

  constructor(props, context) {
    super(props, context);
    this.nodeTypes = this.getSortedNodeConfigurations();
    this.state = {
      nodeType: this.nodeTypes[0].node_type,
    };
  }

  componentWillMount() {
    const { nodeType } = this.state;
    this.props.nodesRequest({ type: nodeType });
  }

  getSortedNodeConfigurations(props) {
    const { nodes } = props || this.props;
    const nodeTypes = Object.values(nodes).map(({ configuration }) => configuration);
    nodeTypes.sort((a, b) => {
      if (a.admin_order > b.admin_order) return 1;
      if (a.admin_order < b.admin_order) return -1;
      return 0;
    });
    return nodeTypes;
  }

  @autobind
  handleNodeTypeChange(value) {
    this.props.nodesRequest({ type: value });
    this.setState({ nodeType: value });
  }

  @autobind
  handleNodeClick(node) {
    this.props.onAttsChange({
      nodeId: node.pk,
      href: node.url_path,
    });
  }

  render() {
    const nodeState = this.props.nodes[this.state.nodeType];
    const nodes = nodeState.ordered && nodeState.ordered.default && nodeState.ordered.default.ids;
    return (
      <div styleName='nodes'>

        <Select
          name='node-type'
          getValue={() => this.state.nodeType}
          setValue={this.handleNodeTypeChange}
          options={this.nodeTypes.map(configuration => ({
            label: configuration.name_plural,
            value: configuration.node_type,
          }))}
        />

        <div styleName='node-list-wrapper'>
          <ul styleName='node-list'>
            { (nodes || []).map((pk) => {
              const node = nodeState.byId[pk];
              return (
                <li>
                  <button
                    type='button'
                    onClick={() => this.handleNodeClick(node)}
                    className={classNames({ active: pk === this.props.atts.nodeId })}
                  >
                    { node.title }
                  </button>
                </li>
              );
            }) }
          </ul>
        </div>

      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  nodes: state.nodes,
});

const nodesRequest = nodesAction.request;

export default connect(
  mapStateToProps, {
    nodesRequest,
  })(Node);
