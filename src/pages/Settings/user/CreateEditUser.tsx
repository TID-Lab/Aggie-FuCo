import { Form, Formik } from "formik";
import { User } from "../../../api/users/types";
import { USER_ROLES } from "../../../api/users/types";
import * as Yup from "yup";
import FormikDropdown from "../../../components/FormikDropdown";
import FormikInput from "../../../components/FormikInput";
import AggieButton from "../../../components/AggieButton";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { newUser, editUser } from "../../../api/users";

const userEditSchema = Yup.object().shape({
  username: Yup.string()
    .required("Username is required")
    .min(8, "Username should be atleast 8 characters long."),
  role: Yup.mixed()
    .required("User Role is required")
    .oneOf([...USER_ROLES], "Invalid user role."),
  email: Yup.string()
    .email("Please provide valid email address.")
    .required("Email address is required."),
});

type editSchema = Yup.InferType<typeof userEditSchema>;

const userCreateSchema = Yup.object().shape({
  username: Yup.string()
    .required("Username is required")
    .min(8, "Username should be atleast 8 characters long."),
  role: Yup.mixed()
    .oneOf([...USER_ROLES], "Invalid user role.")
    .required("User Role is required")
    .default("viewer"),
  email: Yup.string()
    .email("Please provide valid email address.")
    .required("Email address is required."),
  password: Yup.string().required("Password is required.").min(4),
});

type createSchema = Yup.InferType<typeof userCreateSchema>;

const defaultCreateSchema = userCreateSchema.getDefault();

interface IProps {
  user?: User;
  onClose: () => void;
}

const CreateEditUser = ({ user, onClose }: IProps) => {
  const queryClient = useQueryClient();

  const doCreateUser = useMutation(newUser, {
    onSuccess: () => {
      onClose();
      queryClient.invalidateQueries(["users"]);
    },
  });
  const doEditUser = useMutation(editUser, {
    onSuccess: () => {
      onClose();
      queryClient.invalidateQueries(["users"]);
    },
  });

  function doSubmitForm(data: editSchema | createSchema) {
    if (!user) {
      doCreateUser.mutate(data);
    } else {
      const withId = { ...data, _id: user._id };
      doEditUser.mutate(withId);
    }
  }

  const isLoading = doCreateUser.isLoading || doEditUser.isLoading;

  const schema = !user ? userCreateSchema : userEditSchema;
  const defaultUser = !user
    ? (defaultCreateSchema as createSchema)
    : ({
        username: user.username,
        role: user.role,
        email: user.email,
      } as editSchema);
  return (
    <Formik
      initialValues={defaultUser}
      onSubmit={(e) => doSubmitForm(e)}
      validationSchema={schema}
      validateOnBlur={true}
    >
      <Form className='flex flex-col gap-3'>
        <FormikDropdown label='Role' name='role' list={[...USER_ROLES]} />
        <FormikInput label='Username' name='username' />
        <FormikInput label='Email' name='email' type='email' />
        {!user && (
          <FormikInput name='password' label='Password' type='password' />
        )}
        <div className='flex justify-between'>
          <AggieButton
            disabled={isLoading}
            variant='secondary'
            type='button'
            onClick={onClose}
          >
            Cancel
          </AggieButton>
          <AggieButton
            variant='primary'
            disabled={isLoading}
            loading={isLoading}
            type={"submit"}
          >
            Confirm
          </AggieButton>
        </div>
      </Form>
    </Formik>
  );
};

export default CreateEditUser;
