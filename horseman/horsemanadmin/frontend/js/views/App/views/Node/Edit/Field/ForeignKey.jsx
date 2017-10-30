import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';

import { TypedSelect } from 'Components/Forms';


class ForeignKey extends Component {

  static propTypes = {
    nodes: PropTypes.object.isRequired,
    fieldConfig: PropTypes.object.isRequired,
    nodesRequest: PropTypes.func.isRequired,
    multiple: PropTypes.bool,
  };

  static defaultProps = {
    multiple: false,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      cache: {},
    };
  }

  @autobind
  handleInputChange(value) {
    this.props.nodesRequest({
      type: this.props.fieldConfig.related_node_type,
      s: encodeURIComponent(value),
    });
  }

  render() {
    const { nodes, fieldConfig, ...selectProps } = this.props;
    const nodeState = nodes[fieldConfig.related_node_type];
    const ids = Object.keys((nodeState && nodeState.byId) || {});
    const options = ids.map((id) => {
      const node = nodeState && nodeState.byId && nodeState.byId[id];
      return { value: id, label: node && node.title };
    }).filter(({ label }) => !!label);
    return (
      <TypedSelect
        options={options}
        onInputChange={this.handleInputChange}
        multi={this.props.multiple}
        {...selectProps}
      />
    );
  }
}

export default ForeignKey;
