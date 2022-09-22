import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Code from './Code';
import CodeAsJson from './CodeAsJson';
import React from 'react';
import { ContinueState } from '../App';

interface Props extends ContinueState {
  onInputUpdated: (sendData: boolean, rawData: string, tokenKey: string, tokenSecret: string) => void
}

export default function ContinueParams(props: Props) {
  const { sendData, rawData, rawDataError, signingKey, tokenParamKey, continueUrl, onInputUpdated } = props

  const handleSendDataChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onInputUpdated(
      event.target.checked,
      rawData,
      signingKey,
      tokenParamKey
    )
  }

  const handleDataChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onInputUpdated(
      sendData,
      event.target.value,
      signingKey,
      tokenParamKey
    )
  };

  const handleSigningKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onInputUpdated(
      sendData,
      rawData,
      event.target.value,
      tokenParamKey
    )
  };

  const handleParamKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onInputUpdated(
      sendData,
      rawData,
      signingKey,
      event.target.value
    )
  };

  const handleContinueClick = () => {
    window.location.href = continueUrl
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Stack spacing={2}>
        <Typography variant="h4" color="text.secondary" gutterBottom>
          Continue Parameters
        </Typography>
        <FormGroup>
          <FormControlLabel control={<Checkbox checked={sendData} onChange={handleSendDataChange} />} label="Send Data to Continue Endpoint" />
        </FormGroup>
        {
          sendData && (
            <React.Fragment>
              <CodeAsJson title="Data to Send" value={rawData} error={rawDataError} editable onChange={handleDataChange} />
              <TextField id="dataParamKey" label="Token Parameter Name" variant="outlined" fullWidth value={tokenParamKey} onChange={handleParamKeyChange} />
              <TextField id="dataSigningKey" label="Secret" variant="outlined" fullWidth value={signingKey} onChange={handleSigningKeyChange} />
            </React.Fragment>
          )
        }
        <Code title="Continue URL" value={!rawDataError ? continueUrl : "Invalid Parameters"} />
        <Button variant="contained" fullWidth onClick={handleContinueClick}>Continue</Button>
      </Stack>
    </Box>
  )
}