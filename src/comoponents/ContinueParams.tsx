import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Code from './Code';
import CodeAsJson from './CodeAsJson';
import React from 'react';
import { ContinueState, SendDataFormat } from '../App';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import CodeTextField from './CodeTextField';

interface Props extends ContinueState {
  onInputUpdated: (dataFormat: SendDataFormat, rawJwt: string, rawData: string, tokenKey: string, tokenSecret: string) => void
}

const createHiddenFieldsFromRawData = (rawData: string) => {
  return (
    <React.Fragment>
      {
        rawData.split("\n")
          .map(line => {
            const [key, value] = line.split("=")
            return <input type="hidden" name={key} value={value} />
          })
      }
    </React.Fragment>
  )
}

export default function ContinueParams(props: Props) {
  const { dataFormat, rawJwt, rawJwtError, rawData, rawDataError, signingKey, tokenParamKey, continueUrl, onInputUpdated } = props

  const handleDataFormatChange = (
    event: React.MouseEvent<HTMLElement>,
    value: SendDataFormat
  ) => {
    onInputUpdated(
      value,
      rawJwt,
      rawData,
      signingKey,
      tokenParamKey
    )
  }

  const handleJwtChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onInputUpdated(
      dataFormat,
      event.target.value,
      rawData,
      signingKey,
      tokenParamKey
    )
  };

  const handleSigningKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onInputUpdated(
      dataFormat,
      rawJwt,
      rawData,
      event.target.value,
      tokenParamKey
    )
  };

  const handleParamKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onInputUpdated(
      dataFormat,
      rawJwt,
      rawData,
      signingKey,
      event.target.value
    )
  };

  const handleFormDataChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onInputUpdated(
      dataFormat,
      rawJwt,
      event.target.value,
      signingKey,
      tokenParamKey
    )
  }

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
          value={dataFormat}
          fullWidth
          exclusive
          onChange={handleDataFormatChange}
          aria-label="text alignment"
        >
          <ToggleButton value="none">
            <Typography variant="button" color="text.secondary">
              No Data
            </Typography>
          </ToggleButton>
          <ToggleButton value="jwt">
            <Typography variant="button" color="text.secondary">
              JWT
            </Typography>
          </ToggleButton>
          <ToggleButton value="form">
            <Typography variant="button" color="text.secondary">
              Form Data
            </Typography>
          </ToggleButton>
        </ToggleButtonGroup>
        {
          dataFormat === "none" && (
            <React.Fragment>
              <Code title="Continue URL" value={!rawJwtError ? continueUrl : "Invalid Parameters"} />
              <Button variant="contained" fullWidth onClick={handleContinueClick}>Continue</Button>
            </React.Fragment>
          )
        }
        {
          dataFormat === "jwt" && (
            <React.Fragment>
              <Typography variant="subtitle1" color="text.secondary">
                Send JWT as a query parameter.
              </Typography>
              <CodeAsJson title="JWT" value={rawJwt} error={rawJwtError} editable onChange={handleJwtChange} />
              <CodeTextField autoFocus id="dataParamKey" label="Token Parameter Name" variant="outlined" fullWidth value={tokenParamKey} onChange={handleParamKeyChange} />
              <CodeTextField id="dataSigningKey" label="Secret" variant="outlined" fullWidth value={signingKey} onChange={handleSigningKeyChange} />
              <Code title="Continue URL" value={!rawJwtError ? continueUrl : "Invalid Parameters"} />
              <Button variant="contained" fullWidth onClick={handleContinueClick}>Continue</Button>
            </React.Fragment>
          )
        }
        {
          dataFormat === "form" && (
            <React.Fragment>
              <Typography variant="subtitle1" color="text.secondary">
                Post data as Form Data
              </Typography>
              <CodeTextField
                fullWidth
                id="data"
                label="Form Data"
                name="data2"
                multiline
                onChange={handleFormDataChange}
                maxRows={10}
                value={rawData}
                error={rawDataError}
                helperText={rawDataError ? "Invalid Form Data" : undefined}
              />
              <Code title="Continue URL" value={continueUrl} />
              <Box component="form" action={continueUrl} method="POST" noValidate>
                {
                  createHiddenFieldsFromRawData(rawData)
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