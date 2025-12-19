import { Card, CardContent } from "@/components/ui/card";

const sponsors = [
  { name: "PORENTA TRADE d.o.o." },
  { name: "BLAŽ LOGONDER S.P." },
];

const SponsorsSection = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Hvala našim sponzorjem
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Brez podpore naših zvestih sponzorjev bi bil naš klub nepopoln. Hvala vam za zaupanje!
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {sponsors.map((sponsor, index) => (
            <Card 
              key={index} 
              className="bg-card hover:shadow-lg transition-shadow duration-300 border-primary/20"
            >
              <CardContent className="flex items-center justify-center p-8 min-w-[250px]">
                <span className="text-lg font-semibold text-foreground">
                  {sponsor.name}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SponsorsSection;
