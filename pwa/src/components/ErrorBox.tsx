import { InformationCircleIcon } from '@heroicons/react/outline';
import { useEffect } from 'react';

function ErrorBox(props:{ children: any; close?: () => void; timeout?: number; className?: any;}) {
  useEffect(() => {
    if (props.timeout !== undefined) {
      const to = setTimeout(() => { props.close && props.close(); }, props.timeout);
      return () => { clearTimeout(to); };
    }
    return () => {};
  }, [props, props.children]);

  return (
    <div className={`relative flex flex-row align-center justify-items-start p-4 text-dark bg-[#FFC4C4] rounded-lg ${props.className} ${!props.children ? 'hidden' : ''}`}
      onClick={() => { props.close && props.close(); }}>
      <InformationCircleIcon role="button" className="h-6 mr-2 text-dark" />
      <div className="text-left grow text-dark">
        { props.children }
      </div>
    </div>
  );
}

export default ErrorBox;
