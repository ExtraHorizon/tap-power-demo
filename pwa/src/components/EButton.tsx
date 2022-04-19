/* ExH button */

const bStyles = {
  primary: {
    default: {
      enabled: 'hover:bg-primary-dark bg-primary-main border-primary-main hover:border-primary-dark text-white',
      disabled: 'bg-[#D1DEFF] border-[#D1DEFF] text-white',
    },
    outline: {
      enabled: 'bg-white hover:bg-primary-main hover:text-white border-primary-main text-primary-main',
      disabled: 'bg-white border-2 border-[#D1DEFF] text-[#D1DEFF]',
    },
  },
  secondary: {
    default: {
      enabled: 'bg-dark border-dark text-white hover:border-[#000D31] hover:bg-[#000D31] hover:text-white',
      disabled: 'bg-[#7180AA] text-white',
    },
    outline: {
      enabled: 'bg-white hover:bg-dark hover:text-white border-dark text-dark',
      disabled: 'bg-white border-2 border-[#7180AA] text-[#7180AA]',
    },
  },
};

function EButton(props: any) {
  const { primary, secondary, outline, ...restProps } = props;

  const color = bStyles[secondary ? 'secondary' : 'primary'][outline ? 'outline' : 'default'][props.disabled ? 'disabled' : 'enabled'];
  const baseClass = `font-semibold px-[30px] h-[40px] rounded-[8px] border-[2px] text-md ${props.className}`;
  return (<button {...restProps} className={`${baseClass} ${color}`}>{ restProps.children?.toUpperCase() } </button>);
}

export default EButton;
