import { DatePicker } from "antd";
import dayjs from "dayjs";

interface FollowUpSectionProps {
  nextConsultation: string;
  emptyStomach: string;
  onNextConsultationChange: (value: string) => void;
  onEmptyStomachChange: (value: string) => void;
}

const FollowUpSection = ({
  nextConsultation,
  emptyStomach,
  onNextConsultationChange,
  onEmptyStomachChange,
}: FollowUpSectionProps) => {
  const getModalContainer = () => {
    const modalElement = document.getElementById("modal-datepicker");
    return modalElement ? modalElement : document.body;
  };

  return (
    <div className="card mb-3">
      <div className="card-header">
        <h5 className="fw-bold mb-0">Follow Up</h5>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-lg-6 mb-3">
            <label className="form-label mb-1">
              Next Consultation Date
            </label>
            <DatePicker
              className="form-control datetimepicker"
              format={{
                format: "DD-MM-YYYY",
                type: "mask",
              }}
              getPopupContainer={getModalContainer}
              placeholder="DD-MM-YYYY"
              suffixIcon={null}
              value={nextConsultation ? dayjs(nextConsultation, "DD-MM-YYYY") : null}
              onChange={(date) => {
                onNextConsultationChange(date ? date.format("DD-MM-YYYY") : "");
              }}
            />
          </div>
          <div className="col-lg-6 mb-3">
            <label className="form-label mb-1">Empty Stomach</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter empty stomach requirement"
              value={emptyStomach}
              onChange={(e) => onEmptyStomachChange(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FollowUpSection;

