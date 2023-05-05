import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Code from './Code';
import CodeAsJson from './CodeAsJson';
import React from 'react';
import { ContinueDataSubmissionMethod, ReducerAction, ReducerActionTypes, ReducerState } from '../reducer';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import CodeTextField from './CodeTextField';
import Alert from '@mui/material/Alert';

interface Props {
  reducerState: ReducerState
  dispatch: React.Dispatch<ReducerAction>
}

const createHiddenFieldsFromRawData = (rawData: string) => {
  return (
    <React.Fragment>
      {
        rawData.split("\n")
          .map((line, i) => {
            const [key, value] = line.split("=")
            return <input key={i} type="hidden" name={key} value={value} />
          })
      }
    </React.Fragment>
  )
}

export default function ContinueParams(props: Props) {
  const { reducerState, dispatch } = props

  const {
    continueDataSubmissionMethod,
    continueJsonDataStr,
    continueJsonDataValid,
    continueJsonSessionTokenParamSelected,
    continueJsonSigningSecret,
    continueFormData,
    continueFormDataValid,
    continueUrl
  } = reducerState

  const handleContinueClick = () => {
    window.location.href = continueUrl
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Stack spacing={2}>
        <Typography variant="h4" color="text.secondary" >
          Continue Parameters
        </Typography>
        <ToggleButtonGroup
          value={continueDataSubmissionMethod}
          fullWidth
          exclusive
          onChange={(_, value) => dispatch({
            type: ReducerActionTypes.UPDATE_CONTINUE_DATA_SUBMIT_METHOD,
            payload: { continueDataSubmissionMethod: value }
          })}
          aria-label="text alignment"
        >
          <ToggleButton value="NONE">
            <Typography variant="button" color="text.secondary">
              No Data
            </Typography>
          </ToggleButton>
          <ToggleButton value="JWT">
            <Typography variant="button" color="text.secondary">
              JWT
            </Typography>
          </ToggleButton>
          <ToggleButton value="FORM">
            <Typography variant="button" color="text.secondary">
              Form Data
            </Typography>
          </ToggleButton>
        </ToggleButtonGroup>
        {
          continueDataSubmissionMethod === ContinueDataSubmissionMethod.NONE && (
            <React.Fragment>
              <Alert severity="info">No data is sent</Alert>
              <Code title="Continue URL" value={continueUrl} />
              <Button variant="contained" fullWidth onClick={handleContinueClick}>Continue</Button>
            </React.Fragment>
          )
        }
        {
          continueDataSubmissionMethod === ContinueDataSubmissionMethod.JWT && (
            <React.Fragment>
              <Alert severity="info">Send data as a JSON Web Token Data via a HTTP GET request</Alert>
              <CodeAsJson title="JSON Data" value={continueJsonDataStr} error={!continueJsonDataValid} editable onChange={(e) => dispatch({
                type: ReducerActionTypes.UPDATE_CONTINUE_JSON_DATA,
                payload: { continueJsonDataStr: e.target.value }
              })} />
              <CodeTextField autoFocus id="dataParamKey" label="Token Parameter Name" variant="outlined" fullWidth
                value={continueJsonSessionTokenParamSelected} onChange={(e) => dispatch({
                  type: ReducerActionTypes.UPDATE_CONTINUE_JSON_SESSION_TOKEN_KEY,
                  payload: { continueJsonSessionTokenParamSelected: e.target.value }
                })} />
              <CodeTextField id="dataSigningKey" label="Secret" variant="outlined" fullWidth
                value={continueJsonSigningSecret} onChange={(e) => dispatch({
                  type: ReducerActionTypes.UPDATE_CONTINUE_JSON_SIGNING_SECRET,
                  payload: { continueJsonSigningSecret: e.target.value }
                })} />
              <Code title="Continue URL" value={continueJsonDataValid ? continueUrl : "Invalid Parameters"} />
              <Button variant="contained" fullWidth onClick={handleContinueClick}>Continue</Button>
            </React.Fragment>
          )
        }
        {
          continueDataSubmissionMethod === ContinueDataSubmissionMethod.FORM && (
            <React.Fragment>
              <Alert severity="info">Send data as a regular form submission via a HTTP POST request</Alert>
              <CodeTextField
                fullWidth
                id="data"
                label="Form Data"
                name="data2"
                multiline
                onChange={(e) => dispatch({
                  type: ReducerActionTypes.UPDATE_CONTINUE_FORM_DATA,
                  payload: { continueFormData: e.target.value }
                })}
                maxRows={10}
                value={continueFormData}
                error={!continueFormDataValid}
                helperText={!continueFormDataValid ? "Invalid Form Data" : undefined}
              />
              <Code title="Continue URL" value={continueUrl} />
              <Box component="form" action={continueUrl} method="POST" noValidate>
                {
                  createHiddenFieldsFromRawData(continueFormData)
                }
                <Button type="submit" variant="contained" fullWidth>Continue</Button>
              </Box>
            </React.Fragment>
          )
        }
      </Stack>
    </Box>
  )
}