/* globals window document */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import Helmet from 'react-helmet';
import titleCase from 'title-case';
import classNames from 'classnames';
import { autobind } from 'core-decorators';

import { nodes as nodesAction } from 'actions';
import { getNodeTypeFromURLComponents } from 'utils';
import Image from 'Components/Image';

import './styles.scss';


class NodeList extends Component {
  static propTypes = {
    imagesById: PropTypes.shape({ [PropTypes.string]: PropTypes.object }).isRequired,
    nodes: PropTypes.shape({
      [PropTypes.string]: PropTypes.shape({
        byId: PropTypes.object,
        configuration: PropTypes.object,
      }),
    }).isRequired,
    nodesRequest: PropTypes.func.isRequired,
    params: PropTypes.shape({ app: PropTypes.string, model: PropTypes.string }).isRequired,
  };

  constructor(props, context) {
    super(props, context);
    this.pastThreshold = false;
    this.scrollThreshold = 0.25;
  }

  componentWillMount() {
    this.maybeGetNodes();
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
    this.setDimensions();
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.params.app !== nextProps.params.app ||
      this.props.params.model !== nextProps.params.model
    ) {
      this.maybeGetNodes(nextProps);
    }
  }

  componentDidUpdate() {
    this.setDimensions();
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  getNodeType(props) {
    const { nodes, params } = props || this.props;
    const { app, model } = params;
    return getNodeTypeFromURLComponents(nodes, app, model);
  }

  setDimensions() {
    this._containerHeight = window.innerHeight;
    this._contentHeight = document.documentElement.scrollHeight;
  }

  maybeGetNodes(props) {
    const nodeType = this.getNodeType(props);
    if (nodeType) {
      this.props.nodesRequest({ type: nodeType });
    }
  }

  @autobind
  handleScroll() {
    const distanceFromBottom = this._contentHeight - (window.scrollY + this._containerHeight);
    const distanceThreshold = this.scrollThreshold * this._containerHeight;
    if (distanceFromBottom <= distanceThreshold && !this.pastThreshold) {
      this.pastThreshold = true;
      this.handleLoadNext();
    } else if (distanceFromBottom > distanceThreshold) {
      this.pastThreshold = false;
    }
  }

  handleLoadNext() {
    const { nodes } = this.props;
    const nodeType = this.getNodeType();
    const nodeState = nodes[nodeType];
    const ordered = nodeState && nodeState.ordered && nodeState.ordered.default;
    if (ordered && ordered.next && !ordered.loading) {
      this.props.nodesRequest(Object.assign({}, ordered.next, { type: nodeType }));
    }
  }

  render() {
    const { nodes } = this.props;
    const nodeType = this.getNodeType();
    const nodeState = nodes[nodeType];
    const orderedNodes = nodeState && nodeState.ordered && nodeState.ordered.default;
    const hasFeaturedImage = nodeState.configuration.admin_featured_image;
    return (
      <div styleName='node-list'>

        <Helmet title={titleCase(nodeState.configuration.name_plural)} />

        <Link className='btn' to={`${nodeState.configuration.admin_path}new/`}>
          Create new { nodeState.configuration.name }
        </Link>

        <ul
          className={classNames({ 'has-featured-image': hasFeaturedImage })}
          styleName='nodes'
        >

          <li styleName='header'>
            { hasFeaturedImage ?
              <div styleName='column featured-image' />
            : null }
            <div styleName='column title'>Title</div>
            <div styleName='column'>Status</div>
            <div styleName='column'>Last updated</div>
          </li>

          { orderedNodes && orderedNodes.ids && orderedNodes.ids.map((pk) => {
            const node = nodeState.byId[pk];
            const featuredImage = this.props.imagesById[
              node[nodeState.configuration.admin_featured_image]
            ];
            if (!node) return null;
            return (
              <li key={pk} styleName='node'>

                <Link to={`${nodeState.configuration.admin_path}${pk}/`}>

                  { hasFeaturedImage ?
                    <div styleName='column featured-image'>
                      { featuredImage ?
                        <Image image={featuredImage} srcSize='thumbnail_150' sizes='6rem' />
                      : null }
                    </div>
                  : null }

                  <div styleName='column title'>{ node.title }</div>

                  <div styleName='column'>
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

                  <div styleName='column'>
                    <FormattedMessage
                      id='nodes.list.date'
                      values={{ date: new Date(node.modified_at) }}
                      defaultMessage='{date, date, long} at {date, time, short}'
                    >
                      { formatted => <time dateTime={node.modified_at}>{ formatted }</time> }
                    </FormattedMessage>
                  </div>

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
  imagesById: state.images.byId,
});

const nodesRequest = nodesAction.request;

export default connect(
  mapStateToProps, {
    nodesRequest,
  })(NodeList);
