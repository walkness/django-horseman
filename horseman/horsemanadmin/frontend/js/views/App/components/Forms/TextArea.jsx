import { withFormsy } from 'formsy-react';

import { TextArea as BaseTextArea } from 'react-formsy-bootstrap-components';

import InputWrapper from './InputWrapper';


export const TextArea = InputWrapper(BaseTextArea);

export default withFormsy(TextArea);
