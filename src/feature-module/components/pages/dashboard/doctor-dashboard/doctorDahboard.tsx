import { Link } from "react-router";
import { useNavigate } from "react-router";
import Modals from "./modals/modals";
import SCol5Chart from "./charts/scol5";
import SCol6Chart from "./charts/scol6";
import SCol7Chart from "./charts/scol7";
import DashboardHeader from "./components/DashboardHeader";
import StatCard from "./components/StatCard";
import SmallStatCard from "./components/SmallStatCard";
import UpcomingAppointments from "./components/UpcomingAppointments";
import AppointmentsChart from "./components/AppointmentsChart";
import RecentAppointmentsTable from "./components/RecentAppointmentsTable";
import AvailabilityCard from "./components/AvailabilityCard";
import AppointmentStatistics from "./components/AppointmentStatistics";
import TopPatients from "./components/TopPatients";
import { all_routes } from "../../../../routes/all_routes";
import { useDoctorDashboard } from "./hooks/useDoctorDashboard";
import { useUser } from "../../../../../core/context/UserContext";

const DoctorDahboard = () => {
  const navigate = useNavigate();
  const { doctorUserId, loading: userLoading } = useUser();
  const {
    appointments,
    appointmentsWithPatients,
    statistics,
    trends,
    availabilitySchedule,
    loading: dashboardLoading,
    error,
  } = useDoctorDashboard(doctorUserId);

  const handleScheduleAvailability = () => {
    navigate(all_routes.doctorschedule);
  };

  if (userLoading || dashboardLoading) {
    return (
      <div className="page-wrapper">
        <div className="content d-flex align-items-center justify-content-center" style={{ minHeight: "400px" }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Error Loading Dashboard</h4>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ========================
			Start Page Content
		========================= */}
      <div className="page-wrapper">
        {/* Start Content */}
        <div className="content pb-0">
          {/* Page Header */}
          <DashboardHeader onScheduleAvailabilityClick={handleScheduleAvailability} />
          {/* End Page Header */}
          {/* row start */}
          <div className="row">
            <StatCard
              title="Total Appointments"
              value={statistics.totalAppointments}
              badgeText={trends.totalAppointmentsTrend.formatted}
              badgeColor={trends.totalAppointmentsTrend.badgeColor}
              icon="ti-calendar-heart"
              iconColor="primary"
              chart={<SCol5Chart />}
              trendText={trends.totalAppointmentsTrend.formatted}
              trendIcon={trends.totalAppointmentsTrend.icon}
              trendColor={trends.totalAppointmentsTrend.color}
            />
            <StatCard
              title="Complete Booking"
              value={statistics.completed}
              badgeText={trends.completedTrend.formatted}
              badgeColor={trends.completedTrend.badgeColor}
              icon="ti-circle-check"
              iconColor="success"
              chart={<SCol6Chart />}
              trendText={trends.completedTrend.formatted}
              trendIcon={trends.completedTrend.icon}
              trendColor={trends.completedTrend.color}
            />
            <StatCard
              title="Cancelled Appointments"
              value={statistics.cancelledAppointments}
              badgeText={trends.cancelledTrend.formatted}
              badgeColor={trends.cancelledTrend.badgeColor}
              icon="ti-versions"
              iconColor="danger"
              chart={<SCol7Chart />}
              trendText={trends.cancelledTrend.formatted}
              trendIcon={trends.cancelledTrend.icon}
              trendColor={trends.cancelledTrend.color}
            />
          </div>
          {/* row end */}
          {/* row start */}
          <div className="row">
            <UpcomingAppointments appointments={appointmentsWithPatients} />
            <AppointmentsChart appointments={appointments} />
          </div>
          {/* row end */}
          {/* row start */}
          <div className="row row-cols-1 row-cols-xl-6 row-cols-md-3 row-cols-sm-2 mb-3">
            <SmallStatCard
              icon="ti-user"
              iconBgColor="primary"
              title="Total Patient"
              value={statistics.totalPatients}
              trendText={`${trends.totalPatientsTrend.formatted} Last Week`}
              trendColor={trends.totalPatientsTrend.color}
            />
            <SmallStatCard
              icon="ti-calendar-heart"
              iconBgColor="warning"
              title="Total Appointments"
              value={statistics.totalAppointments}
              trendText={`${trends.totalAppointmentsTrend.formatted} Last Week`}
              trendColor={trends.totalAppointmentsTrend.color}
            />
            <SmallStatCard
              icon="ti-circle-check"
              iconBgColor="success"
              title="Completed Appointment"
              value={statistics.completed}
              trendText={`${trends.completedTrend.formatted} Last Week`}
              trendColor={trends.completedTrend.color}
            />
            <SmallStatCard
              icon="ti-calendar-up"
              iconBgColor="info"
              title="Upcoming Appointment"
              value={statistics.upcoming}
              trendText={`${trends.upcomingTrend.formatted} Last Week`}
              trendColor={trends.upcomingTrend.color}
            />
            <SmallStatCard
              icon="ti-check"
              iconBgColor="secondary"
              title="Confirmed Appointment"
              value={statistics.confirmed}
              trendText={`${trends.confirmedTrend.formatted} Last Week`}
              trendColor={trends.confirmedTrend.color}
            />
            <SmallStatCard
              icon="ti-x"
              iconBgColor="danger"
              title="Cancelled Appointment"
              value={statistics.cancelled}
              trendText={`${trends.cancelledTrend.formatted} Last Week`}
              trendColor={trends.cancelledTrend.color}
            />
          </div>
          {/* row end */}
          <RecentAppointmentsTable appointments={appointmentsWithPatients} />
          {/* row start */}
          <div className="row">
            <AvailabilityCard schedule={availabilitySchedule} />
            <AppointmentStatistics
              completed={statistics.completed}
              pending={statistics.pending}
              cancelled={statistics.cancelled}
            />
            <TopPatients appointmentsWithPatients={appointmentsWithPatients} />
          </div>
          {/* row end */}
        </div>
        {/* End Content */}
        {/* Footer Start */}
        <div className="footer text-center bg-white p-2 border-top">
          <p className="text-dark mb-0">
            2025 ©
            <Link to="#" className="link-primary">
              Doctoury
            </Link>
            , All Rights Reserved
          </p>
        </div>
        {/* Footer End */}
      </div>
      {/* ========================
			End Page Content
		========================= */}
      <Modals />
    </>
  );
};

export default DoctorDahboard;
