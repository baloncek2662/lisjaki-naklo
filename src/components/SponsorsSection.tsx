import { Card, CardContent } from "@/components/ui/card";

const platinumSponsors = [
  { name: "PORENTA TRADE d.o.o." },
  { name: "BLAŽ LOGONDER S.P." },
  { name: "BAR GOLDEN EYE NAKLO" },
];

const goldSponsors = [
  { name: "Brivnica Rogelj" },
];

const SponsorsSection = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Uradni sponzorji ŠD Lisjaki Naklo
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Delovanje našega kluba brez podpore naših zvestih sponzorjev ne bi bilo mogoče. Hvala vam za zaupanje!
          </p>
        </div>

        {/* Platinasti sponzorji */}
        <div className="mb-10">
          <div className="flex flex-wrap justify-center gap-6">
            {platinumSponsors.map((sponsor, index) => (
              <Card
                key={index}
                className="bg-card hover:shadow-lg transition-shadow duration-300 border-primary/30"
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

        {/* Zlati sponzorji */}
        <div>
          <div className="flex flex-wrap justify-center gap-6">
            {goldSponsors.map((sponsor, index) => (
              <Card
                key={index}
                className="bg-card hover:shadow-md transition-shadow duration-300 border-primary/20"
              >
                <CardContent className="flex items-center justify-center p-6 min-w-[200px]">
                  <span className="text-base font-medium text-foreground">
                    {sponsor.name}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SponsorsSection;
