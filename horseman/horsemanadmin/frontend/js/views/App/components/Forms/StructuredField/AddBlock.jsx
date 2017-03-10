import React, { PropTypes } from 'react';


const AddBlock = ({ blocks, onClick }) => (
  <div className='add-block'>

    { (blocks || []).map(({ type, verbose_name }) => (
      <button key={type} type='button' className='btn' onClick={() => onClick(type)}>
        { verbose_name }
      </button>
    )) }

  </div>
);

export default AddBlock;
