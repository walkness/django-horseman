import React, { PropTypes } from 'react';
import GoogleMap from 'google-map-react';
import { FormattedMessage } from 'react-intl';

import Row from './Row';

import styles from './styles.css';


const Marker = () => (
  <div styleName='marker'>▼</div>
);


const Coordinate = ({ value, lng }) => {
  const degrees = Math.floor(value);
  const totalMinutes = (value - degrees) * 60;
  const minutes = Math.floor(totalMinutes);
  const seconds = Math.round((totalMinutes - minutes) * 60);
  return (
    <FormattedMessage
      id='coordinate'
      values={{
        degrees: Math.abs(degrees),
        minutes,
        seconds,
        direction: value < 0 ? (lng ? 'W' : 'S') : (lng ? 'E' : 'N'),
      }}
      defaultMessage='{degrees, number, noDecimals}º{minutes, number, noDecimals}\u2032{seconds, number, noDecimals}\u2033{direction}'
    />
  );
};


const GPS = ({ image }) => {
  const { gps } = image.meta;
  if (!gps) return null;
  const { lat, lng, altitude } = gps;
  return (
    <div>

      <h3>GPS data</h3>

      { lat && lng ?
        <Row label='Coordinates'>

          <FormattedMessage
            id='image.gps.coordinates'
            values={{
              lat: <Coordinate value={lat} />,
              lng: <Coordinate value={lng} lng />,
            }}
            defaultMessage='{lat} {lng}'
          />

          <div styleName='map-wrapper'>
            <GoogleMap
              center={{ lat, lng }}
              defaultZoom={7}
              bootstrapURLKeys={{
                key: 'AIzaSyBMO_gfiOysd9HTtcFp8E1t_jfxFhlV48g',
              }}
              options={{
                mapTypeId: 'hybrid',
              }}
            >
              <Marker
                lat={lat}
                lng={lng}
              />
            </GoogleMap>
          </div>
        </Row>
      : null }

      { altitude ?
        <Row label='Altitude'>
          <FormattedMessage
            id='image.gps.altitude'
            values={{ altitude }}
            defaultMessage='{altitude, number, noDecimals}m'
          />
        </Row>
      : null }

    </div>
  );
};

export default GPS;
