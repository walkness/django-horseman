import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Formsy from 'formsy-react';
import { autobind } from 'core-decorators';
import { FormattedMessage } from 'react-intl';
import Dropzone from 'react-dropzone';

import {
  image as imageAction,
  imageRenditions as imageRenditionsAction,
  clearImageRenditions,
  timezones as timezonesAction,
  imageUpdated,
} from '../../../../../actions';
import { updateImage, replaceImageFile } from '../../../../../services/api';

import { Input, TimezoneSelect } from '../../../components/Forms';
import { default as Img } from '../../../components/Image';

import Exposure from '../../../components/ImageDetails/Exposure';
import GPS from '../../../components/ImageDetails/GPS';
import DateTime from '../../../components/ImageDetails/DateTime';
import Row from '../../../components/ImageDetails/Row';

import styles from './styles.css';


class Image extends Component {

  static propTypes = {
    params: PropTypes.object.isRequired,
    imagesById: PropTypes.object.isRequired,
    imageRequest: PropTypes.func.isRequired,
    imageRenditionsRequest: PropTypes.func.isRequired,
    imageUpdated: PropTypes.func.isRequired,
    clearImageRenditions: PropTypes.func.isRequired,
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

            <Row label='Uploaded at'>
              <DateTime value={image.created_at} />
            </Row>

            <Exposure image={image} />

            <GPS image={image} />

            <button className='btn' styleName='submit'>Update</button>

          </aside>

        </Formsy.Form>

        <aside>
          <h2>Available renditions</h2>

          <ul>
            { renditions.map(rendition => (
              <li>
                <a href={rendition.url} target='_blank' rel='noopener noreferrer'>
                  <FormattedMessage
                    id='image.renditions.link'
                    values={{
                      width: rendition.width,
                      height: rendition.height,
                      filesize: rendition.filesize / 1000,
                    }}
                    defaultMessage='{width}x{height} ({filesize, number, noDecimals} KB)'
                  />
                </a>
              </li>
            )) }
          </ul>
        </aside>

      </div>
    );
  }
}

const mapStateToProps = state => ({
  imagesById: state.images.byId,
  timezones: state.timezones,
});

const imageRequest = imageAction.request;
const imageRenditionsRequest = imageRenditionsAction.request;
const timezonesRequest = timezonesAction.request;

export default connect(
  mapStateToProps, {
    imageRequest,
    imageRenditionsRequest,
    clearImageRenditions,
    imageUpdated,
    timezonesRequest,
  })(Image);
