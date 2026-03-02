import { Card, CardContent } from "@/components/ui/card";

const sponsors = [
  { name: "Porenta Trade d.o.o.", logo: "/images/sponsors/PorentaTrade-B4.png" },
  { name: "Blaž Logonder s.p.",   logo: "/images/sponsors/Logonder-B.png" },
  { name: "Infogram",             logo: "/images/sponsors/Infogram-B.png" },
  { name: "KTech",                logo: "/images/sponsors/KTech-B.png" },
  { name: "Mital",                logo: "/images/sponsors/Mital-B4.png" },
  { name: "Peric",                logo: "/images/sponsors/Peric-B.png" },
  { name: "Brivnica Rogelj",      logo: "/images/sponsors/Rogelj-B.png" },
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

        <div className="flex flex-wrap justify-center gap-6">
          {sponsors.map((sponsor, index) => (
            <Card
              key={index}
              className="bg-card hover:shadow-lg transition-shadow duration-300 border-primary/20"
            >
              <CardContent className="flex items-center justify-center p-6 w-[220px] h-[120px]">
                {sponsor.logo ? (
                  <img
                    src={sponsor.logo}
                    alt={sponsor.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-base font-semibold text-foreground">
                    {sponsor.name}
                  </span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SponsorsSection;
