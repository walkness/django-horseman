import React, { Component, PropTypes } from 'react';
import { routerShape, locationShape } from 'react-router/lib/PropTypes';
import { connect } from 'react-redux';
import Formsy from 'formsy-react';
import { autobind } from 'core-decorators';
import slugify from 'slugify';
import Helmet from 'react-helmet';

import {
  nodes as nodesAction,
  node as nodeAction,
  nodeRevisions as nodeRevisionsAction,
  nodeUpdated,
  nodeCreated,
  images as imagesAction,
  imageUploaded,
} from 'actions';
import { updateNode, createNode } from 'services/api';
import { getNodeTypeFromURLComponents } from 'utils';

import Dropdown, { DropdownMenu, DropdownToggle } from 'Components/Dropdown';

import Field from './Field';

import RevisionsList from './RevisionsList';

import './styles.scss';


class EditNode extends Component {

  static propTypes = {
    params: PropTypes.object.isRequired,
    location: locationShape.isRequired,
    adminURLBase: PropTypes.string.isRequired,
  };

  static contextTypes = {
    router: routerShape.isRequired,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      changed: false,
      imageFilters: {},
      saving: false,
      error: null,
      nonFormsyFieldErrors: {},
    };
    this.fieldRefs = {};
    const nodeConfig = props.nodes[this.getNodeType()].configuration;
    this.autopopulateSources = {};
    Object.values(nodeConfig.field_config).forEach((field) => {
      if (field.autopopulate) {
        field.autopopulate.forEach((source) => {
          if (!this.autopopulateSources[source]) this.autopopulateSources[source] = [];
          this.autopopulateSources[source].push(field.name);
        });
      }
    });
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

  componentDidMount() {
    this.context.router.setRouteLeaveHook(this.props.route, this.routerWillLeave);
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
    this.setState({ saving: true }, () => {
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
          const formsyFieldErrors = Object.assign({}, error.field_errors);
          const nonFormsyFieldErrors = {};
          missingValues.forEach((fieldName) => {
            const err = error.field_errors[fieldName];
            if (err) {
              delete formsyFieldErrors[fieldName];
              nonFormsyFieldErrors[fieldName] = err;
            }
          });
          this.setState({ saving: false, error: error.non_field_errors, nonFormsyFieldErrors });
          invalidateForm(formsyFieldErrors);
        } else {
          const action = params.id ? this.props.nodeUpdated : this.props.nodeCreated;
          action(response, nodeType);
          this.setState({ saving: false, error: null, changed: false });
          if (!params.id) {
            const { adminURLBase } = this.props;
            const { app_label, model_name } = nodeState.configuration;
            this.context.router.replace(
              `${adminURLBase}${app_label}/${model_name}/${response.pk}/`, // eslint-disable-line camelcase
            );
          }
        }
      });
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
  handleFormChange(field, value) {
    const autopopulateFields = this.autopopulateSources[field];
    if (autopopulateFields) {
      const nodeConfig = this.props.nodes[this.getNodeType()].configuration;
      autopopulateFields.forEach((autoField) => {
        const fieldConfig = nodeConfig.field_config[autoField];
        if (fieldConfig.autopopulate) {
          const components = [];
          const oldComponents = [];
          const oldSlug = this.fieldRefs[autoField].props.formsy.getValue();
          fieldConfig.autopopulate.forEach((source) => {
            const oldValue = this.fieldRefs[source].props.formsy.getValue();
            oldComponents.push(oldValue);
            if (source === field) {
              components.push(value);
            } else {
              components.push(oldValue);
            }
          });
          if (!oldSlug || slugify(oldComponents.join('-')).toLowerCase() === oldSlug.toLowerCase()) {
            this.fieldRefs[autoField].props.formsy.setValue(slugify(components.join('-')).toLowerCase());
          }
        }
      });
    }
    if (!this.state.changed) {
      this.setState({ changed: true });
    }
  }

  @autobind
  handleImageFiltersChange(newFilters) {
    const imageFilters = Object.assign({}, this.state.imageFilters, newFilters);
    this.setState({ imageFilters });
  }

  @autobind
  routerWillLeave() {
    if (this.state.changed) return 'You have unsaved changes. Are you sure you want to leave?';
    return null;
  }

  render() {
    const { changed, saving } = this.state;
    const { nodes, params, location } = this.props;
    const nodeType = this.getNodeType();
    const nodeState = nodes[nodeType];
    const node = nodeState && nodeState.byId && nodeState.byId[params.id];
    const revision = (
      node && node.revisionsById &&
      node.revisionsById[location.query.revision || node.latest_revision]
    );
    const currentRevision = location.query.revision || (node && node.latest_revision);

    const form = !(params.id && !(revision && revision.pk)) && (
      <Formsy.Form
        onValidSubmit={this.handleSubmit}
        onChange={this.handleFormChange}
        noValidate
        styleName='form'
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
              onChange={(value) => this.handleFormChange(fieldName, value)}
              imageFilters={this.state.imageFilters}
              handleImageFiltersChange={this.handleImageFiltersChange}
              nonFormsyFieldErrors={this.state.nonFormsyFieldErrors}
            />
          );
        }) }

        <div styleName='node-actions'>
          <div styleName='left'>
            <div styleName='action-buttons'>
              <button
                type='submit'
                className='btn'
                disabled={!changed || saving}
                styleName='primary-action'
              >
                Save draft
              </button>
              <Dropdown>
                <DropdownToggle>▲</DropdownToggle>
                <DropdownMenu styleName='extra-actions-menu' up>
                  { node ?
                    <li>
                      <button
                        type='button'
                        className='btn'
                        onClick={this.handleDelete}
                        disabled={saving}
                      >
                        Delete permanently
                      </button>
                    </li>
                  : null }
                  { node && node.published ?
                    <li>
                      <button
                        type='button'
                        className='btn'
                        onClick={this.handleUnpublish}
                        disabled={saving}
                      >
                        Unpublish
                      </button>
                    </li>
                  : null }
                  <li>
                    <button
                      type='button'
                      className='btn'
                      onClick={this.handlePublish}
                      disabled={!((!(node && node.published) || changed) && !saving)}
                    >
                      Save and publish
                    </button>
                  </li>
                </DropdownMenu>
              </Dropdown>

            </div>

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
            saving={saving}
          />
        </div>

      </Formsy.Form>
    );

    return (
      <div className='edit-node'>

        <Helmet title={`${params.id ? 'Edit' : 'New'} ${nodeState.configuration.name}`} />

        { form || 'Loading…' }

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
  adminURLBase: state.config.adminURLBase,
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
