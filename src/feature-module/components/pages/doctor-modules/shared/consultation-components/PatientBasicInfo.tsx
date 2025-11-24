import ImageWithBasePath from "../../../../../../core/imageWithBasePath";

interface PatientInfo {
  appointmentId: string;
  name: string;
  reason: string;
  age: string;
  department: string;
  date: string;
  gender: string;
  bloodGroup: string;
  consultationType: string;
  imageSrc: string;
}

interface PatientBasicInfoProps {
  patient: PatientInfo;
}

const PatientBasicInfo = ({ patient }: PatientBasicInfoProps) => {
  return (
    <div className="card mb-3">
      <div className="card-body">
        <div className="row align-items-center">
          <div className="col-lg-2">
            <div className="profile-container position-relative d-inline-block">
              <ImageWithBasePath
                src={patient.imageSrc}
                alt={patient.name}
                className="rounded"
              />
            </div>
          </div>
          <div className="col-lg-10">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h5 className="fw-bold mb-1">{patient.name}</h5>
                <p className="text-muted mb-2">
                  <span className="badge badge-soft-primary me-2">
                    {patient.appointmentId}
                  </span>
                  {patient.consultationType}
                </p>
                <div className="row">
                  <div className="col-md-6">
                    <p className="mb-1">
                      <span className="text-muted">Age:</span>{" "}
                      <span className="fw-medium">{patient.age}</span>
                    </p>
                    <p className="mb-1">
                      <span className="text-muted">Gender:</span>{" "}
                      <span className="fw-medium">{patient.gender}</span>
                    </p>
                    <p className="mb-1">
                      <span className="text-muted">Blood Group:</span>{" "}
                      <span className="fw-medium">{patient.bloodGroup}</span>
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-1">
                      <span className="text-muted">Department:</span>{" "}
                      <span className="fw-medium">{patient.department}</span>
                    </p>
                    <p className="mb-1">
                      <span className="text-muted">Date & Time:</span>{" "}
                      <span className="fw-medium">{patient.date}</span>
                    </p>
                    <p className="mb-1">
                      <span className="text-muted">Reason:</span>{" "}
                      <span className="fw-medium">{patient.reason}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientBasicInfo;

