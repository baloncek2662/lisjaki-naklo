import { User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { teamData } from "@/data/team";

const TeamSection = () => {
  return (
    <section id="team" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ekipa
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Spoznajte igralce NK Lisjaki Naklo
          </p>
        </div>

        <div className="space-y-12">
          {teamData.map((group) => (
            <div key={group.title}>
              <h3 className="text-xl md:text-2xl font-bold text-primary mb-6 text-center">
                {group.title}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {group.players.map((player) => (
                  <Card
                    key={player.number}
                    className="border-border hover:shadow-elevated hover:border-primary/30 transition-all duration-300 group"
                  >
                    <CardContent className="p-4 text-center">
                      <div className="w-16 h-16 mx-auto mb-3 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <User className="text-primary" size={32} />
                      </div>
                      <span className="inline-block bg-primary text-primary-foreground text-sm font-bold px-3 py-1 rounded-full mb-2">
                        #{player.number}
                      </span>
                      <p className="font-semibold text-foreground text-sm">
                        {player.name}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;