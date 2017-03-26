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

import Dropdown, { DropdownMenu, DropdownToggle } from '../../../components/Dropdown';

import RevisionsList from './RevisionsList';

import styles from './styles.css';


class EditNode extends Component {

  static propTypes = {
    params: PropTypes.object.isRequired,
    location: locationShape.isRequired,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      changed: false,
      imageFilters: {},
    };
    this.fieldRefs = {};
  }

  componentWillMount() {
    if (this.props.params.id) {
      this.getNode();
    }
    const { params } = this.props;
    const nodeType = this.getNodeType();
    if (params.id && nodeType) {
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
    if (nodeType && params.id) {
      this.props.nodeRequest(params.id, {
        type: nodeType,
        revision: location.query.revision || 'latest',
      });
    }
  }

  @autobind
  handlePublish() {
    const data = this.form.getModel();
    this.handleSubmit(data, this.form.reset, this.form.updateInputsWithErrors, { publish: true });
  }

  @autobind
  handleUnpublish() {
    const data = this.form.getModel();
    this.handleSubmit(data, this.form.reset, this.form.updateInputsWithErrors, { unpublish: true });
  }

  @autobind
  handleSubmit(data, resetForm, invalidateForm, query) {
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
    this.apiCall(
      completeData,
      Object.assign({}, { type: nodeType }, query),
    ).then(({ response, error }) => {
      if (error) {

      } else {
        const action = params.id ? this.props.nodeUpdated : this.props.nodeCreated;
        action(response, nodeType);
      }
    });
  }

  @autobind
  handleDelete() {

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

  @autobind
  handleFormChange() {
    if (!this.state.changed) {
      this.setState({ changed: true });
    }
  }

  @autobind
  handleImageFiltersChange(newFilters) {
    const imageFilters = Object.assign({}, this.state.imageFilters, newFilters);
    this.setState({ imageFilters });
  }

  render() {
    const { changed } = this.state;
    const { nodes, params, location } = this.props;
    const nodeType = this.getNodeType();
    const nodeState = nodes[nodeType];
    const node = nodeState && nodeState.byId && nodeState.byId[params.id];
    const revision = (
      node && node.revisionsById &&
      node.revisionsById[location.query.revision || node.latest_revision]
    );
    const currentRevision = location.query.revision || (node && node.latest_revision);

    if (params.id && !(revision && revision.pk)) return null;

    return (
      <div className='edit-node'>

        <Formsy.Form
          onValidSubmit={this.handleSubmit}
          onChange={this.handleFormChange}
          noValidate
          styleName='styles.form'
          ref={(c) => { this.form = c; }}
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
                onChange={this.handleFormChange}
                imageFilters={this.state.imageFilters}
                handleImageFiltersChange={this.handleImageFiltersChange}
              />
            );
          }) }

          <div styleName='styles.node-actions'>
            <div styleName='styles.action-buttons'>
              <button
                type='submit'
                className='btn'
                disabled={!this.state.changed}
                styleName='styles.primary-action'
              >
                Save draft
              </button>
              <Dropdown>
                <DropdownToggle>▲</DropdownToggle>
                <DropdownMenu styleName='extra-actions-menu' up>
                  { node ?
                    <li><button type='button' className='btn' onClick={this.handleDelete}>
                      Delete permanently
                    </button></li>
                  : null }
                  { node && node.published ?
                    <li><button type='button' className='btn' onClick={this.handleUnpublish}>
                      Unpublish
                    </button></li>
                  : null }
                  <li><button type='button' className='btn' onClick={this.handlePublish}>
                    Save and publish
                  </button></li>
                </DropdownMenu>
              </Dropdown>

              <a
                href={`${this.props.previewSiteURL}/?preview=${currentRevision}`}
                target='_blank'
              >
                Preview
              </a>
            </div>

            <RevisionsList
              revisions={node && node.revisions}
              revisionsById={node && node.revisionsById}
              current={currentRevision}
              latest={node && node.latest_revision}
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
  previewSiteURL: state.config.previewSiteURL,
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
