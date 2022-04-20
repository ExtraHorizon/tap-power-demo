import { createClient } from '@extrahorizon/javascript-sdk';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { needRegistration } from './AppState';
import EButton from './components/EButton';
import ErrorBox from './components/ErrorBox';
import { CLIENT_ID, HOST } from './constants';
import LogoIcon from './images/Logo-icon-color.svg';

function Register(props: any) {
  const [__, setNeedRegistration] = useRecoilState(needRegistration);
  const [error, setError] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [firstPassword, setFirstPassword] = useState('');
  const [secondPassword, setSecondPassword] = useState('');
  const [registered, setRegistered] = useState(false);

  const register = async () => {
    if (firstPassword !== secondPassword) {
      setError('Passwords do not match');
      return;
    }
    const sdk = createClient({ host: HOST, clientId: CLIENT_ID });

    try {
      await sdk.users.createAccount({
        firstName,
        lastName,
        email,
        password: firstPassword,
        phoneNumber: '0123456789',
        birthday: '1960-06-06',
        gender: 0,
        country: 'BE',
        language: 'EN',
      });
      setRegistered(true);
    } catch (err: any) {
      setError(`Failed to register: ${err.message}`);
    }
  };

  return !registered ? (
    <div className="absolute top-0 bottom-0 left-0 right-0 flex flex-row bg-white" >
      <div className="w-full flex flex-col items-center" >
        <div className="m-4 w-1/4 rounded-lg shadow-[0px_0px_20px_0px_rgba(0,0,0,0.102)]">
          <img src={LogoIcon} className="shrink p-3" />
        </div>
        <div className="self-center grow flex flex-col justify-center lg:w-1/2 w-3/4">
          <div className="font-bold text-xl">Please fill in details</div>
          <input id="firstname" type="text" placeholder="First name" className="exh-input my-2 w-full" value={firstName} onChange={(e:any) => setFirstName(e.target?.value ?? '')} />
          <input id="lastname" type="text" placeholder="Last name" className="exh-input my-2 w-full" value={lastName} onChange={(e:any) => setLastName(e.target?.value ?? '')} />
          <input id="email" type="email" placeholder="Email" className="exh-input my-2 w-full" value={email} onChange={(e:any) => setEmail(e.target?.value ?? '')} />
          <input id="firstpassword" type="password" placeholder="Password" className="exh-input my-2 w-full" value={firstPassword} onChange={(e:any) => setFirstPassword(e.target?.value ?? '')} />
          <input id="secondpassword" type="password" placeholder="Retype password" className="exh-input my-2 w-full" value={secondPassword} onChange={(e:any) => setSecondPassword(e.target?.value ?? '')} />
          <EButton className="mt-2 w-full" onClick={register}>REGISTER</EButton>
          <div className='h-24 mt-8'>
            <ErrorBox className="w-full" timeout={3000} close={() => setError('')}>{ error }</ErrorBox>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="absolute top-0 bottom-0 left-0 right-0 flex flex-row bg-white" >
      <div className="w-full flex flex-col items-center" >
        <div className="m-4 w-1/4 rounded-lg shadow-[0px_0px_20px_0px_rgba(0,0,0,0.102)]">
          <img src={LogoIcon} className="shrink p-3" />
        </div>
        <div className="flex flex-col justify-top lg:w-1/2 w-3/4 mt-6">
          <div className="font-bold text-xl mb-4">Thanks for registering!</div>
          <div className="mb-4">You will receive a confirmation mail shortly</div>
          <EButton className="mt-2 w-full" onClick={() => setNeedRegistration(false)}>BACK TO LOGIN</EButton>
        </div>
      </div>
    </div>

  );
}

export default Register;
