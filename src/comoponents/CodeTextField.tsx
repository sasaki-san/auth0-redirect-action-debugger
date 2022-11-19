import TextField, { TextFieldProps } from '@mui/material/TextField';

export default function CodeTextField(props: TextFieldProps) {
  return (
    <TextField
      {...props}
      inputProps={{ style: { fontFamily: '"Roboto Mono"' } }}
    />
  )
}
