import { Menu } from "@headlessui/react";
import React, { Children, cloneElement } from "react";

const styleVariants = {
  secondary: {
    button:
      "border-slate-300 hover:bg-slate-300 bg-slate-100 ui-open:bg-slate-300 ",
    panel: "bg-white border border-slate-300 rounded-lg",
  },
};

interface IProps {
  children: React.ReactNode;
  buttonElement: React.ReactNode;
  variant?: keyof typeof styleVariants;
  disabled?: boolean;
  className?: string;
  panelClassName?: string;
  overrideStyles?: boolean;
}

const DropdownMenu = ({
  children,
  buttonElement,
  variant,
  overrideStyles = false,
  disabled = false,
  className = "",
  panelClassName = "",
}: IProps) => {
  const ChildrenWithProps = Children.map(children, (child) => (
    <Menu.Item>{({ active }) => cloneElement(child as JSX.Element)}</Menu.Item>
  ));
  const defaultButtonStyle =
    "focus-theme disabled:opacity-70 disabled:pointer-events-none font-medium";

  const defaultPanelStyle = "absolute top-full mt-1 shadow-md z-10";
  return (
    <Menu as='div' className='relative'>
      <Menu.Button
        className={`${overrideStyles ? "" : defaultButtonStyle} ${
          variant ? styleVariants[variant].button : ""
        } ${className}`}
        disabled={disabled}
      >
        {buttonElement}
      </Menu.Button>
      <Menu.Items
        className={`${overrideStyles ? "" : defaultPanelStyle} ${
          variant ? styleVariants[variant].panel : ""
        } ${panelClassName}`}
      >
        {children && ChildrenWithProps}
      </Menu.Items>
    </Menu>
  );
};

export default DropdownMenu;
