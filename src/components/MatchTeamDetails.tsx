import { playerMap } from "@/data/team";
import { TeamDetails } from "@/data/matches";

const PlayerBadge = ({ initials }: { initials: string }) => {
  const player = playerMap.get(initials);
  if (!player) return <span className="text-xs text-muted-foreground">{initials}</span>;
  return (
    <span className="flex items-center gap-1.5 min-w-0">
      {player.number != null && (
        <span className="w-6 h-5 rounded bg-primary/10 text-primary text-[10px] flex items-center justify-center font-bold shrink-0">
          {player.number}
        </span>
      )}
      <span className="truncate text-xs text-foreground">{player.name}</span>
    </span>
  );
};

const MatchTeamDetails = ({ name, details }: { name: string; details: TeamDetails }) => {
  const scorers = new Map<string, { count: number; minutes: number[] }>();
  for (const goal of details.goalscorers) {
    const scorer = scorers.get(goal.player) ?? { count: 0, minutes: [] };
    scorer.count += 1;
    if (goal.minute != null) scorer.minutes.push(goal.minute);
    scorers.set(goal.player, scorer);
  }

  return (
  <div className="flex-1 min-w-0">
    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 truncate">
      {name}
    </p>

    <div className="mb-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-1.5">
        ⚽ Strelci
      </p>
      {details.goalscorers.length > 0 ? (
        <ul className="space-y-1">
          {Array.from(scorers, ([player, scorer]) => (
            <li key={player} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 min-w-0">
                <PlayerBadge initials={player} />
                {scorer.count > 1 && (
                  <span className="text-xs font-semibold text-foreground shrink-0">{scorer.count}x</span>
                )}
              </span>
              {scorer.minutes.length > 0 && (
                <span className="text-muted-foreground text-xs shrink-0">{scorer.minutes.map((minute) => `${minute}'`).join(", ")}</span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground italic">—</p>
      )}
    </div>

    <div className="mb-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-1.5">
        Postava
      </p>
      {details.lineup.length > 0 ? (
        <ul className="space-y-1">
          {details.lineup.map((initials, i) => (
            <li key={i}>
              <PlayerBadge initials={initials} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground italic">—</p>
      )}
    </div>

    {details.substitutions && details.substitutions.length > 0 && (
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-1.5">
          Klop
        </p>
        <ul className="space-y-1">
          {details.substitutions.map((initials, i) => (
            <li key={i}>
              <PlayerBadge initials={initials} />
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
  );
};

export default MatchTeamDetails;
