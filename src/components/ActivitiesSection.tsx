import { Card, CardContent } from "@/components/ui/card";
import { Dribbble, Volleyball, Bus } from "lucide-react";

const activities = [
  {
    icon: Dribbble,
    title: "Košarka",
    description:
      "Tedenski rekreacijski treningi košarke za vse člane. Zabava in gibanje v družbi prijateljev.",
  },
  {
    icon: Volleyball,
    title: "Odbojka",
    description:
      "Mešane ekipe za odbojkarske turnirje. Pridruži se nam na plaži ali v dvorani!",
  },
  {
    icon: Bus,
    title: "Izleti",
    description:
      "Skupinska potovanja na tekme slovenske reprezentance in evropske lige.",
  },
];

const ActivitiesSection = () => {
  return (
    <section id="activities" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Več kot nogomet
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Pri Lisjakih ne gre samo za nogomet. Skupnost, prijateljstvo in zabava so temelj našega kluba.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {activities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <Card
                key={activity.title}
                className="text-center p-6 shadow-card hover:shadow-elevated transition-all duration-300 border-0 hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <CardContent className="p-0">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent flex items-center justify-center">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-xl text-foreground mb-3">
                    {activity.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {activity.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ActivitiesSection;
