import { Link, Navigate, useParams } from "react-router";
import ImageWithBasePath from "../../../../../core/imageWithBasePath";
import { all_routes } from "../../../../routes/all_routes";
import { useInvoice } from "../../finance-accounts-module/hooks/useInvoice";
import { formatDate } from "../../../../../core/utils/display.utils";
import { formatMoney } from "../../../../../core/utils/money.utils";
import { invoiceStatusLabel } from "../../../../../core/utils/invoice.utils";

const InvoiceDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { invoice, loading, error, notFound } = useInvoice(id);

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="content text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3">Loading invoice…</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return <Navigate to={all_routes.error404} replace />;
  }

  if (error || !invoice) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="alert alert-danger">{error || "Invoice not found"}</div>
        </div>
      </div>
    );
  }

  const taxPercent = (invoice.taxRate || 0) / 100;

  return (
    <>
      <div className="page-wrapper">
        <div className="content pb-0">
          <div className="row">
            <div className="col-lg-10 mx-auto">
              <div className="d-flex align-items-sm-center flex-sm-row flex-column mb-4">
                <div className="flex-grow-1">
                  <h6 className="fw-bold mb-0 d-flex align-items-center ">
                    <Link to={all_routes.invoice} className="me-1">
                      <i className="ti ti-chevron-left" />
                      Invoices
                    </Link>
                  </h6>
                </div>
              </div>
              <div className="card">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between border-1 border-bottom pb-3 mb-3">
                    <ImageWithBasePath src="assets/img/logo.svg" alt="" />
                    <span className="badge bg-info-subtle text-info-emphasis">
                      {invoiceStatusLabel(invoice.status)}
                    </span>
                  </div>
                  <div className="row pb-3 border-1 border-bottom mb-4">
                    <div className="col-lg-4">
                      <h5 className="mb-2 fs-16 fw-bold"> Invoice Details </h5>
                      <p className="text-body mb-1">
                        Invoice Number :
                        <span className="text-dark">
                          {" "}
                          {invoice.invoiceNumber || invoice._id}
                        </span>
                      </p>
                      <p className="text-body mb-1">
                        Issued On :
                        <span className="text-dark">
                          {" "}
                          {formatDate(invoice.issuedOn)}{" "}
                        </span>
                      </p>
                      <p className="text-body mb-1">
                        Due Date :
                        <span className="text-dark">
                          {" "}
                          {formatDate(invoice.dueDate)}
                        </span>
                      </p>
                      <p className="text-body mb-0">
                        Balance :
                        <span className="text-dark">
                          {" "}
                          {formatMoney(invoice.balance)}
                        </span>
                      </p>
                    </div>
                    <div className="col-lg-4">
                      <h5 className="mb-2 fs-16 fw-bold"> Invoice From </h5>
                      <p className="text-dark fw-medium mb-1">
                        {invoice.doctorName || "—"}
                      </p>
                      <p className="text-body mb-1 pe-5">
                        <span className="text-body">Clinic</span>
                      </p>
                    </div>
                    <div className="col-lg-4 text-lg-end">
                      <h5 className="mb-2 fs-16 fw-bold"> Invoice To </h5>
                      <p className="text-dark fw-medium mb-1">
                        {invoice.patientName || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <h6 className="mb-3 fs-16 fw-bold">
                      Products/Service Items
                    </h6>
                    <div className="">
                      <div className="table-responsive border bg-white">
                        <table className="table table-nowrap">
                          <thead className="table-light">
                            <tr>
                              <th>#</th>
                              <th>Product/Item</th>
                              <th> Unit Cost</th>
                              <th> Quantity </th>
                              <th> Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {invoice.lineItems.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="text-muted">
                                  No line items
                                </td>
                              </tr>
                            ) : (
                              invoice.lineItems.map((item, idx) => (
                                <tr key={`${item.description}-${idx}`}>
                                  <td>{idx + 1}</td>
                                  <td>{item.description}</td>
                                  <td>{formatMoney(item.unitPrice)}</td>
                                  <td>{item.quantity}</td>
                                  <td>{formatMoney(item.amount)}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  <div className="row pb-3 mb-3 border-1 border-bottom">
                    <div className="col-lg-6">
                      <div className="">
                        <h6 className="mb-2 fs-16 fw-bold"> Payment Summary</h6>
                        <p className="text-body mb-1">
                          Amount Paid :
                          <span className="text-dark">
                            {" "}
                            {formatMoney(invoice.amountPaid)}{" "}
                          </span>
                        </p>
                        <p className="text-body mb-1">
                          Balance :
                          <span className="text-dark">
                            {" "}
                            {formatMoney(invoice.balance)}{" "}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <h6 className="fs-14 fw-medium text-body">Subtotal</h6>
                          <h6 className="fs-14 fw-semibold text-dark">
                            {formatMoney(invoice.subtotal)}
                          </h6>
                        </div>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <h6 className="fs-14 fw-medium text-body">
                            Tax ({taxPercent}%)
                          </h6>
                          <h6 className="fs-14 fw-semibold text-dark">
                            {formatMoney(invoice.taxAmount)}
                          </h6>
                        </div>
                        <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
                          <h6 className="fs-14 fw-medium text-body">
                            Discount
                          </h6>
                          <h6 className="fs-14 fw-semibold text-danger">
                            {formatMoney(invoice.discount)}
                          </h6>
                        </div>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <h6 className="fs-18 fw-bold">Total</h6>
                          <h6 className="fs-18 fw-bold">
                            {formatMoney(invoice.total)}
                          </h6>
                        </div>
                      </div>
                    </div>
                  </div>
                  {invoice.notes ? (
                    <div className="pb-3 mb-3 border-1 border-bottom">
                      <h6 className="mb-1 fs-14 fw-semibold"> Notes </h6>
                      <p>{invoice.notes}</p>
                    </div>
                  ) : null}
                  <div className="text-center d-flex align-items-center justify-content-center">
                    <Link
                      to=""
                      className="btn btn-md btn-dark me-2 d-flex align-items-center"
                    >
                      <i className="ti ti-printer me-1" /> Print
                    </Link>
                    <Link
                      to=""
                      className="btn btn-md btn-primary d-flex align-items-center"
                    >
                      <i className="ti ti-download me-1" /> Download
                    </Link>
                  </div>
                </div>
              </div>
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
    </>
  );
};

export default InvoiceDetails;
