import { decodeToken } from "react-jwt"
import { KJUR } from "jsrsasign"

export interface JwtStandardClaims {
  sub: string
  iat: number
  exp: number
  iss: string
}

export interface Jwt extends JwtStandardClaims {
  [key: string]: any
}

export type SendDataFormat = 'none' | 'jwt' | 'form'

export enum Page {
  Main = 0,
  Authorize = 1
}

export enum ReducerActionTypes {
  UPDATE_REDIRECT_SESSION_TOKEN_KEY = "UPDATE_REDIRECT_SESSION_TOKEN_KEY",
  UPDATE_REDIRECT_SIGNING_SECRET = "UPDATE_REDIRECT_SIGNING_SECRET",
  UPDATE_CONTINUE_DATA_SUBMIT_METHOD = "UPDATE_CONTINUE_DATA_SUBMIT_METHOD",
  UPDATE_CONTINUE_JSON_DATA = "UPDATE_CONTINUE_JSON_DATA",
  UPDATE_CONTINUE_JSON_SESSION_TOKEN_KEY = "UPDATE_CONTINUE_JSON_SESSION_TOKEN_KEY",
  UPDATE_CONTINUE_JSON_SIGNING_SECRET = "UPDATE_CONTINUE_JSON_SIGNING_SECRET",
  UPDATE_CONTINUE_FORM_DATA = "UPDATE_CONTINUE_FORM_DATA",
}

export enum ContinueDataSubmissionMethod {
  NONE = "NONE", JWT = "JWT", FORM = "FORM"
}

export interface ReducerState {
  searchParam: URLSearchParams

  redirectStateParam: string
  redirectSessionTokenParamCandidates: string[],
  redirectSessionTokenParamSelected: string,
  redirectSessionTokenStr: string
  redirectSessionTokenJson?: Jwt
  redirectSigningSecret: string
  redirectSigningSecretMatches: boolean

  continueDataSubmissionMethod: ContinueDataSubmissionMethod
  continueJsonDataStr: string
  continueJsonDataJson: Jwt | undefined
  continueJsonDataValid: boolean
  continueJsonSessionTokenParamSelected: string
  continueJsonSigningSecret: string
  continueFormData: string
  continueFormDataValid: boolean
  continueUrl: string
}

export interface ReducerAction {
  type: ReducerActionTypes
  payload: Partial<ReducerState>
}


const testSecret = (tokenPart: string | null, tokenSecret: string | null) => {
  let value = false
  if (tokenPart && tokenSecret) {
    try {
      value = KJUR.jws.JWS.verifyJWT(tokenPart, tokenSecret, { alg: ['HS256'] });
    } catch { }
  }
  return value
}

const getTokenValue = (tokenPart: string | null) => {
  let value: Jwt | undefined = undefined
  if (tokenPart) {
    try {
      value = decodeToken(tokenPart) as Jwt;
    } catch { }
  }
  return value
}

const getInitialRawData = (stateParam: string, originalToken?: JwtStandardClaims) => {
  const value = {
    sub: originalToken ? originalToken.sub : "TOKEN IS NULL",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
    state: stateParam
  } as Pick<Jwt, "sub" | "iat" | "exp">
  return JSON.stringify(value, null, 2)
}

const getDataToken = (rawData: string) => {
  let value: Jwt | undefined = undefined
  try {
    value = JSON.parse(rawData)
  } catch { }
  return value
}

const isFormDataValid = (rawData: string) => {
  try {
    const lines = rawData.split("\n")
    // check if it is not empty
    if (lines.length === 0) {
      return false 
    }
    // check if each line consists of X=Y
    if(lines.map(l => l.split("=").length === 2).filter(r => !r).length > 0) {
      return false
    }
  } catch { }
  return true 
}

const getSignedDataToken = (data: Jwt | undefined, signingKey: string | undefined) => {
  let value: string = ""
  if (data && signingKey) {
    try {
      const sHeader = JSON.stringify({ alg: 'HS256', typ: 'JWT' });
      const sPayload = JSON.stringify(data);
      value = KJUR.jws.JWS.sign("HS256", sHeader, sPayload, signingKey);
    } catch { }
  }
  return value
}

const getContinueUrl = (stateParam: string, redirectToken: Jwt | undefined, continueSessionTokenKey?: string, signedToken?: string) => {
  const continueUrlHost = redirectToken && redirectToken.iss ? redirectToken.iss : "INVALID_ISS_IN_TOKEN"
  let value = `https://${continueUrlHost}/continue?state=${stateParam}`
  if (continueSessionTokenKey && signedToken) {
    const tokenParamQueryPart = signedToken ? `&${continueSessionTokenKey}=${signedToken}` : ""
    value = `${value}${tokenParamQueryPart}`
  }
  return value
}

export const reducer: React.Reducer<ReducerState, ReducerAction> = (state, action) => {
  switch (action.type) {
    case ReducerActionTypes.UPDATE_REDIRECT_SESSION_TOKEN_KEY: {
      const redirectSessionTokenParamSelected = action.payload.redirectSessionTokenParamSelected || ""
      return {
        ...state,
        redirectSessionTokenParamSelected
      }
    }
    case ReducerActionTypes.UPDATE_REDIRECT_SIGNING_SECRET: {
      const redirectSigningSecret = action.payload.redirectSigningSecret || ""
      const redirectSigningSecretMatches = testSecret(state.redirectSessionTokenStr, redirectSigningSecret)
      return {
        ...state,
        redirectSigningSecret,
        redirectSigningSecretMatches
      }
    }
    case ReducerActionTypes.UPDATE_CONTINUE_DATA_SUBMIT_METHOD: {
      const continueDataSubmissionMethod = action.payload.continueDataSubmissionMethod || ContinueDataSubmissionMethod.NONE
      let continueUrl = undefined
      switch (continueDataSubmissionMethod) {
        case ContinueDataSubmissionMethod.JWT: {
          const signedToken = getSignedDataToken(state.continueJsonDataJson, state.continueJsonSigningSecret)
          continueUrl = getContinueUrl(state.redirectStateParam, state.redirectSessionTokenJson, state.continueJsonSessionTokenParamSelected, signedToken)
          break
        }
        default: {
          continueUrl = getContinueUrl(state.redirectStateParam, state.redirectSessionTokenJson)
        }
      }
      return {
        ...state,
        continueDataSubmissionMethod,
        continueUrl
      }
    }
    case ReducerActionTypes.UPDATE_CONTINUE_JSON_DATA: {
      const continueJsonDataStr = action.payload.continueJsonDataStr || ""
      const continueJsonDataJson = getDataToken(continueJsonDataStr)
      const continueJsonDataValid = !!continueJsonDataJson
      let signedToken = undefined
      let continueUrl = undefined
      if (continueJsonDataValid) {
        signedToken = getSignedDataToken(continueJsonDataJson, state.continueJsonSigningSecret)
        continueUrl = getContinueUrl(state.redirectStateParam, state.redirectSessionTokenJson, state.continueJsonSessionTokenParamSelected, signedToken)
      } else {
        continueUrl = getContinueUrl(state.redirectStateParam, state.redirectSessionTokenJson)
      }
      return {
        ...state,
        continueJsonDataStr,
        continueJsonDataJson,
        continueJsonDataValid,
        continueUrl
      }
    }
    case ReducerActionTypes.UPDATE_CONTINUE_JSON_SESSION_TOKEN_KEY: {
      const continueJsonSessionTokenParamSelected = action.payload.continueJsonSessionTokenParamSelected || ""
      let signedToken = undefined
      let continueUrl = undefined
      if (state.continueJsonDataJson) {
        signedToken = getSignedDataToken(state.continueJsonDataJson, state.continueJsonSigningSecret)
        continueUrl = getContinueUrl(state.redirectStateParam, state.redirectSessionTokenJson, continueJsonSessionTokenParamSelected, signedToken)
      } else {
        continueUrl = getContinueUrl(state.redirectStateParam, state.redirectSessionTokenJson)
      }
      return {
        ...state,
        continueJsonSessionTokenParamSelected,
        continueUrl
      }
    }
    case ReducerActionTypes.UPDATE_CONTINUE_JSON_SIGNING_SECRET: {
      const continueJsonSigningSecret = action.payload.continueJsonSigningSecret || ""
      let signedToken = undefined
      let continueUrl = undefined
      if (state.continueJsonDataJson) {
        signedToken = getSignedDataToken(state.continueJsonDataJson, continueJsonSigningSecret)
        continueUrl = getContinueUrl(state.redirectStateParam, state.redirectSessionTokenJson, state.continueJsonSessionTokenParamSelected, signedToken)
      } else {
        continueUrl = getContinueUrl(state.redirectStateParam, state.redirectSessionTokenJson)
      }
      return {
        ...state,
        continueJsonSigningSecret,
        continueUrl
      }
    }
    case ReducerActionTypes.UPDATE_CONTINUE_FORM_DATA: {
      const continueFormData = action.payload.continueFormData || ""
      const continueFormDataValid = isFormDataValid(continueFormData)
      console.log(continueFormDataValid)
      let continueUrl = getContinueUrl(state.redirectStateParam, state.redirectSessionTokenJson)
      return {
        ...state,
        continueFormData,
        continueFormDataValid,
        continueUrl
      }
    }
    default: {
      return state
    }
  }
}

export const reducerInit = (initialData: ReducerState): ReducerState => {

  const stateParam = initialData.searchParam.get("state")
  if(!stateParam) {
    return initialData
  }
  const queryParams = Array.from(initialData.searchParam.keys()).filter(key => key !== "state")
  const firstQueryParam = queryParams.length > 0 ? queryParams[0] : ""

  // get session_token value from the query params
  const redirectSessionTokenStr = initialData.searchParam.get(firstQueryParam) || ""
  const redirectSessionTokenJson = getTokenValue(redirectSessionTokenStr)

  // initialize the continue data
  const continueJsonDataStr = getInitialRawData(stateParam, redirectSessionTokenJson)
  const continueJsonDataJson = getDataToken(continueJsonDataStr)
  const continueJsonDataValid = !!continueJsonDataJson
  let signedToken = undefined
  let continueUrl = undefined
  if (continueJsonDataValid) {
    signedToken = getSignedDataToken(continueJsonDataJson, initialData.continueJsonSigningSecret)
    continueUrl = getContinueUrl(stateParam, redirectSessionTokenJson, initialData.continueJsonSessionTokenParamSelected, signedToken)
  } else {
    continueUrl = getContinueUrl(stateParam, redirectSessionTokenJson)
  }

  return {
    ...initialData,
    redirectStateParam: stateParam || "",
    redirectSessionTokenParamCandidates: queryParams,
    redirectSessionTokenParamSelected: firstQueryParam,
    redirectSessionTokenStr,
    redirectSessionTokenJson,
    redirectSigningSecretMatches: testSecret(redirectSessionTokenStr, initialData.redirectSigningSecret),
    continueJsonDataStr,
    continueJsonDataJson,
    continueJsonDataValid: true,
    continueUrl
  }
}
