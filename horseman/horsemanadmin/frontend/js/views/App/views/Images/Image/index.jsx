import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Formsy from 'formsy-react';
import { autobind } from 'core-decorators';
import { FormattedMessage } from 'react-intl';
import Dropzone from 'react-dropzone';
import titleCase from 'title-case';
import Helmet from 'react-helmet';

import {
  image as imageAction,
  imageRenditions as imageRenditionsAction,
  imageUsage as imageUsageAction,
  clearImageRenditions,
  timezones as timezonesAction,
  imageUpdated,
} from '../../../../../actions';
import { updateImage, replaceImageFile } from '../../../../../services/api';

import { Input, TimezoneSelect } from '../../../components/Forms';
import { default as Img } from '../../../components/Image';

import FileDetails from '../../../components/ImageDetails/File';
import Exposure from '../../../components/ImageDetails/Exposure';
import GPS from '../../../components/ImageDetails/GPS';
import DateTime from '../../../components/ImageDetails/DateTime';
import Row from '../../../components/ImageDetails/Row';
import Filesize from '../../../components/Filesize';

import styles from './styles.css';


class Image extends Component {

  static propTypes = {
    params: PropTypes.object.isRequired,
    imagesById: PropTypes.object.isRequired,
    imageRequest: PropTypes.func.isRequired,
    imageRenditionsRequest: PropTypes.func.isRequired,
    imageUsageRequest: PropTypes.func.isRequired,
    imageUpdated: PropTypes.func.isRequired,
    clearImageRenditions: PropTypes.func.isRequired,
    nodesByType: PropTypes.object.isRequired,
    adminURLBase: PropTypes.string.isRequired,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      submitting: false,
      progress: null,
    };
  }

  componentWillMount() {
    this.props.imageRequest(this.props.params.id);
    this.props.imageRenditionsRequest(this.props.params.id);
    this.props.imageUsageRequest(this.props.params.id);
    if (this.props.timezones.length === 0) {
      this.props.timezonesRequest();
    }
  }

  @autobind
  handleSubmit(data) {
    this.setState({ submitting: true }, () => {
      updateImage(this.props.params.id, data).then(({ response, error }) => {
        if (error) {

        } else {
          this.setState({ submitting: false });
          this.props.imageUpdated(response);
        }
      });
    });
  }

  @autobind
  handleReplaceImage(files) {
    const newFile = files[0];
    this.setState({ submitting: true }, () => {
      replaceImageFile(this.props.params.id, newFile, ({ error, response }) => {
        if (error) {

        } else {
          this.setState({ submitting: false });
          this.props.clearImageRenditions(response.pk);
          this.props.imageUpdated(response);
          this.props.imageRenditionsRequest(response.pk);
        }
      }, (progress) => {
        if (progress.lengthComputable) {
          if (progress.lengthComputable) {
            this.setState({ progress: progress.loaded / progress.total });
          }
        }
      });
    });
  }

  render() {
    const image = this.props.imagesById[this.props.params.id];

    if (!(image && image.pk)) return null;

    const { nodesByType, adminURLBase } = this.props;

    const renditions = [];
    Object.values(image.renditions).forEach((rendition) => {
      if (!renditions.some(curr => (
        (curr.pk && curr.pk === rendition.pk) ||
        (curr.width === rendition.width && curr.height === rendition.height)
      ))) {
        renditions.push(rendition);
      }
    });

    return (
      <div>
        <Formsy.Form
          onValidSubmit={this.handleSubmit}
          noValidate
          styleName='root'
        >

          <Helmet title='Edit image' />

          <main styleName='main'>

            <Input
              name='title'
              value={image.title}
              label='Title'
              required
              heading
            />

            <Dropzone
              className='dropzone'
              onDrop={this.handleReplaceImage}
              multiple={false}
              accept='image/*'
            >
              <div styleName='image'>
                <Img image={image} />
              </div>
            </Dropzone>

          </main>

          <aside styleName='sidebar'>

            { image.captured_at ?
              <Row label='Captured at'>
                <DateTime
                  value={image.captured_at}
                  timezone={image.captured_at_tz}
                  defaultTimezone='UTC'
                  displayTimezone={!!image.captured_at_tz}
                />

                <TimezoneSelect
                  name='captured_at_tz'
                  value={image.captured_at_tz}
                  timezones={this.props.timezones}
                />
              </Row>
            : null }

            <Row label='Uploaded at'>
              <DateTime value={image.created_at} />
            </Row>

            <FileDetails image={image} />

            <Exposure image={image} />

            <GPS image={image} />

            <button className='btn btn-primary' styleName='submit'>Update</button>

          </aside>

        </Formsy.Form>

        <div styleName='meta'>

          <aside styleName='renditions'>
            <h2>Available renditions</h2>

            <ul>
              { renditions.map(rendition => (
                <li>
                  <a href={rendition.url} target='_blank' rel='noopener noreferrer'>
                    <div styleName='rendition-preview'>
                      <svg
                        width={rendition.target.width}
                        height={rendition.target.height}
                        viewBox={`0 0 ${rendition.target.width} ${rendition.target.height}`}
                      >
                        <rect id='target' x={0} y={0} width={rendition.target.width} height={rendition.target.height} />
                        <rect
                          id='image'
                          x={(rendition.target.width - rendition.width) / 2}
                          y={(rendition.target.height - rendition.height) / 2}
                          width={rendition.width}
                          height={rendition.height}
                        />
                      </svg>
                    </div>
                    <FormattedMessage
                      id='image.renditions.link'
                      values={{
                        width: rendition.width,
                        height: rendition.height,
                        filesize: <Filesize size={rendition.filesize} showDecimals={false} />,
                      }}
                      defaultMessage='{width} × {height} ({filesize})'
                    />
                  </a>
                </li>
              )) }
            </ul>
          </aside>

          <aside styleName='usage'>
            <h2>Used in</h2>

            { image && image.usage && !Object.keys(image.usage).length ?
              <p>No nodes found</p>
            : null }

            <ul>

              { Object.keys((image && image.usage) || {}).map((nodeType) => {
                const nodeIds = image.usage[nodeType];
                const nodeRoot = nodesByType[nodeType];
                const nodeConfig = nodeRoot && nodeRoot.configuration;
                if (!nodeConfig) return null;
                const nodeAdminBase = `${adminURLBase}${nodeConfig.app_label}/${nodeConfig.model_name}/`;
                return (
                  <li>
                    <h3><Link to={nodeAdminBase}>{ titleCase(nodeConfig.name_plural) }</Link></h3>
                    <ul>
                      { nodeIds.map((id) => {
                        const node = nodeRoot.byId && nodeRoot.byId[id];
                        return (
                          <li>
                            <Link to={`${nodeAdminBase}${id}/`}>
                              { node.title }
                            </Link>
                          </li>
                        );
                      }) }
                    </ul>
                  </li>
                );
              }) }
            </ul>
          </aside>

        </div>

      </div>
    );
  }
}

const mapStateToProps = state => ({
  imagesById: state.images.byId,
  nodesByType: state.nodes,
  timezones: state.timezones,
  adminURLBase: state.config.adminURLBase,
});

const imageRequest = imageAction.request;
const imageRenditionsRequest = imageRenditionsAction.request;
const imageUsageRequest = imageUsageAction.request;
const timezonesRequest = timezonesAction.request;

export default connect(
  mapStateToProps, {
    imageRequest,
    imageRenditionsRequest,
    imageUsageRequest,
    clearImageRenditions,
    imageUpdated,
    timezonesRequest,
  })(Image);
