import { Link, useNavigate } from "react-router";
import { all_routes, patientDetailsPath } from "../../../../routes/all_routes";
import PatientForm from "../patient-form/PatientForm";
import { usePatientForm } from "../patient-details/hooks/usePatient";

const CreatePatient = () => {
  const navigate = useNavigate();
  const { submitting, error, createPatient } = usePatientForm();

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="mb-4">
              <h6 className="fw-bold mb-0 d-flex align-items-center">
                <Link to={all_routes.patients} className="text-dark">
                  <i className="ti ti-chevron-left me-1" />
                  Patients
                </Link>
              </h6>
            </div>
            <PatientForm
              submitting={submitting}
              error={error}
              submitLabel="Add New Patient"
              onSubmit={async (values) => {
                const id = await createPatient(values);
                navigate(patientDetailsPath(id));
              }}
            />
          </div>
        </div>
      </div>
      <div className="footer text-center bg-white p-2 border-top">
        <p className="text-dark mb-0">
          2025 ©
          <Link to="#" className="link-primary">
            Doctoury
          </Link>
          , All Rights Reserved
        </p>
      </div>
    </div>
  );
};

export default CreatePatient;
