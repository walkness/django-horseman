import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Formsy from 'formsy-react';
import { autobind } from 'core-decorators';

import {
  image as imageAction,
  timezones as timezonesAction,
  imageUpdated,
} from '../../../../../actions';
import { updateImage } from '../../../../../services/api';

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
    imageUpdated: PropTypes.func.isRequired,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      submitting: false,
    };
  }

  componentWillMount() {
    this.props.imageRequest(this.props.params.id);
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

  render() {
    const image = this.props.imagesById[this.props.params.id];

    if (!image) return null;

    return (
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

          <div styleName='image'>
            <Img image={image} />
          </div>

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
    );
  }
}

const mapStateToProps = state => ({
  imagesById: state.images.byId,
  timezones: state.timezones,
});

const imageRequest = imageAction.request;
const timezonesRequest = timezonesAction.request;

export default connect(
  mapStateToProps, {
    imageRequest,
    imageUpdated,
    timezonesRequest,
  })(Image);
