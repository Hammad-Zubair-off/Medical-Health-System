import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Outlet } from "react-router";
import Header from "../../core/common/header/header";
import ThemeSettings from "../../core/common/theme-settings";
import Sidebar from "../../core/common/sidebar/sidebar";
import SidebarTwo from "../../core/common/sidebar-two/sidebarTwo";
import Sidebarthree from "../../core/common/sidebarthree/sidebarthree";
import GdprCookieBanner from "../../core/common/gdpr-cookie-banner/GdprCookieBanner";
import { useAuth } from "../../core/context/AuthContext";
import { getClinicSettings } from "../../core/services/firestore/clinic-settings.service";
import IncomingCallModal from "../components/pages/application-modules/application/calls/components/IncomingCallModal";

const Feature = () => {
  const { role } = useAuth();
  const [maintenanceBlocked, setMaintenanceBlocked] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");

  useEffect(() => {
    if (role === "admin") {
      setMaintenanceBlocked(false);
      return;
    }
    void getClinicSettings()
      .then((s) => {
        if (s.maintenance.enabled) {
          setMaintenanceBlocked(true);
          setMaintenanceMessage(s.maintenance.message);
        } else {
          setMaintenanceBlocked(false);
        }
      })
      .catch(() => setMaintenanceBlocked(false));
  }, [role]);

  const themeSettings = useSelector((state: any) => state.theme.themeSettings);
  const { miniSidebar, mobileSidebar, expandMenu } = useSelector(
    (state: any) => state.sidebarSlice
  );

  const dataLayout = themeSettings["data-layout"];
  const dataWidth = themeSettings["data-width"];
  const dataSize = themeSettings["data-size"];
  const dir = themeSettings["dir"];

  const sidebar =
    role === "doctor" ? (
      <SidebarTwo />
    ) : role === "patient" ? (
      <Sidebarthree />
    ) : (
      <Sidebar />
    );

  if (maintenanceBlocked && role !== "admin") {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100 p-4 text-center">
        <div>
          <h3 className="fw-bold mb-3">Under maintenance</h3>
          <p className="text-muted mb-0">{maintenanceMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`
        ${
          miniSidebar || dataLayout === "mini" || dataSize === "compact"
            ? "mini-sidebar"
            : ""
        }
        ${
          (expandMenu && miniSidebar) || (expandMenu && dataLayout === "mini")
            ? "expand-menu"
            : ""
        }
        ${mobileSidebar ? "menu-opened slide-nav" : ""}
        ${dataWidth === "box" ? "layout-box-mode mini-sidebar" : ""}
        ${dir === "rtl" ? "layout-mode-rtl" : ""}
      `}
      >
        <div className="main-wrapper">
          <Header />
          {sidebar}
          <ThemeSettings />
          <Outlet />
          <GdprCookieBanner />
          <IncomingCallModal />
        </div>
        <div
          className={`sidebar-overlay${mobileSidebar ? " opened" : ""}`}
        ></div>
      </div>
    </>
  );
};

export default Feature;
