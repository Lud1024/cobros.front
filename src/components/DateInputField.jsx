import TextField from '@mui/material/TextField';
import { normalizeDateInput } from '../utils/formatters';

const DateInputField = ({ field, form, helperText, ...props }) => {
  const hasError = Boolean(form.touched[field.name] && form.errors[field.name]);
  const resolvedHelperText = hasError ? form.errors[field.name] : helperText;

  const handleChange = (event) => {
    const value = event.target.value;
    form.setFieldValue(field.name, normalizeDateInput(value) || value);
  };

  const handleBlur = (event) => {
    const normalized = normalizeDateInput(event.target.value);
    if (normalized) {
      form.setFieldValue(field.name, normalized);
    }
    form.setFieldTouched(field.name, true, true);
  };

  return (
    <TextField
      {...field}
      {...props}
      type="text"
      placeholder={props.placeholder || 'AAAA-MM-DD o DD/MM/AAAA'}
      value={field.value || ''}
      onChange={handleChange}
      onBlur={handleBlur}
      error={hasError}
      helperText={resolvedHelperText}
      inputProps={{
        inputMode: 'numeric',
        ...props.inputProps,
      }}
    />
  );
};

export default DateInputField;
