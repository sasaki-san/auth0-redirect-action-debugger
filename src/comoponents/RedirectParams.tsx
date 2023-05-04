import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Code from './Code';
import CodeAsJson from './CodeAsJson';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Alert from '@mui/material/Alert';
import CodeTextField from './CodeTextField';
import { ReducerAction, ReducerActionTypes, ReducerState } from '../reducer';

interface Props {
  reducerState: ReducerState
  dispatch: React.Dispatch<ReducerAction>
}

export default function RedirectParams(props: Props) {
  const { reducerState, dispatch } = props

  const {
    redirectStateParam,
    redirectSessionTokenParamCandidates,
    redirectSessionTokenParamSelected,
    redirectSessionTokenJson,
    redirectSigningSecret,
    redirectSigningSecretMatches
  } = reducerState

  return (
    <Box sx={{ width: '100%' }}>
      <Stack spacing={2}>
        <Typography variant="h4" color="text.secondary" >
          Redirect Parameters
        </Typography>
        <Code title="State" value={redirectStateParam || "INVALID STATE"} />
        <FormControl fullWidth>
          <InputLabel>
            Token Parameter Name
          </InputLabel>
          <Select
            value={redirectSessionTokenParamSelected}
            onChange={(e) => dispatch({
              type: ReducerActionTypes.UPDATE_REDIRECT_SESSION_TOKEN_KEY,
              payload: {
                redirectSessionTokenParamSelected: e.target.value
              }
            })}
            inputProps={{ 'aria-label': 'Without label' }}
          >
            {redirectSessionTokenParamCandidates.map(q => <MenuItem key={q} value={q}>{q}</MenuItem>)}
          </Select>
        </FormControl>
        <CodeAsJson title="Token"
          value={redirectSessionTokenJson ?
            JSON.stringify(redirectSessionTokenJson, null, 2) : "Error"}
        />
        <CodeTextField id="tokenSecret" label="Signature Secret" variant="outlined"
          value={redirectSigningSecret} onChange={(e) => dispatch({
            type: ReducerActionTypes.UPDATE_REDIRECT_SIGNING_SECRET,
            payload: { redirectSigningSecret: e.target.value }
          })} fullWidth />
        {
          redirectSigningSecretMatches ? <Alert severity="success">SECRET IS VALID</Alert> : <Alert severity="error">INVALID SECRET</Alert>
        }
      </Stack>
    </Box>
  )
}