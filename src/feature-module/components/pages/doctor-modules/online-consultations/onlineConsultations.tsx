import { useState } from "react";
import ConsultationHeader from "../shared/consultation-components/ConsultationHeader";
import PatientBasicInfo from "../shared/consultation-components/PatientBasicInfo";
import VitalsForm from "../shared/consultation-components/VitalsForm";
import ConsultationSection from "../shared/consultation-components/ConsultationSection";
import FollowUpSection from "../shared/consultation-components/FollowUpSection";
import ConsultationActions from "../shared/consultation-components/ConsultationActions";
import ComplaintForm from "../../../../../core/common/dynamic-list/complientForm";
import DiagnosisForm from "../../../../../core/common/dynamic-list/diagnosisForm";
import MedicalForm from "../../../../../core/common/dynamic-list/medicalForm";
import AdviceForm from "../../../../../core/common/dynamic-list/AdviceForm";
import InvestigationList from "../../../../../core/common/dynamic-list/InvestigationForm";
import InvoiceList from "../../../../../core/common/dynamic-list/InvoiceList";

const OnlineConsultations = () => {
  const [vitals, setVitals] = useState<Record<string, string>>({});
  const [nextConsultation, setNextConsultation] = useState("");
  const [emptyStomach, setEmptyStomach] = useState("");

  const patientInfo = {
    appointmentId: "#AP02254",
    name: "James Carter",
    reason: "Pain near left chest, Pelvic salinity",
    age: "28 Years",
    department: "Cardiology",
    date: "25 Jan 2024, 07:00",
    gender: "Male",
    bloodGroup: "O+ve",
    consultationType: "Online Consultation",
    imageSrc: "assets/img/users/user-04.jpg",
  };

  const handleVitalChange = (label: string, value: string) => {
    setVitals((prev) => ({ ...prev, [label]: value }));
  };

  const handleExport = (format: "pdf" | "excel") => {
    // TODO: Implement export functionality
    console.log(`Exporting consultation as ${format}`);
  };

  const handleCancel = () => {
    // TODO: Handle cancel
    console.log("Cancelled");
  };

  const handleComplete = () => {
    // TODO: Handle complete appointment
    console.log("Completing appointment");
  };

  return (
    <>
      <div className="page-wrapper consultation-custom">
        <div className="content">
          <ConsultationHeader onExportClick={handleExport} />
          <PatientBasicInfo patient={patientInfo} />
          <VitalsForm
            vitals={[
              { label: "Temperature", unit: "F", value: vitals["Temperature"] },
              { label: "Pulse", unit: "mmHg", value: vitals["Pulse"] },
              { label: "Respiratory Rate", unit: "rpm", value: vitals["Respiratory Rate"] },
              { label: "SPO2", unit: "%", value: vitals["SPO2"] },
              { label: "Height", unit: "cm", value: vitals["Height"] },
              { label: "Weight", unit: "kg", value: vitals["Weight"] },
              { label: "BMI", unit: "%", value: vitals["BMI"] },
              { label: "Waist", unit: "cm", value: vitals["Waist"] },
            ]}
            onVitalChange={handleVitalChange}
          />
          <ConsultationSection title="Complaint">
              <ComplaintForm />
          </ConsultationSection>
          <ConsultationSection title="Diagnosis" bodyClassName="pb-0">
                <DiagnosisForm />
          </ConsultationSection>
          <ConsultationSection title="Medications" bodyClassName="pb-0">
              <MedicalForm />
          </ConsultationSection>
          <ConsultationSection title="Advice" bodyClassName="advices-list pb-0">
              <AdviceForm />
          </ConsultationSection>
          <ConsultationSection
            title="Investigation & Procedure"
            bodyClassName="invest-list pb-0"
          >
              <InvestigationList />
          </ConsultationSection>
          <FollowUpSection
            nextConsultation={nextConsultation}
            emptyStomach={emptyStomach}
            onNextConsultationChange={setNextConsultation}
            onEmptyStomachChange={setEmptyStomach}
                    />
          <ConsultationSection title="Invoice">
              <InvoiceList />
          </ConsultationSection>
          <ConsultationActions
            onCancel={handleCancel}
            onComplete={handleComplete}
            completeModalId="cancel-reason"
          />
        </div>
      </div>
    </>
  );
};

export default OnlineConsultations;
