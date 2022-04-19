import { useState, useCallback } from 'react';
import { createOAuth2Client, MfaRequiredError } from '@extrahorizon/javascript-sdk';
import { withTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import LogoIcon from './images/Logo-icon-color.svg';
import EButton from './components/EButton';
import ErrorBox from './components/ErrorBox';
import { ConfigStorage } from './configStorage';
import { CLIENT_ID, HOST } from './constants';
import EDropdown from './components/EDropdown';
import { loginState as globalLoginState } from './AppState';

function LoginPasswordBox(props: {
  t:any;
  onSubmit: (props:any) => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = (e:any) => {
    e.preventDefault();
    e.stopPropagation();
    props.onSubmit({ email, password });
  };

  return (
    <div>
      <form action='#' onSubmit={submit}>
        <div>
          <input id="email" type="text" placeholder={props.t('Email')} className="exh-input my-2 w-full" value={email} onChange={(e:any) => setEmail(e.target?.value)} />
          <input id="password" type="password" placeholder={props.t('Password')} className="exh-input my-2 w-full" value={password} onChange={(e:any) => setPassword(e.target?.value)} />
          <div className="flex flex-row justify-between mt-8" />
          <EButton className="mt-2 w-full">LOGIN</EButton>
        </div>
      </form>
    </div>
  );
}

function OTPBox(props: {t: any; methods: any; onSubmit: (props:any) => void;}) {
  const [code, setCode] = useState('');
  const [method, setMethod] = useState('');

  const typeMap = {
    totp: props.t('OTP'),
    recoveryCodes: props.t('recoveryCodes'),
  };

  const [otpOptions] = useState(props.methods.map(
    (m:{id:string; name: string; type: 'totp'| 'recoveryCodes';}) => ({ key: m.id, value: m.name ? m.name : typeMap[m.type] })
  ));

  const submit = (e:any) => {
    e.preventDefault();
    e.stopPropagation();
    props.onSubmit({ code, method });
  };
  const memoSelectCallback = useCallback((key: any) => { setMethod(key); }, [setMethod]);
  return (
    <form action='#' onSubmit={submit}>
      <div className="font-light text-[#747A8E] mb-8">{ props.t('Enter OTP code') }</div>
      <EDropdown className="w-full" items={otpOptions} selected={method} onChange={memoSelectCallback}/>
      <input className="exh-input w-full my-2" id="code" type="text" placeholder="OTP code" value={code} onChange={(e:any) => setCode(e.target?.value)} />
      <EButton type="submit" className="mt-2 ml-2">{ props.t('Log in') }</EButton>
    </form>
  );
}

function Login(props: { t: any; configStorage: ConfigStorage; }) {
  const [_, setLoggedInState] = useRecoilState(globalLoginState);
  interface LoginState {
    phase: 'start' | 'end' | 'otpNeeded' ;
    sdk?: any;
    otp?: {
      token: string;
      methods: any;
    };
  }
  const [loginState, setLoginState] = useState({ phase: 'start' } as LoginState);
  const [error, setError] = useState('');

  const saveLogin = (refreshToken: string) => {
    props.configStorage.setToken(refreshToken, true);
    // console.log('Setting login state to true');
    setLoggedInState(true);
  };

  /* Handles username/password login enter */
  const login = async ({ email, password }:
  {email:string; password:string;}) => {
    const sdkInstance = createOAuth2Client({
      host: HOST,
      clientId: CLIENT_ID,
    });
    try {
      const resp = await sdkInstance.auth.authenticate({
        username: email,
        password,
      });
      /* Save credentials & transition to the end state */
      saveLogin(resp.refreshToken);
    } catch (err: any) {
      /* Check if OTP is needed */
      if (err instanceof MfaRequiredError) {
        setLoginState({ ...loginState,
          phase: 'otpNeeded',
          sdk: sdkInstance,
          otp: { methods: err.response?.mfa?.methods, token: err.response?.mfa?.token } });
        return;
      }

      /* All error cases from here on */
      if (err.message === 'Network Error') {
        setError(props.t('errors.NetworkHost'));
        return;
      }
      switch (err.response.error) {
        case 'invalid_request':
          setError(props.t('errors.InvalidEmail'));
          break;
        case 'invalid_grant':
          setError(props.t('errors.InvalidPassword'));
          break;
        default: setError(props.t('errors.LoginFailure'));
      }
    }
  };

  /* Handles OTP code entering. All other info should be in login state */
  const enterOtp = async ({ code, method }: { code: string; method: string;}) => {
    /* enter otp code here */
    try {
      const result = await loginState.sdk.auth.confirmMfa({ token: loginState.otp?.token || '', methodId: method, code }) as any;
      saveLogin(result.refreshToken);
    } catch (err:any) {
      if (err.message === 'The supplied MFA code is incorrect') {
        setError(props.t('errors.IncorrectOTPCode'));
      } else if (err.message.indexOf('The MFA authentication attempt was too soon after a failed attempt') !== -1) {
        setError(props.t('errors.DelayAttempts'));
      } else {
        setError(props.t('errors.Unknown'));
      }
    }
  };

  return (
    <div className="absolute top-0 bottom-0 left-0 right-0 flex flex-row bg-white" >
      <div className="w-full flex flex-col items-center" >
        <div className="m-4 w-1/4 rounded-lg shadow-[0px_0px_20px_0px_rgba(0,0,0,0.102)]">
          <img src={LogoIcon} className="shrink p-3" />
        </div>
        <div className="self-center grow flex flex-col justify-center lg:w-1/2 w-3/4">
          <div id="central-section" className="flex flex-col items-start self-start mb-12">
            <div className="text-primary-main font-bold text-8xl" >TAP</div>
            <div className="-mt-2 pl-10 font-medium text-4xl">POWER!</div>
          </div>
          {
            loginState.phase === 'otpNeeded' ? (<OTPBox t={props.t} methods={loginState.otp?.methods} onSubmit={enterOtp}/>) : (<LoginPasswordBox t={props.t} onSubmit={login}/>
            )
          }
          <div className='h-24 mt-8'>
            <ErrorBox className="w-full" timeout={3000} close={() => setError('')}>{ error }</ErrorBox>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withTranslation()(Login);
