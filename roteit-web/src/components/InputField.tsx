import React, { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { useField } from 'formik';
import { FormControl, FormErrorMessage, FormLabel, Input, Textarea } from '@chakra-ui/react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
  type?: 'textarea' | 'inputbox' | 'password' | 'email';
}

const InputField: React.FC<Props> = ({ label, size, type='inputbox', ...props }) => {
  const [field, { error }] = useField(props);
  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name}>{label}</FormLabel>
      {
        type === 'textarea' ?
          (<Textarea
            {...field}
            {...props as TextareaHTMLAttributes<HTMLTextAreaElement>}
            id={field.name}
            placeholder={props.placeholder}
            borderColor="sandybrown"
            focusBorderColor="sandybrown"
            _hover={{ border: '2px solid darkbrown' }}
          />) :
          (<Input
            {...field}
            {...props}
            id={field.name}
            type={type}
            placeholder={props.placeholder}
            borderColor="sandybrown"
            focusBorderColor="darkbrown"
            _hover={{ border: '2px solid darkbrown' }}
          />
        )
      }
      {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
    </FormControl>
  );
};

export default InputField;
