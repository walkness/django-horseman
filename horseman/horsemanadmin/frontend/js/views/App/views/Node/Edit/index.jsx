import React, { Component, PropTypes } from 'react';
import { locationShape } from 'react-router/lib/PropTypes';
import { connect } from 'react-redux';
import Formsy from 'formsy-react';
import { autobind } from 'core-decorators';

import {
  nodes as nodesAction,
  node as nodeAction,
  nodeRevisions as nodeRevisionsAction,
  nodeUpdated,
  nodeCreated,
  images as imagesAction,
  imageUploaded,
} from '../../../../../actions';
import { updateNode, createNode } from '../../../../../services/api';
import { Input } from '../../../components/Forms';
import Field from './Field';
import { getNodeTypeFromURLComponents } from '../../../../../utils';

import RevisionsList from './RevisionsList';

import styles from './styles.css';


class EditNode extends Component {

  static propTypes = {
    params: PropTypes.object.isRequired,
    location: locationShape.isRequired,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {};
    this.fieldRefs = {};
  }

  componentWillMount() {
    if (this.props.params.id) {
      this.getNode();
    }
    const { params } = this.props;
    const nodeType = this.getNodeType();
    if (nodeType) {
      this.props.nodeRevisionsRequest(params.id, { type: nodeType });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (
      (this.props.params.id !== nextProps.params.id) ||
      (this.props.location.query.revision !== nextProps.location.query.revision)
    ) {
      this.getNode(nextProps);
    }
  }

  getNode(props) {
    const { params, location } = props || this.props;
    const nodeType = this.getNodeType(props);
    if (nodeType) {
      this.props.nodeRequest(params.id, {
        type: nodeType,
        revision: location.query.revision || 'latest',
      });
    }
  }

  @autobind
  handleSubmit(data) {
    const { nodes, params } = this.props;
    const nodeType = this.getNodeType();
    const nodeState = nodes[nodeType];
    const includedFields = Object.keys(data);
    const missingValues = nodeState.configuration.admin_fields.filter(
      fieldName => includedFields.indexOf(fieldName) === -1);
    const completeData = Object.assign({}, data);
    missingValues.forEach((fieldName) => {
      if (this.fieldRefs[fieldName] && this.fieldRefs[fieldName].getAPIValue) {
        completeData[fieldName] = this.fieldRefs[fieldName].getAPIValue();
      }
    });
    this.apiCall(completeData, { type: nodeType }).then(({ response, error }) => {
      if (error) {

      } else {
        const action = params.id ? this.props.nodeUpdated : this.props.nodeCreated;
        action(response, nodeType);
      }
    });
  }

  apiCall(...args) {
    const { params } = this.props;
    if (params.id) {
      return updateNode(params.id, ...args);
    }
    return createNode(...args);
  }

  getNodeType(props) {
    const { nodes, params, nodesRequest } = props || this.props;
    const { app, model } = params;
    return getNodeTypeFromURLComponents(nodes, app, model);
  }

  render() {
    const { nodes, params, location } = this.props;
    const nodeType = this.getNodeType();
    const nodeState = nodes[nodeType];
    const node = nodeState && nodeState.byId && nodeState.byId[params.id];
    const revision = (
      node && node.revisionsById &&
      node.revisionsById[location.query.revision || node.latestRevision]
    );

    if (params.id && !revision) return null;

    return (
      <div className='edit-node'>

        <Formsy.Form
          onValidSubmit={this.handleSubmit}
          noValidate
          styleName='styles.form'
        >

          { nodeState.configuration.admin_fields.map((fieldName) => {
            const field = nodeState.configuration.field_config[fieldName];
            return (
              <Field
                key={fieldName}
                config={field}
                value={revision && revision[fieldName]}
                wrappedComponentRef={(c) => { this.fieldRefs[fieldName] = c; }}
                imagesById={this.props.imagesById}
                orderedImages={this.props.orderedImages}
                imagesRequest={this.props.imagesRequest}
                imageUploaded={this.props.imageUploaded}
                nodes={nodes}
                nodesRequest={this.props.nodesRequest}
              />
            );
          }) }

          <div styleName='styles.node-actions'>
            <button type='submit' className='btn'>
              { params.id ? 'Update' : 'Save' }
            </button>

            <RevisionsList
              revisions={node && node.revisions}
              revisionsById={node && node.revisionsById}
              current={node && node.latestRevision}
              usersById={this.props.usersById}
            />
          </div>

        </Formsy.Form>

      </div>
    );
  }
}

const mapStateToProps = state => ({
  nodes: state.nodes,
  imagesById: state.images.byId,
  orderedImages: state.images.ordered,
  usersById: state.users.byId,
});

const nodeRequest = nodeAction.request;
const nodesRequest = nodesAction.request;
const nodeRevisionsRequest = nodeRevisionsAction.request;
const imagesRequest = imagesAction.request;

export default connect(
  mapStateToProps, {
    nodeRequest,
    nodesRequest,
    nodeRevisionsRequest,
    nodeUpdated,
    nodeCreated,
    imagesRequest,
    imageUploaded,
  })(EditNode);
