import React, { Component, PropTypes } from 'react';

import { ModalBody } from 'Components/Modal';

import Nav from './Nav';
import URL from './URL';
import Node from './Node';

import styles from './styles.css';


const MODES = {
  URL: 'URL',
  NODE: 'NODE',
};


export default class LinkModalBody extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      mode: MODES.URL,
    };
  }

  render() {
    const { mode } = this.state;
    return (
      <ModalBody className={styles.body}>

        <div styleName='body-inner'>

          <Nav
            modes={[
              { label: 'URL', mode: MODES.URL },
              { label: 'Node', mode: MODES.NODE },
            ]}
            activeMode={mode}
            changeMode={newMode => this.setState({ mode: newMode })}
          />

          { mode === MODES.URL ?
            <URL {...this.props} />
          : null }

          { mode === MODES.NODE ?
            <Node {...this.props} />
          : null }

        </div>

      </ModalBody>
    );
  }
}
