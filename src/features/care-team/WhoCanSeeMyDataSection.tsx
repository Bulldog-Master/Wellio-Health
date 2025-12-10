import { Shield } from 'lucide-react';
import { CareTeamRole, getVisibilityRule } from './careTeamVisibility';

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-background p-4 space-y-2">
      <h2 className="text-sm font-semibold flex items-center gap-2">
        <Shield className="h-4 w-4 text-muted-foreground" />
        {title}
      </h2>
      {children}
    </section>
  );
}

interface CareTeamState {
  hasCoach: boolean;
  hasClinician: boolean;
}

export function WhoCanSeeMyDataSection({
  careTeam,
}: {
  careTeam: CareTeamState;
}) {
  const visibleRoles: CareTeamRole[] = [];
  if (careTeam.hasCoach) visibleRoles.push("coach");
  if (careTeam.hasClinician) visibleRoles.push("clinician");

  const anyone = visibleRoles.length > 0;

  if (!anyone) {
    return (
      <SectionCard title="Who can see my data?">
        <p className="text-xs text-muted-foreground">
          Right now, only you can see your detailed logs and Functional
          Wellness Index. When you connect a coach or clinician from this
          screen, they will see high-level functional trends only — not your
          raw logs or medical documents.
        </p>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Who can see my data?">
      <div className="space-y-2 text-xs text-muted-foreground">
        <p>
          The following professionals can access your{" "}
          <span className="font-semibold">Functional Wellness Index</span> and
          high-level trends. They{" "}
          <span className="font-semibold">do not</span> see raw meal logs,
          workout notes, journals, or medical documents by default.
        </p>

        <ul className="list-disc pl-4 space-y-1">
          {visibleRoles.map((role) => {
            const rule = getVisibilityRule(role);
            return (
              <li key={role}>
                <span className="font-semibold">{rule.label}:</span>{" "}
                {rule.description}
              </li>
            );
          })}
        </ul>

        <p className="text-[11px]">
          All professional access is derived from your consent on this Care
          Team screen. Secure messaging is designed for end-to-end
          encryption with post-quantum key exchange and xx.network&apos;s
          cMixx for metadata protection. You can revoke access at any time.
        </p>
      </div>
    </SectionCard>
  );
}
