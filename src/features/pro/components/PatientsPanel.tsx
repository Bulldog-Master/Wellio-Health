import { useClinicianPatients, PatientSummary } from "../hooks/useClinicianPatients";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

function TrendPill({ direction }: { direction: PatientSummary["trendDirection"] }) {
  const { t } = useTranslation(["clinician"]);
  
  if (!direction) return null;
  
  const label = direction === "up" 
    ? t("improving") 
    : direction === "down" 
    ? t("declining") 
    : t("stable");
    
  const colorClass = direction === "up" 
    ? "text-green-500 border-green-500/30" 
    : direction === "down" 
    ? "text-red-500 border-red-500/30" 
    : "text-muted-foreground";
    
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ${colorClass}`}>
      {label}
    </span>
  );
}

function PatientCard({ patient }: { patient: PatientSummary }) {
  const { t } = useTranslation(["clinician"]);
  const navigate = useNavigate();

  const fwiColor = patient.latestFwi != null
    ? patient.latestFwi >= 70 
      ? "text-green-500" 
      : patient.latestFwi >= 40 
      ? "text-yellow-500" 
      : "text-red-500"
    : "text-muted-foreground";

  return (
    <div className="rounded-xl border bg-background/60 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">{patient.displayName}</p>
          <p className="text-[11px] text-muted-foreground">
            {t("last_updated")}:{" "}
            {patient.lastUpdated
              ? new Date(patient.lastUpdated).toLocaleDateString()
              : "N/A"}
          </p>
        </div>
        {patient.latestFwi != null && (
          <div className="flex flex-col items-end">
            <span className="text-xs text-muted-foreground">{t("fwi")}</span>
            <span className={`text-lg font-semibold ${fwiColor}`}>
              {patient.latestFwi}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-1">
        <TrendPill direction={patient.trendDirection} />
        {patient.flags.map((flag) => (
          <span
            key={flag}
            className="inline-flex items-center rounded-full bg-muted/60 px-2 py-0.5 text-[11px] text-muted-foreground"
          >
            {flag}
          </span>
        ))}
      </div>
      <div className="flex justify-end">
        <Button
          size="sm"
          variant="outline"
          className="text-[11px] h-7 px-2"
          onClick={() => navigate(`/clinician/patient/${patient.id}`)}
        >
          {t("open_profile")}
        </Button>
      </div>
    </div>
  );
}

export function PatientsPanel() {
  const { t } = useTranslation(["clinician"]);
  const { data, isLoading, error } = useClinicianPatients();

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-background p-3">
        <p className="text-xs text-muted-foreground">{t("loading_patients")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-background p-3">
        <p className="text-xs text-destructive">{t("error_loading_patients")}</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border bg-background p-3">
        <p className="text-xs text-muted-foreground">{t("no_patients")}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-background p-3 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-semibold uppercase text-muted-foreground">
          {t("patients")}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {data.length} {t("connected")}
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {data.map((patient) => (
          <PatientCard key={patient.id} patient={patient} />
        ))}
      </div>
    </div>
  );
}
