import React, { PropTypes } from 'react';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import titleCase from 'title-case';

import Row from './Row';


const items = [
  { category: 'camera', label: 'Camera', valueKey: 'model' },
  { category: 'camera', label: 'Lens', valueKey: 'lens' },
  { category: 'exposure', label: 'Lens', valueKey: 'lens' },
];


const Exposure = ({ image }) => {
  if (!(image && image.meta && (image.meta.exposure || image.meta.camera))) return null;

  const { camera, exposure } = image.meta;

  const lensFocalRange = (camera && camera.lens_focal_range) || [null, null];
  const lensApertureRange = (camera && camera.lens_aperture) || [null, null];

  return (
    <div>

      <h3>Exposure Details</h3>

      { camera && camera.model ?
        <Row label='Camera'>
          {camera.model && titleCase(camera.model)}
        </Row>
      : null }

      { camera && camera.lens ?
        <Row label='Lens'>
          <FormattedMessage
            id='lens'
            values={{
              isZoom: lensFocalRange[0] === lensFocalRange[1] ? 'no' : 'yes',
              focalRange: (
                <FormattedMessage
                  id='lens.aperture'
                  values={{
                    isZoom: lensFocalRange[0] === lensFocalRange[1] ? 'no' : 'yes',
                    focalRangeStart: lensFocalRange[0],
                    focalRangeEnd: lensFocalRange[1],
                  }}
                  defaultMessage='{isZoom, select,
                    yes {{focalRangeStart, number, focalLength}–{focalRangeEnd, number, focalLength}mm}
                    no {{focalRangeStart, number, focalLength}mm}
                  }'
                />
              ),
              aperture: (
                <FormattedMessage
                  id='lens.aperture'
                  values={{
                    isConstant: lensApertureRange[0] === lensApertureRange[1] ? 'yes' : 'no',
                    minAperture: lensApertureRange[1],
                    maxAperture: lensApertureRange[0],
                  }}
                  defaultMessage='{isConstant, select,
                    yes {ƒ/{maxAperture, number, fstop}}
                    no {ƒ/{maxAperture, number, fstop}–{minAperture, number, fstop}}
                  }'
                />
              ),
              focalLength: exposure && exposure.focal_length,
            }}
            defaultMessage='{isZoom, select,
               yes {{focalRange} {aperture} at {focalLength, number, focalLength}mm}
               no {{focalRange} {aperture}}
            }'
          />
        </Row>
      : null }

      { exposure ?
        <Row label='Exposure'>
          <FormattedMessage
            id='exposure'
            values={{
              shutter: <span>{ exposure.shutter }</span>,
              fstop: <FormattedNumber value={exposure.fstop} format='fstop' />,
              iso: <FormattedNumber value={exposure.iso} format='iso' />,
            }}
            defaultMessage='{shutter}sec at ƒ/{fstop}, ISO {iso}'
          />
        </Row>
      : null }

    </div>
  );
};

export default Exposure;
