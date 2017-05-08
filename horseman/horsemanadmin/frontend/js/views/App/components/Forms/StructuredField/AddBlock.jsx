import React, { PropTypes } from 'react';

import './styles.scss';


const AddBlock = ({ blocks, onClick }) => (
  <div styleName='add-block'>

    { (blocks || []).map(({ type, verbose_name }) => (
      <button key={type} type='button' className='btn' onClick={() => onClick(type)}>
        { verbose_name }
      </button>
    )) }

  </div>
);

export default AddBlock;
