import { useSelector } from "react-redux";
import { Outlet } from "react-router";
import Header from "../../core/common/header/header";
import ThemeSettings from "../../core/common/theme-settings";
import Sidebar from "../../core/common/sidebar/sidebar";
import SidebarTwo from "../../core/common/sidebar-two/sidebarTwo";
import Sidebarthree from "../../core/common/sidebarthree/sidebarthree";
import { useAuth } from "../../core/context/AuthContext";

const Feature = () => {
  const { role } = useAuth();

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
        </div>
        <div
          className={`sidebar-overlay${mobileSidebar ? " opened" : ""}`}
        ></div>
      </div>
    </>
  );
};

export default Feature;
