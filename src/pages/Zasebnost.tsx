import type { ReactNode } from "react";
import { ShieldCheck, ArrowUpRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Head } from "vite-react-ssg";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PrivacySection = ({ title, value, children }: { title: string; value: string; children: ReactNode }) => (
  <AccordionItem value={value} className="border-0">
    <AccordionTrigger className="min-h-16 gap-4 rounded-2xl border border-border bg-background px-6 py-5 text-left text-base font-semibold shadow-sm hover:border-primary/40 hover:bg-accent/40 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 data-[state=open]:border-primary/30 data-[state=open]:bg-accent data-[state=open]:text-primary md:px-8 md:text-lg [&>svg]:h-5 [&>svg]:w-5">
      {title}
    </AccordionTrigger>
    <AccordionContent className="px-6 pb-4 pt-6 text-base leading-7 text-muted-foreground md:px-8 [&_p+p]:mt-4 [&_ul]:space-y-5 [&_strong]:font-semibold [&_strong]:text-foreground [&_a]:break-words [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4">
      {children}
    </AccordionContent>
  </AccordionItem>
);

const Zasebnost = () => (
  <div className="min-h-screen bg-background">
    <Head>
      <title>Zasebnost in piškotki | ŠD Lisjaki Naklo</title>
    </Head>
    <Navbar />

    <main className="pt-16 md:pt-20">
      <header className="border-b border-border/60 bg-secondary/60 py-14 md:py-20">
        <div className="container mx-auto max-w-3xl px-4">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            <ShieldCheck size={16} aria-hidden="true" /> Vaša zasebnost
          </div>
          <h1 className="mb-5 text-4xl font-bold tracking-tight text-secondary-foreground md:text-5xl">
            Zasebnost in piškotki
          </h1>
          <p className="max-w-xl text-lg leading-8 text-muted-foreground">
            Kako uporabljamo osebne podatke obiskovalcev, igralcev in udeležencev naših dogodkov.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
        <Accordion type="multiple" className="space-y-4" aria-label="Vprašanja o zasebnosti">
        <PrivacySection value="privacy-1" title="Kdo skrbi za moje osebne podatke?">
        <p>
          Upravljavec osebnih podatkov na spletnem mestu lisjaki-naklo.si je Športno društvo
          Lisjaki Naklo, Strahinj 51A, 4202 Naklo (matična številka 4116925000).
          Za vprašanja o osebnih
          podatkih, popravek rezultatov ali zahtevo glede objavljene fotografije nam pišite na{" "}
          <a href="mailto:lisjaki.naklo@gmail.com">lisjaki.naklo@gmail.com</a>.
        </p>

        </PrivacySection>

        <PrivacySection value="privacy-2" title="Katere podatke zbirate in zakaj?">
        <ul>
          <li>
            <strong>Obisk spletnega mesta.</strong> Pri prikazu in zaščiti strani se obdelujejo
            tehnični podatki, kot so naslov IP, zahtevani spletni naslov, čas dostopa in podatki
            o brskalniku. Namen je omogočiti delovanje strani, odpraviti napake in preprečevati
            zlorabe; pravna podlaga je zakoniti interes za varno in zanesljivo spletno mesto
            (člen 6(1)(f) GDPR).
          </li>
          <li>
            <strong>Sporočila.</strong> Če nam pišete, uporabljamo vaš elektronski naslov, ime,
            če ga navedete, in vsebino sporočila za obravnavo vprašanja. Podlaga je zakoniti
            interes za komunikacijo; pri dogovarjanju o udeležbi oziroma izpolnjevanju dogovora
            pa člen 6(1)(b) GDPR. Pošto prejemamo prek storitve Gmail.
          </li>
          <li>
            <strong>Tekme, statistika in turnirji.</strong> Uporabljamo imena igralcev, ekipe,
            nastope, rezultate in uvrstitve. Za vodenje turnirja beležimo tudi spol za sestavo
            ekip ter oznake prisotnosti in odstopa. Podatke pridobimo od
            udeležencev, organizatorjev in iz zapisnikov tekem. Nujna obdelava za izvedbo
            dogovorjene udeležbe temelji na členu 6(1)(b) GDPR; poročanje o športnem dogajanju
            in objava rezultatov na zakonitem interesu društva in javnosti za spremljanje
            tekmovanj (člen 6(1)(f) GDPR). Brez podatkov, potrebnih za prijavo in razporeditev,
            udeležbe ne moremo ustrezno evidentirati.
          </li>
          <li>
            <strong>Novice in fotografije.</strong> Objavljamo poročila in fotografije dejavnosti
            društva. Za obveščanje javnosti o lastnih dogodkih upoštevamo pogoje tretjega
            odstavka 93. člena ZVOP-2, vključno z možnostjo prepovedi takšne obdelave.
            Kadar je za posamezno uporabo potrebna privolitev, je podlaga člen 6(1)(a) GDPR.
            Sama udeležba na dogodku ne pomeni neomejene privolitve v vse uporabe fotografij.
          </li>
          <li>
            <strong>Dostop organizatorjev.</strong> Za preverjanje dovoljenega dostopa in
            sledljivost sprememb obdelujemo prijavni elektronski naslov ter čas spremembe.
            Podlaga je zakoniti interes za zaščito podatkov in preprečevanje nepooblaščenih
            sprememb (člen 6(1)(f) GDPR).
          </li>
        </ul>

        </PrivacySection>

        <PrivacySection value="privacy-3" title="Kateri moji podatki so javni?">
        <p>
          Novice, galerije, imena igralcev, statistika in rezultati so javno dostopni ter jih
          lahko najdejo tudi spletni iskalniki. Javno dostopni podatki turnirja vključujejo
          tudi spol ter oznaki prisotnosti in odstopa igralcev, čeprav te oznake niso prikazane
          na javni lestvici.
        </p>
        <p>
          Če želite opozoriti na netočen podatek ali nasprotujete objavi, nam sporočite, za
          katero stran, fotografijo ali zapis gre. Pri fotografiranju dogodkov se lahko obrnete
          tudi neposredno na organizatorja. Zahtevo obravnavamo glede na namen objave,
          pravno podlago in vaše pravice.
        </p>

        </PrivacySection>

        <PrivacySection value="privacy-4" title="Kdo še prejme moje podatke?">
        <p>
          Za gostovanje, dostavo vsebin, shranjevanje turnirskih podatkov in zaščito dostopa
          uporabljamo Cloudflare. Do podatkov lahko v okviru svojih nalog dostopajo pooblaščeni
          organizatorji in ponudniki tehničnih storitev. Podatke lahko posredujemo tudi pristojnim
          organom, kadar to zahteva zakon.
        </p>
        <p>
          Stran nalaga pisavo iz storitve Google Fonts, pri eni od novic pa sliko iz storitve
          Unsplash. Ob nalaganju teh vsebin brskalnik ponudniku posreduje naslov IP in podatke
          spletne zahteve. Povezavi na Facebook in Instagram sta običajni povezavi; njuni strani
          se odpreta šele ob kliku.
        </p>
        <p>
          Mednarodni ponudniki lahko podatke obdelujejo tudi zunaj Evropskega gospodarskega
          prostora, med drugim v ZDA. Uporabljeni mehanizmi varstva so odvisni od ponudnika in
          storitve, na primer sklep o ustreznosti ali standardne pogodbene klavzule. Več informacij
          je na voljo v{" "}
          <a href="https://www.cloudflare.com/cloudflare-customer-dpa/">pogojih obdelave podatkov Cloudflare</a>,{" "}
          <a href="https://policies.google.com/privacy">pravilniku o zasebnosti Google</a> in{" "}
          <a href="https://unsplash.com/privacy">pravilniku o zasebnosti Unsplash</a>.
          Za pojasnila o prejemnikih in ustreznih zaščitnih ukrepih nam lahko pišete.
        </p>

        </PrivacySection>

        <PrivacySection value="privacy-5" title="Kako dolgo hranite podatke?">
        <p>
          Sporočila hranimo toliko časa, kolikor je potrebno za obravnavo zadeve in morebitnih
          povezanih zahtevkov. Novice, fotografije in športni rezultati so del pregleda dejavnosti
          društva; njihova objava ni vezana na vnaprej določen datum samodejnega izbrisa, temveč
          na nadaljnji namen obveščanja in dokumentiranja dejavnosti ter tehtanje pravic posameznikov.
        </p>
        <p>
          Sistem turnirja hrani trenutno stanje in največ 50 zadnjih različic za obnovo ter
          sledljivost sprememb. Starejše različice se odstranjujejo ob novih spremembah, zato to
          ni rok v dnevih. Hramba tehničnih in prijavnih zapisov je odvisna od uporabljene storitve
          in njenih nastavitev. Za informacije o hrambi konkretnega podatka nas kontaktirajte.
        </p>

        </PrivacySection>

        <PrivacySection value="privacy-6" title="Ali spletna stran uporablja piškotke?">
        <p>
          Piškotki so majhne datoteke, ki jih spletna storitev shrani v brskalnik. Spletna
          aplikacija ne dodaja oglaševalskih piškotkov ali orodij za sledenje obiskovalcem za
          trženje. Za zaščiteno prijavo organizatorjev Cloudflare Access uporablja prijavne
          piškotke, potrebne za preverjanje in ohranjanje dostopa. Cloudflare lahko glede na
          varnostne preverbe uporabi tudi piškotke za zaščito pred zlorabami.
        </p>
        <p>
          Za piškotke, nujne za izrecno zahtevano storitev, predhodna privolitev ni potrebna.
          Piškotke lahko izbrišete ali omejite v nastavitvah brskalnika; to lahko prepreči
          prijavo organizatorjev. Če uvedemo piškotke ali podobne tehnologije, za katere je
          potrebna privolitev, jo bomo pridobili pred njihovo uporabo.
        </p>

        </PrivacySection>

        <PrivacySection value="privacy-7" title="Katere pravice imam in kako jih uveljavim?">
        <p>
          Pod pogoji GDPR lahko zahtevate dostop do svojih podatkov, popravek, izbris,
          omejitev obdelave in prenosljivost podatkov. Obdelavi na podlagi zakonitega interesa
          lahko ugovarjate iz razlogov, povezanih z vašim posebnim položajem. Kadar obdelava
          temelji na privolitvi, jo lahko kadar koli prekličete; preklic ne vpliva na zakonitost
          obdelave pred preklicem.
        </p>
        <p>
          Zahtevo pošljite na <a href="mailto:lisjaki.naklo@gmail.com">lisjaki.naklo@gmail.com</a>.
          Odgovorimo praviloma v enem mesecu; ob zakonsko dopustnem podaljšanju vas o tem in
          razlogih obvestimo. Za varno obravnavo lahko zahtevamo dodatne informacije za
          preverjanje identitete, kadar je to potrebno.
        </p>
        <p>
          Pritožbo lahko vložite pri{" "}
          <a href="https://www.ip-rs.si/">Informacijskem pooblaščencu Republike Slovenije</a>.
          To obvestilo posodobimo ob spremembah obdelave.
        </p>
        </PrivacySection>
        </Accordion>
        <aside className="mt-10 flex flex-col gap-4 rounded-2xl bg-secondary px-6 py-7 sm:flex-row sm:items-center sm:justify-between md:px-8">
          <div>
            <h2 className="text-base font-semibold">Imate še kakšno vprašanje?</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Za pojasnila ali zahteve nam pišite.</p>
          </div>
          <a href="mailto:lisjaki.naklo@gmail.com" className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition-colors hover:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4">
            Pišite nam <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </aside>
      </div>
    </main>

    <Footer />
  </div>
);

export default Zasebnost;
