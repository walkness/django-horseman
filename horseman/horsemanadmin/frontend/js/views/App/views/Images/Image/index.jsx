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

import { Input, Select } from '../../../components/Forms';
import { default as Img } from '../../../components/Image';


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
      <div>

        <Formsy.Form
          onValidSubmit={this.handleSubmit}
          noValidate
        >

          <Input
            name='title'
            value={image.title}
            label='Title'
            required
          />

          <Select
            name='captured_at_tz'
            value={image.captured_at_tz}
            options={[
              { value: null, label: 'None' },
              ...this.props.timezones.map(timezone => ({
                value: timezone,
                label: timezone.replace(/_/g, ' ').replace(/\//g, ' / '),
              })),
            ]}
            label='Timezone'
          />

          <div>
            <Img
              image={image}
              srcSize='thumbnail_300'
            />
          </div>

          <button>Update</button>

        </Formsy.Form>

      </div>
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
