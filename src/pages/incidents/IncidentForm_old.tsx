import { useQuery } from "@tanstack/react-query";
import { Formik, type FormikValues } from "formik";
import { Form, FormGroup, FormLabel, FormCheck } from "react-bootstrap";
import { VERACITY_OPTIONS, type VeracityOptions } from "../../api/common";
import { getUsers } from "../../api/users";
import AggieButton from "../../components/AggieButton";
import { Group, GroupEditableData } from "../../api/groups/types";
import * as Yup from "yup";

const groupSchema = Yup.object().shape({
  groupName: Yup.string().required("Group name required"),
  groupLocation: Yup.string(),
  groupEscalated: Yup.boolean(),
  groupClosed: Yup.boolean(),
  groupVeracity: Yup.string(),
  groupAssignedTo: Yup.array().of(Yup.string()).optional(),
  groupNotes: Yup.string(),
});

interface IDefaultFormValues {
  groupName: string;
  groupVeracity: VeracityOptions;
  groupClosed: boolean;
  groupEscalated: boolean;
  groupLocation: string;
  groupAssignedTo: string[];
  groupNotes: string;
}

//todo: cleanup this
const defaultFormValues: IDefaultFormValues = {
  groupName: "",
  groupVeracity: VERACITY_OPTIONS[0],
  groupClosed: false,
  groupEscalated: false,
  groupLocation: "",
  groupAssignedTo: [""],
  groupNotes: "",
};

interface IIncidentForm {
  group?: Group;
  onSubmit: (values: GroupEditableData, resetForm: () => void) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const IncidentForm = ({
  group,
  onSubmit,
  onCancel,
  isLoading,
}: IIncidentForm) => {
  const usersQuery = useQuery(["users"], getUsers);

  function GroupToFormValues(data: Group) {
    const assignId = data.assignedTo ? data.assignedTo.map((i) => i._id) : [];
    return {
      groupName: data.title,
      groupVeracity: data.veracity,
      groupClosed: data.closed,
      groupEscalated: data.escalated,
      groupLocation: data.locationName,
      groupAssignedTo: assignId,
      groupNotes: data.notes || "",
    };
  }

  const formValuesToGroup = (values: FormikValues) => {
    // This is because we can't use a null value as a select value.
    let assignedTo = values.groupAssignedTo;
    if (assignedTo === "" || assignedTo[0] === "") {
      assignedTo = null;
    }
    return {
      title: values.groupName,
      notes: values.groupNotes,
      veracity: values.groupVeracity || "Unconfirmed",
      closed: values.groupClosed,
      assignedTo: assignedTo,
      locationName: values.groupLocation,
      public: values.groupPublic,
      escalated: values.groupEscalated,
    };
  };

  const initialValues = !!group ? GroupToFormValues(group) : defaultFormValues;

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={groupSchema}
      onSubmit={(values, { setSubmitting, resetForm }) => {
        onSubmit(formValuesToGroup(values), resetForm);
      }}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleSubmit,
        handleBlur,
        resetForm,
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
                isInvalid={touched.groupAssignedTo && !!errors.groupAssignedTo}
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
            <AggieButton variant='secondary' onClick={onCancel}>
              Cancel
            </AggieButton>
            <AggieButton variant='primary' type='submit' disabled={isLoading}>
              Save
            </AggieButton>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default IncidentForm;
