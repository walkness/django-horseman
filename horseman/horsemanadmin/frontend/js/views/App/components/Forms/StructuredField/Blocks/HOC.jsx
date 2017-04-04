import React, { Component, PropTypes } from 'react';

import CloseButton from '../../../CloseButton';

import AddBlock from '../AddBlock';

import styles from './styles.css';


const BlockWrapper = ({ children, index, deleteBlock, blocks, onAddClick, onMoveUp, onMoveDown }) => (
  <div className='block' styleName='styles.block'>

    <div styleName='styles.add-block'>
      <AddBlock blocks={blocks} onClick={onAddClick} />
    </div>

    <div styleName='styles.block-actions'>
      <button onClick={onMoveUp} type='button'>▲</button>
      <button onClick={onMoveDown} type='button'>▼</button>
      <CloseButton onClick={() => deleteBlock(index)} title='Delete' />
    </div>

    { children }

  </div>
);

BlockWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  index: PropTypes.number.isRequired,
  deleteBlock: PropTypes.func.isRequired,
  blocks: PropTypes.array.isRequired,
  onAddClick: PropTypes.func.isRequired,
  onMoveUp: PropTypes.func.isRequired,
  onMoveDown: PropTypes.func.isRequired,
};


export function Block(WrappedComponent) {
  return class extends Component {

    static propTypes = {
      index: PropTypes.number.isRequired,
      deleteBlock: PropTypes.func.isRequired,
      blocks: PropTypes.array.isRequired,
      onAddBeforeClick: PropTypes.func.isRequired,
      onMoveUp: PropTypes.func.isRequired,
      onMoveDown: PropTypes.func.isRequired,
    };

    getAPIValue() {
      return this.wrappedComponent.getAPIValue();
    }

    render() {
      const { blocks, ...props } = this.props;
      return (
        <BlockWrapper
          index={this.props.index}
          deleteBlock={this.props.deleteBlock}
          blocks={blocks}
          onAddClick={this.props.onAddBeforeClick}
          onMoveUp={this.props.onMoveUp}
          onMoveDown={this.props.onMoveDown}
        >
          <WrappedComponent
            ref={(c) => { this.wrappedComponent = c; }}
            {...props}
          />
        </BlockWrapper>
      );
    }
  };
}

export default Block;
