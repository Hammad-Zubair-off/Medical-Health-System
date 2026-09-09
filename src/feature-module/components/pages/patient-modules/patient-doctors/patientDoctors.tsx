import { Link } from "react-router";
import ImageWithBasePath from "../../../../../core/imageWithBasePath";
import { all_routes, doctorsDetailsPath } from "../../../../routes/all_routes";
import { useState, useMemo, useEffect } from "react";
import Datatable from "../../../../../core/common/dataTable";
import SearchInput from "../../../../../core/common/dataTable/dataTableSearch";
import { useDoctors } from "../../clinic-modules/doctors-list/hooks/useDoctors";
import { listSpecializations } from "../../../../../core/services/firestore/specialization.service";

const PatientDoctors = () => {
  const { doctors, loading, error, search, setSearch } = useDoctors("active");
  const [specNames, setSpecNames] = useState<Record<string, string>>({});

  useEffect(() => {
    void listSpecializations(true).then((rows) => {
      const map: Record<string, string> = {};
      rows.forEach((s) => {
        map[s._id] = s.name;
      });
      setSpecNames(map);
    });
  }, []);

  const dataSource = useMemo(
    () =>
      doctors.map((doctor) => ({
        key: doctor._id,
        _id: doctor._id ?? "",
        Doctor_Name: doctor.displayName ?? "Doctor",
        role:
          (doctor.specializationId && specNames[doctor.specializationId]) ||
          doctor.specialization ||
          "—",
        Phone: doctor.phoneNumber ?? "—",
        Email: doctor.email ?? "—",
      })),
    [doctors, specNames]
  );

  const columns = [
    {
      title: "Doctor Name",
      dataIndex: "Doctor_Name",
      render: (text: string, render: (typeof dataSource)[number]) => (
        <div className="d-flex align-items-center">
          <Link to={doctorsDetailsPath(render._id)} className="avatar avatar-md me-2">
            <ImageWithBasePath
              src="assets/img/doctors/doctor-01.jpg"
              alt="product"
              className="rounded-circle"
            />
          </Link>
          <Link to={doctorsDetailsPath(render._id)} className="text-dark fw-semibold">
            {text}
            <span className="text-body fs-13 fw-normal d-block">{render.role}</span>
          </Link>
        </div>
      ),
    },
    { title: "Phone", dataIndex: "Phone" },
    { title: "Email", dataIndex: "Email" },
    {
      title: "",
      render: () => (
        <Link
          to={all_routes.patientappointments}
          className="border p-1 rounded-3 fs-13 text-body d-inline-flex"
        >
          <i className="ti ti-calendar-cog" />
        </Link>
      ),
    },
  ];

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h4 className="fw-bold mb-0">Doctors</h4>
        </div>
        <div className="search-set mb-3">
          <SearchInput value={search} onChange={setSearch} />
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        {loading && doctors.length === 0 ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" />
          </div>
        ) : (
          <Datatable columns={columns} dataSource={dataSource} Selection={false} searchText="" />
        )}
      </div>
    </div>
  );
};

export default PatientDoctors;
