import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Code from './Code';
import CodeAsJson from './CodeAsJson';

import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import Alert from '@mui/material/Alert';
import { RedirectState } from '../App';
import CodeTextField from './CodeTextField';

interface Props extends RedirectState {
  state: string | null
  queryParams: string[]
  onInputUpdated: (tokenKey: string, tokenSecret: string) => void
}

export default function RedirectParams(props: Props) {
  const { state, queryParams, tokenKey, tokenSecret, token, tokenSecretError, onInputUpdated } = props

  const handleTokenKeyChange = (event: SelectChangeEvent) => {
    onInputUpdated(
      event.target.value,
      tokenSecret
    )
  };

  const handleTokenSecretChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onInputUpdated(
      tokenKey,
      event.target.value
    )
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stack spacing={2}>
        <Typography variant="h4" color="text.secondary" >
          Redirect Parameters
        </Typography>
        <Code title="State" value={state !== null ? state : "INVALID STATE"} />
        <FormControl fullWidth>
          <InputLabel>
            Token Parameter Name
          </InputLabel>
          <Select
            value={tokenKey}
            onChange={handleTokenKeyChange}
            inputProps={{ 'aria-label': 'Without label' }}
          >
            {queryParams.map(q => <MenuItem key={q} value={q}>{q}</MenuItem>)}
          </Select>
        </FormControl>
        <CodeAsJson title="Token" value={token ? JSON.stringify(token, null, 2) : "Error"} />
        <CodeTextField id="tokenSecret" label="Secret" variant="outlined" value={tokenSecret} onChange={handleTokenSecretChange} fullWidth />
        {
          tokenSecretError ? <Alert severity="error">INVALID SECRET</Alert> : <Alert severity="success">SECRET IS VALID</Alert>
        }
      </Stack>
    </Box>
  )
}