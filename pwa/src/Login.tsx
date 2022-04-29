import { useState } from 'react';
import { createClient, createOAuth2Client, MfaRequiredError } from '@extrahorizon/javascript-sdk';
import { withTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import LogoIcon from './images/Logo-icon-color.svg';
import EButton from './components/EButton';
import ErrorBox from './components/ErrorBox';
import { ConfigStorage } from './configStorage';
import { CLIENT_ID, FIXED_PWD, HOST } from './constants';
import { loginState as globalLoginState } from './AppState';

function LoginPasswordBox(props: {
  t:any;
  onSubmit: (email:string) => void;
}) {
  const [email, setEmail] = useState('');

  const submit = (e:any) => {
    e.preventDefault();
    e.stopPropagation();
    props.onSubmit(email);
  };

  return (
    <div>
      <form action='#' onSubmit={submit}>
        <div>
          <input id="email" type="text" placeholder={props.t('Email')} className="exh-input my-2 w-full" value={email} onChange={(e:any) => setEmail(e.target?.value)} />
          <div className="flex flex-row justify-between mt-8" />
          <EButton className="mt-2 w-full">LOGIN</EButton>
        </div>
      </form>
    </div>
  );
}

function Login(props: { t: any; configStorage: ConfigStorage; }) {
  const [_, setLoggedInState] = useRecoilState(globalLoginState);
  const [error, setError] = useState('');
  const [loginState, setLoginState] = useState('');

  const saveLogin = (refreshToken: string) => {
    props.configStorage.setToken(refreshToken, true);
    setLoggedInState(true);
  };

  const register = async (email: string) => {
    const sdk = createClient({ host: HOST, clientId: CLIENT_ID });

    try {
      await sdk.users.createAccount({
        firstName: 'Demo',
        lastName: 'App',
        email,
        password: FIXED_PWD,
        phoneNumber: '0123456789',
        birthday: '1960-06-06',
        gender: 0,
        country: 'BE',
        language: 'EN',
      });
    } catch (err: any) {
      setError(`Failed to login: ${err.message}`);
    }
  };

  /* Handles username/password login enter */
  const login = async (email : string) => {
    const sdkInstance = createOAuth2Client({
      host: HOST,
      clientId: CLIENT_ID,
    });
    try {
      const resp = await sdkInstance.auth.authenticate({
        username: email,
        password: FIXED_PWD,
      });
      /* Save credentials & transition to the end state */
      saveLogin(resp.refreshToken);
      return true;
    } catch (err: any) {
      /* All error cases from here on */
      if (err.message === 'Network Error') {
        setError(props.t('errors.NetworkHost'));
        throw new Error('Network error');
      }
      switch (err.response.error) {
        case 'invalid_request':
          setError(props.t('errors.InvalidEmail'));
          throw new Error('Invalid email?');
        case 'invalid_grant':
          // setError(props.t('errors.InvalidPassword'));
          return false;
        default: setError(props.t('errors.LoginFailure'));
      }
    }
    return false;
  };

  const handleLoginSequence = async (email: string) => {
    try {
      setLoginState('Checking... ');
      if (!await login(email)) {
        setLoginState('Registering ... ');
        await register(email);
        setLoginState('Logging in... ');
        if (!await login(email)) {
          setError(props.t('Failed to login and/or register'));
        }
      }
    } catch (err) {
      setError(props.t('Failed to login and/or register'));
    }
  };

  return (
    <div className="absolute top-0 bottom-0 left-0 right-0 flex flex-row bg-white" >
      <div className="w-full flex flex-col items-center" >
        <div className="m-4 w-1/4 rounded-lg shadow-[0px_0px_20px_0px_rgba(0,0,0,0.102)]">
          <img src={LogoIcon} className="shrink p-3" />
        </div>
        <div className="self-center grow flex flex-col justify-center lg:w-1/2 w-3/4">
          <div id="central-section" className="flex flex-col items-start self-center mb-12">
            <div className="text-primary-main font-bold text-8xl" >TAP</div>
            <div className="-mt-2 pl-10 font-medium text-4xl">POWER!</div>
          </div>
          {
            <LoginPasswordBox
              t={props.t}
              onSubmit={handleLoginSequence}/>
          }
          <div className="mt-2 font-bold">{ loginState }</div>
          <div className='h-24 mt-8'>
            <ErrorBox className="w-full" timeout={3000} close={() => setError('')}>{ error }</ErrorBox>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withTranslation()(Login);
