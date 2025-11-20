interface Vital {
  label: string;
  unit: string;
  value?: string;
}

interface VitalsFormProps {
  vitals: Vital[];
  onVitalChange: (label: string, value: string) => void;
}

const VitalsForm = ({ vitals, onVitalChange }: VitalsFormProps) => {
  return (
    <div className="card mb-3">
      <div className="card-header">
        <h5 className="fw-bold mb-0">Vitals</h5>
      </div>
      <div className="card-body">
        <div className="row">
          {vitals.map((vital) => (
            <div key={vital.label} className="col-lg-3 col-md-4 col-sm-6 mb-3">
              <label className="form-label mb-1">
                {vital.label} ({vital.unit})
              </label>
              <input
                type="text"
                className="form-control"
                placeholder={`Enter ${vital.label}`}
                value={vital.value || ""}
                onChange={(e) => onVitalChange(vital.label, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VitalsForm;

