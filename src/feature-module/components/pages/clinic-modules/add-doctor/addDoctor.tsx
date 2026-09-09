import { Link, useNavigate } from "react-router";
import { all_routes, doctorsDetailsPath } from "../../../../routes/all_routes";
import DoctorForm from "../doctor-form/DoctorForm";
import { useDoctorForm } from "../doctor-details/hooks/useDoctor";

const AddDoctor = () => {
  const navigate = useNavigate();
  const { submitting, error, createDoctor } = useDoctorForm();

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="row">
          <div className="col-lg-10 mx-auto">
            <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3">
              <div className="flex-grow-1">
                <h6 className="fw-bold mb-0 d-flex align-items-center">
                  <Link to={all_routes.doctors}>
                    <i className="ti ti-chevron-left me-1 fs-14" />
                    Doctor
                  </Link>
                </h6>
              </div>
            </div>
            <DoctorForm
              createLogin
              submitting={submitting}
              error={error}
              submitLabel="Add Doctor"
              onSubmit={async (values) => {
                const id = await createDoctor(values);
                navigate(doctorsDetailsPath(id));
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDoctor;
