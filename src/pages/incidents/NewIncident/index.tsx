import { Formik, FormikValues } from "formik";
import { Form, FormGroup, FormLabel, FormCheck, Button } from "react-bootstrap";
import { VERACITY_OPTIONS, type VeracityOptions } from "../../../api/enums";
import { useQueryParams } from "../../../hooks/useQueryParams";
import {
  hasId,
  GroupCreateData,
  GroupEditableData,
} from "../../../objectTypes";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { newGroup } from "../../../api/groups";
import { getUsers } from "../../../api/users";
import AggieButton from "../../../components/AggieButton";

interface NewIncidentQueryState {
  reports?: hasId[];
}

const defaultFormValues = {
  groupName: "",
  groupVeracity: VERACITY_OPTIONS[0],
  groupClosed: false,
  groupEscalated: false,
  groupLocation: "",
  groupAssignedTo: [""],
  groupNotes: "",
};
const groupSchema = Yup.object().shape({
  groupName: Yup.string().required("Group name required"),
  groupLocation: Yup.string(),
  groupEscalated: Yup.boolean(),
  groupClosed: Yup.boolean(),
  groupVeracity: Yup.string(),
  groupAssignedTo: Yup.array().of(Yup.string()).optional(),
  groupNotes: Yup.string(),
});
const NewIncident = () => {
  const navigate = useNavigate();

  const { searchParams } = useQueryParams<NewIncidentQueryState>();

  const usersQuery = useQuery(["users"], getUsers);

  const { isSuccess, data, isError, isLoading, mutate } = useMutation(
    (groupData: GroupEditableData) => {
      return newGroup(groupData);
    },
    {
      onSuccess: () => {
        navigate(-1);
      },
    }
  );
  const formValuesToGroup = (values: FormikValues) => {
    // This is because we can't use a null value as a select value.
    let assignedTo = values.groupAssignedTo;
    if (values.groupAssignedTo === "") {
      assignedTo = null;
    }

    return {
      title: values.groupName,
      notes: values.groupNotes,
      veracity: values.groupVeracity,
      closed: values.groupClosed,
      assignedTo: assignedTo,
      locationName: values.groupLocation,
      public: values.groupPublic,
      escalated: values.groupEscalated,
    };
  };
  return (
    <section className='max-w-screen-xl mx-auto px-4 pb-10'>
      <header className='my-4 flex justify-between items-center'>
        <h1 className='text-3xl'>Create New Incident</h1>
      </header>
      <Formik
        initialValues={defaultFormValues}
        validationSchema={groupSchema}
        onSubmit={(values, { setSubmitting, resetForm }) => {
          mutate(formValuesToGroup(values));
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleSubmit,
          handleBlur,
          isSubmitting,
        }) => (
          <Form noValidate onSubmit={handleSubmit}>
            <div>
              <FormGroup controlId='formUsername' className={"mb-3"}>
                <FormLabel>Name</FormLabel>
                <Form.Control
                  type='text'
                  className='form-control'
                  name='groupName'
                  value={values.groupName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.groupName && !!errors.groupName}
                />
                <Form.Control.Feedback type='invalid'>
                  {errors.groupName}
                </Form.Control.Feedback>
              </FormGroup>
              <FormGroup controlId='formUserEmail' className={"mb-3"}>
                <FormLabel>Location</FormLabel>
                <Form.Control
                  type='text'
                  className='form-control'
                  name='groupLocation'
                  value={values.groupLocation}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.groupLocation && !!errors.groupLocation}
                />
                <Form.Control.Feedback type='invalid'>
                  {errors.groupLocation}
                </Form.Control.Feedback>
              </FormGroup>
              <div className=''>
                <div>
                  <FormGroup controlId='formGroupEscalated' className={"mb-3"}>
                    <FormCheck
                      checked={values.groupEscalated}
                      type='switch'
                      label='Escalated'
                      onChange={handleChange}
                      name='groupEscalated'
                    />
                  </FormGroup>
                </div>
                <div>
                  <FormGroup controlId='formGroupClosed' className={"mb-3"}>
                    <FormCheck
                      checked={values.groupClosed}
                      type='switch'
                      label='Closed'
                      onChange={handleChange}
                      name='groupClosed'
                    />
                  </FormGroup>
                </div>
              </div>
              <FormGroup controlId='formUserRole' className={"mb-3"}>
                <FormLabel>Veracity</FormLabel>
                <Form.Control
                  as={"select"}
                  name='groupVeracity'
                  className='form-select'
                  value={values.groupVeracity}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.groupVeracity && !!errors.groupVeracity}
                >
                  {VERACITY_OPTIONS.map((option) => {
                    return <option key={option}>{option}</option>;
                  })}
                </Form.Control>
              </FormGroup>
              <FormGroup controlId='formUserRole' className={"mb-3"}>
                <FormLabel>Assigned to</FormLabel>
                <Form.Control
                  as={"select"}
                  name='groupAssignedTo'
                  className='form-select'
                  value={values.groupAssignedTo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  multiple={true}
                  isInvalid={
                    touched.groupAssignedTo && !!errors.groupAssignedTo
                  }
                >
                  {/* <option key='none' value={''}>
                        None
                      </option> */}
                  {usersQuery.isSuccess &&
                    usersQuery.data &&
                    usersQuery.data.map((user) => {
                      return (
                        <option key={user._id} value={user._id}>
                          {user.username}
                        </option>
                      );
                    })}
                </Form.Control>
              </FormGroup>
              <FormGroup controlId='formGroupNotes' className={"mb-3"}>
                <FormLabel>Notes</FormLabel>
                <Form.Control
                  as={"textarea"}
                  placeholder={"Write notes here."}
                  style={{ height: "100px" }}
                  name='groupNotes'
                  className='form-control'
                  value={values.groupNotes}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.groupNotes && !!errors.groupNotes}
                />
                <Form.Control.Feedback type='invalid'>
                  {errors.groupNotes}
                </Form.Control.Feedback>
              </FormGroup>
            </div>
            <div className='flex gap-2'>
              <AggieButton variant='secondary' onClick={() => navigate(-1)}>
                Cancel
              </AggieButton>
              <AggieButton
                variant='primary'
                type='submit'
                disabled={isSubmitting}
              >
                Save
              </AggieButton>
            </div>
          </Form>
        )}
      </Formik>
    </section>
  );
};

export default NewIncident;
