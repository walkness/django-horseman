import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';

import { nodes as nodesAction } from '../../../../../actions';
import { getNodeTypeFromURLComponents } from '../../../../../utils';

import styles from './styles.css';


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
    const nodeType = this.getNodeType(props);
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
      <div styleName='styles.node-list'>

        <Link className='btn' to={`${location.pathname}new/`}>
          Create new { nodeState.configuration.name }
        </Link>

        <ul styleName='styles.nodes'>

          <li styleName='styles.header'>
            <div styleName='styles.column styles.title'>Title</div>
            <div styleName='styles.column'>Status</div>
            <div styleName='styles.column'>Last updated</div>
          </li>

          { orderedNodes && orderedNodes.ids.map((pk) => {
            const node = nodeState.byId[pk];
            if (!node) return null;
            return (
              <li key={pk} styleName='styles.node'>

                <div styleName='styles.column styles.title'>
                  <Link to={`${location.pathname}${pk}/`}>
                    { node.title }
                  </Link>
                </div>

                <div styleName='styles.column'>
                  <FormattedMessage
                    id='nodes.list.status'
                    values={{
                      published: node.published ? 'yes' : 'no',
                      publishedDate: node.published_at && new Date(node.published_at),
                    }}
                    defaultMessage='{published, select,
                      yes {Published on {publishedDate, date, long}}
                      no {Draft}
                    }'
                  />
                </div>

                <div styleName='styles.column'>
                  <FormattedMessage
                    id='nodes.list.date'
                    values={{ date: new Date(node.modified_at) }}
                    defaultMessage='{date, date, long} at {date, time, long}'
                  >
                    { (formatted) => <time dateTime={node.modified_at}>{ formatted }</time> }
                  </FormattedMessage>
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
  nodes: state.nodes,
});

const nodesRequest = nodesAction.request;

export default connect(
  mapStateToProps, {
    nodesRequest,
  })(NodeList);
