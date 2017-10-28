import { HOC } from 'formsy-react';

import { Input as BaseInput } from 'react-formsy-bootstrap-components';

import InputWrapper from './InputWrapper';


export const Input = InputWrapper(BaseInput);

export default HOC(Input);
