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

const MatchTeamDetails = ({ name, details }: { name: string; details: TeamDetails }) => (
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
          {details.goalscorers.map((g, i) => (
            <li key={i} className="flex items-center justify-between gap-2">
              <PlayerBadge initials={g.player} />
              {g.minute != null && (
                <span className="text-muted-foreground text-xs shrink-0">{g.minute}&apos;</span>
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

export default MatchTeamDetails;
