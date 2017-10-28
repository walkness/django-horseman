import { HOC } from 'formsy-react';

import { Select as BaseSelect } from 'react-formsy-bootstrap-components';

import InputWrapper from './InputWrapper';


export const Select = InputWrapper(BaseSelect);

export default HOC(Select);
