import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Formsy from 'formsy-react';
import { autobind } from 'core-decorators';

import {
  node as nodeAction,
  nodeUpdated,
  images as imagesAction,
  imageUploaded,
} from '../../../../../actions';
import { updateNode } from '../../../../../services/api';
import { Input } from '../../../components/Forms';
import Field from './Field';
import { getNodeTypeFromURLComponents } from '../../../../../utils';


class EditNode extends Component {

  constructor(props, context) {
    super(props, context);
    this.state = {};
    this.fieldRefs = {};
  }

  componentWillMount() {
    this.getNode();
  }

  getNode(props) {
    const { params } = props || this.props;
    const nodeType = this.getNodeType(props);
    if (nodeType) {
      this.props.nodeRequest(params.id, { type: nodeType });
    }
  }

  @autobind
  handleSubmit(data) {
    const { nodes, params } = this.props;
    const nodeType = this.getNodeType();
    const nodeState = nodes[nodeType];
    const includedFields = Object.keys(data);
    const missingValues = nodeState.configuration.admin_fields.filter(
      fieldName => includedFields.indexOf(fieldName) === -1)
    const completeData = Object.assign({}, data);
    missingValues.forEach((fieldName) => {
      if (this.fieldRefs[fieldName] && this.fieldRefs[fieldName].getAPIValue) {
        completeData[fieldName] = this.fieldRefs[fieldName].getAPIValue();
      }
    });
    updateNode(params.id, completeData, { type: nodeType }).then(({ response, error }) => {
      if (error) {

      } else {
        this.props.nodeUpdated(response, nodeType);
      }
    });
  }

  getNodeType(props) {
    const { nodes, params, nodesRequest } = props || this.props;
    const { app, model } = params;
    return getNodeTypeFromURLComponents(nodes, app, model);
  }

  render() {
    const { nodes, params } = this.props;
    const nodeType = this.getNodeType();
    const nodeState = nodes[nodeType];
    const node = nodeState && nodeState.byId && nodeState.byId[params.id];

    if (!node) return null;

    return (
      <div className='edit-node'>

        <Formsy.Form
          onValidSubmit={this.handleSubmit}
          noValidate
        >

        { nodeState.configuration.admin_fields.map((fieldName) => {
          const field = nodeState.configuration.field_config[fieldName];
          return (
            <Field
              config={field}
              value={node[fieldName]}
              fieldRef={(c) => { this.fieldRefs[fieldName] = c; }}
              imagesById={this.props.imagesById}
              orderedImages={this.props.orderedImages}
              imagesRequest={this.props.imagesRequest}
              imageUploaded={this.props.imageUploaded}
            />
          );
        }) }

        <button type='submit'>Update</button>

        </Formsy.Form>

      </div>
    );
  }
}

const mapStateToProps = state => ({
  nodes: state.nodes,
  imagesById: state.images.byId,
  orderedImages: state.images.ordered,
});

const nodeRequest = nodeAction.request;
const imagesRequest = imagesAction.request;

export default connect(
  mapStateToProps, {
    nodeRequest,
    nodeUpdated,
    imagesRequest,
    imageUploaded,
  })(EditNode);
