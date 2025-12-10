import { ClinicianDashboardScreen } from "@/features/clinician/ClinicianDashboardFeature";
import { SEOHead } from "@/components/common";

const ClinicianDashboard = () => {
  return (
    <>
      <SEOHead titleKey="seo:clinician_dashboard_title" descriptionKey="seo:clinician_dashboard_description" />
      <ClinicianDashboardScreen />
    </>
  );
};

export default ClinicianDashboard;
