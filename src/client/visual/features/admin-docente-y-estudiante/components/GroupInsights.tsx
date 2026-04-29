import type { GroupInsightsResult } from "../hooks/useGroupInsights";
import Leaderboard from "../../escenarios-simulados/components/Leaderboard";
import styles from "../styles/GroupInsights.module.css";

interface Props {
  data: GroupInsightsResult;
  groupName: string;
}

function completionColor(pct: number): string {
  if (pct >= 70) return "#34d399";
  if (pct >= 40) return "#fbbf24";
  return "#f87171";
}

const DIST_ITEMS = [
  { key: "primerIntento" as const, label: "Primer intento", color: "#34d399" },
  { key: "dosATres" as const, label: "2-3 intentos", color: "#fbbf24" },
  { key: "cuatroOMas" as const, label: "4+ intentos", color: "#f87171" },
  { key: "sinCompletar" as const, label: "Sin completar", color: "#6b7280" },
];

export default function GroupInsights({ data, groupName }: Props) {
  const { leaderboard, scenarios, distribution, loading, error } = data;

  if (loading) {
    return <div className={styles.loading}>Cargando insights...</div>;
  }

  if (error || (leaderboard.length === 0 && scenarios.length === 0)) {
    return null;
  }

  const totalDist =
    distribution.primerIntento +
    distribution.dosATres +
    distribution.cuatroOMas +
    distribution.sinCompletar;

  return (
    <div className={styles.grid}>
      <div className={styles.chartsColumn}>
        {scenarios.length > 0 && (
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Completitud por laboratorio</h3>
            <div className={styles.barList}>
              {scenarios.map((s) => {
                const pct = s.total > 0 ? (s.completados / s.total) * 100 : 0;
                return (
                  <div key={s.nombre} className={styles.barItem}>
                    <div className={styles.barLabel}>
                      <span className={styles.barName}>{s.nombre}</span>
                      <span className={styles.barValue}>
                        {s.completados}/{s.total}
                      </span>
                    </div>
                    <div className={styles.barTrack}>
                      <div
                        className={styles.barFill}
                        style={{ width: `${pct}%`, background: completionColor(pct) }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {totalDist > 0 && (
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Distribucion de intentos</h3>
            <div className={styles.distList}>
              {DIST_ITEMS.map(({ key, label, color }) => {
                const value = distribution[key];
                const pct = (value / totalDist) * 100;
                return (
                  <div key={key} className={styles.distItem}>
                    <div className={styles.distLabel}>
                      <span className={styles.distDot} style={{ background: color }} />
                      <span>{label}</span>
                      <span className={styles.distValue}>
                        {value} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className={styles.barTrack}>
                      <div
                        className={styles.barFill}
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className={styles.leaderboardWrapper}>
        <Leaderboard
          entries={leaderboard}
          groupName={groupName}
          loading={false}
          error={null}
          currentStudentId={null}
        />
      </div>
    </div>
  );
}
