import { useFormikContext } from "formik";
import { useEffect } from "react";
/*
    This component is used to automatically submit the form when the form is valid
    and has been changed(dirty).
    https://github.com/jaredpalmer/formik/issues/2769
*/
const AutoSubmit: React.FC = ({ children }) => {
  const { isValid, values, dirty, submitForm } = useFormikContext();

  useEffect(() => {
    if (isValid && dirty) {
      void submitForm();
    }
  }, [isValid, values, dirty, submitForm]);
  // theres no technical reason why you need to have this as a wrapper, but i
  // thought this would be easier to read
  return <>{children}</>;
};

export default AutoSubmit;
