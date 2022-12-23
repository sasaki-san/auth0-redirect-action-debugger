import React from 'react';
import ReactDOM from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import './index.css';
import App, { AuthorizeState, Page } from './App';
import reportWebVitals from './reportWebVitals';
import AutoLogin from './comoponents/AutoLogin';
import { Route, BrowserRouter, Routes } from 'react-router-dom'

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

export interface AuthorizingState extends AuthorizeState {
  search: string
}

const parseAuthorizingState = (item: string | null) => {
  return item ? JSON.parse(item) as AuthorizingState : null
}

const ExtendedRoutes = ({ authorizingState, children }: { authorizingState: AuthorizingState | null, children: any }) => {
  if (authorizingState) {
    return (
      <Auth0Provider
        domain={authorizingState.domain}
        clientId={authorizingState.clientId}
        redirectUri={authorizingState.redirect_uri}
      >
        <Routes>
          <Route path="/authorizing" element={<AutoLogin search={authorizingState.search} />} />
          {children}
        </Routes>
      </Auth0Provider>
    )
  }
  return (
    <Routes>
      {children}
    </Routes>
  )
}

const authorizingState: AuthorizingState | null = parseAuthorizingState(sessionStorage.getItem("authorizingState"))
const search = authorizingState?.search || window.location.search
const initialPage = authorizingState ? Page.Authorize : Page.Main

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ExtendedRoutes authorizingState={authorizingState}>
        <Route path="/" element={<App search={search} inAuth0Provider={!!authorizingState} initialPage={initialPage} />} />
      </ExtendedRoutes>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
