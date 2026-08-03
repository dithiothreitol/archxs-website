# ArchXS.com — plan implementacji nowej strony

Wersja 1.0 · 2026-08-03 · dokument wykonawczy (spec-as-source-of-truth, do realizacji fazami przez agentów Claude Code)

Źródła analizy: inwentaryzacja `Documents\Projekty` (21 projektów, ~4 500 commitów, ekosystem GGPF/PetMarket),
inwentaryzacja `Documents\GitHub` (17 unikalnych projektów, ~590 kontraktów Solidity, ea-skills, Keycloak SPI),
profil `LinkedIn_zmiany_final_2026-07.md`, wzorzec techniczny `bindaro-io-landing`.

---

## 0. Streszczenie wykonawcze

Nowa strona ArchXS.com to **witryna butikowej praktyki doradczo-inżynierskiej**, nie osobiste CV.
Prezentuje pięć obszarów praktyki (architektura korporacyjna, procesy biznesowe, cyberbezpieczeństwo
i tożsamość, AI i automatyzacja, wytwarzanie oprogramowania) i dowodzi ich **artefaktami, nie biografią**:
publicznymi wdrożeniami, projektami open source, anonimizowanymi studiami przypadków z metrykami.
Informacje osobiste ograniczone do jednej krótkiej noty założycielskiej z certyfikacjami.

Stack: **Next.js 16 + Tailwind v4 + shadcn/ui + next-intl (PL/EN)**, static export na GitHub Pages
(obecny hosting + CNAME archxs.com), pipeline grafik Gemini skopiowany 1:1 z bindaro-io-landing
z własnym `ARCHXS_STYLE_GUIDE`. SEO klasyczne + GEO/AEO (JSON-LD, llms.txt, robots otwarte na
crawlery AI, treść pisana „pod cytowanie"). Konwersja przez **incepcję, nie sprzedaż** (§7):
strona jest prezentacją nienachalnego profesjonalizmu — bez szkoleń, pakietów i cenników;
eseje-stanowiska i dowody z praktyki mają sprawić, że czytelnik sam dochodzi do wniosku
„potrzebuję rozmowy z nimi". Jedyne CTA: dyskretne „Porozmawiajmy" (booking + krótki formularz),
analityka cookieless.

Realizacja w 5 fazach; MVP publikowalne po fazie 2.

---

## 1. Cele i pozycjonowanie

### 1.1 Cel biznesowy

1. Leady na **doradztwo**: przeglądy architektury, strategia AI, fractional CTO/CIO, bezpieczeństwo i tożsamość.
2. Leady na **wytwarzanie oprogramowania**: systemy szyte na miarę (web+mobile+backend), automatyzacja procesów, integracje ERP/IdP.
3. Wiarygodność cytowalna przez wyszukiwarki klasyczne **i agentowe** (ChatGPT/Claude/Perplexity/AI Overviews) — strona ma być źródłem, które AI przywołuje przy pytaniach typu „konsultant architektury korporacyjnej Polska", „wdrożenie AI w firmie produkcyjnej", „Keycloak web3 authentication expert".

### 1.2 Pozycjonowanie (jedno zdanie, wersja robocza)

> **PL:** ArchXS — butikowa praktyka doradczo-inżynierska: architektura, AI i bezpieczeństwo, które
> weryfikujemy własnym kodem produkcyjnym, nie slajdami.
>
> **EN:** ArchXS — a boutique advisory & engineering practice: architecture, AI and security we
> validate with production code, not slide decks.

Kluczowy wyróżnik (spójny z narracją LinkedIn, ale bez eksponowania osoby): **practitioner-advisor** —
każda rekomendacja poparta praktyką wykonawczą. To rzadkie połączenie: poziom zarządczy (enterprise
architecture, governance, compliance) + zdolność samodzielnego zbudowania i wdrożenia systemu.

### 1.3 Anty-cele (czego strona świadomie NIE robi)

- **Nie jest CV ani personal brandem** — minimum informacji o osobie (wymóg zamawiającego). Głos „my"/„practice", nie „ja". Bez zdjęć portretowych, bez osi czasu kariery, bez listy pracodawców na stronie głównej.
- **Nie sprzedaje wprost** — żadnych szkoleń, warsztatów, webinarów, pakietów z cennikiem, popupów, „bezpłatnych konsultacji". Strona działa na zasadzie **incepcji** (§7): lektura ma sama wytworzyć w czytelniku wniosek „potrzebujemy kogoś, kto tak myśli" — kontakt jest jego decyzją, nie efektem nacisku.
- Nie wylicza technologii jako ściany logotypów — technologie pojawiają się wyłącznie w kontekście rozwiązanego problemu (ta sama zasada „zero wyliczanek", którą przyjęto na LinkedIn).
- Nie konkuruje ceną ani nie wygląda jak strona software house'u z bannerem „hire dedicated developers".
- Nie obiecuje web3/NFT jako oferty pierwszego planu — blockchain występuje w ramie zarządczo-produktowej (tożsamość, tokenizacja, regulacje), zgodnie z ustaleniem z analizy LinkedIn (token „Web3" ściągał niewłaściwy inbound).

### 1.4 Grupy docelowe (ICP)

| Segment | Kto | Czego szuka | Co konwertuje |
|---|---|---|---|
| A. Zarządy/właściciele mid-market (PL) | CEO/CFO firm 50–500 osób w transformacji | „czy nasz plan AI/IT jest realny", drugi głos przy vendorach | pakiet diagnostyczny o stałej cenie/zakresie |
| B. Dyrektorzy IT/CIO | szefowie IT w korporacjach i spółkach SP | przegląd architektury, governance, EA-as-a-service | studia przypadków skali (bank, core banking) |
| C. Founderzy / fintech / regtech | startupy w reżimie regulacyjnym (KNF, MiCA, eIDAS, AI Act) | CTO-as-a-service, architektura od zera do produkcji | case StockAmbit, compliance-by-design |
| D. Firmy potrzebujące systemu | operacje na Excelu/mailu, integracje ERP | wytworzenie systemu + automatyzacja AI | konkretne przykłady: docflow/KSeF, APS, ATS |

Języki: **PL + EN** na start (researcherzy i klienci międzynarodowi szukają po angielsku, decydenci
mid-marketu czytają po polsku — ta sama logika co dwujęzyczny profil LinkedIn). Architektura i18n
gotowa na dokładanie kolejnych locale (wzorzec bindaro: 4 locale, ggpf-web: 10).

---

## 2. Obszary praktyki i model współpracy

Pięć obszarów praktyki — ale opisanych **nie jak katalog usług, tylko jak stanowiska eksperckie**:
każda podstrona to krótki esej z tezą, dowodami i konsekwencjami dla czytelnika. Wzorzec opisowy:
*jak patrzymy na ten problem (reframe) → co widzieliśmy w praktyce (dowód) → co z tego wynika
dla Twojej organizacji (konsekwencja)*. Czytelnik nie znajduje oferty do kupienia — znajduje sposób
myślenia, który chce mieć po swojej stronie. Słowa zakazane w copy: „oferujemy", „nasza oferta",
„zamów", „pakiet", „szkolenie".

### 2.1 Architektura korporacyjna i przeglądy architektury
- Przegląd architektury (application portfolio, TIME, capability map), architektura docelowa i roadmapa, governance (architecture board, ADR, standardy z cyklem życia), architektura dużych transformacji (wymiana systemów core).
- Artefakty: opis architektury wg ISO/IEC/IEEE 42010, model ArchiMate 3.2, rejestr decyzji, plan migracji.
- Dowody: praktyka Chief Architect w banku państwowym (core banking, 300+ IT, Architecture Review Board); **ea-skills** — własny, publiczny toolchain EA (ArchiMate Open Exchange walidowany XSD, ISO 42010, governance z dyspensami i bramką CI).

### 2.2 Procesy biznesowe i ich automatyzacja
- Analiza AS-IS z policzonymi stratami → projekt TO-BE → wdrożenie: BPMN/workflow, state machines, integracje ERP/CRM (outbox, idempotencja), human-in-the-loop.
- Dowody (anonimizowane): obieg dokumentów + KSeF FA(3) + windykacja do e-Sądu (EPU) w jednym systemie; planowanie produkcji S&OP→MPS z solverem CP-SAT wg ISA-95; ATS z compliance EU AI Act; automatyzacja marketingu (19 workflow n8n z banditami).

### 2.3 Cyberbezpieczeństwo i tożsamość cyfrowa
- Architektura bezpieczeństwa, IAM (Keycloak/OIDC na poziomie SPI, nie konfiguracji), MFA/passkeys, multi-tenant security (RLS, ABAC), audyt append-only (hash-chain), bezpieczeństwo łańcucha dostaw (SBOM, cosign, skan CI), compliance: RODO/DPIA, eIDAS, EU AI Act, PCI-DSS (tło płatnicze).
- Dowody: własne rozszerzenia Keycloak (web3 auth EIP-191, OTP, passkeys — publiczne repo), pakiet npm `@archxs/keycloak-wagmi` (ERC-4337/embedded wallets), architektura zaufania z niezaufanym klientem (tic-bot-toe: serwerowa walidacja każdej gry, BYOK).

### 2.4 AI i automatyzacja (applied AI)
- Strategia AI możliwa do obrony przed zarządem: co automatyzować, co nie, jaki koszt, jakie ryzyko; wdrożenia: agenci z narzędziami (MCP), RAG, OCR dokumentów, kaskady modeli po koszcie, observability kosztów (Langfuse), fine-tuning i ML on-device.
- Doktryna praktyki (unikatowa, cytowalna treść): **„AI proponuje, człowiek decyduje"** — deterministyczne bramki obok LLM, weryfikacja wielowarstwowa, redakcja PII przed modelem, human-gate na każdej akcji zewnętrznej. To jest nasz „named framework" do pozycjonowania w AI search (jak „Architect Elevator" Hohpego).
- Dowody: hub AI z 6 serwerami MCP i gatewayem WhatsApp; weryfikator etykiet z 5 warstwami kontroli rzetelności; audyt półkowy vision-AI (2 827 zdjęć → 26 864 obserwacje); arena ewaluacji LLM (żywy produkt public).

### 2.5 Wytwarzanie oprogramowania
- Systemy end-to-end: web + mobile z jednego kodu (Next.js/Expo), backendy Java/Quarkus i Python/FastAPI, e-commerce (Medusa), integracje (Comarch ERP XL, Microsoft Graph, WhatsApp Business, płatności PayU/BLIK/Apple Pay), IoT/OT (OPC UA, MQTT).
- Wyróżnik procesowy: **AI-augmented delivery** — wytwarzanie z agentami AI w cyklu (spec-driven, plany z DoD, golden testy, property-based testing) = tempo małego zespołu przy dyscyplinie dużego. Skala dowodu: ~4 500 commitów / 5 miesięcy / ~10 systemów na wspólnej platformie.

### 2.6 Formy współpracy (jedna dyskretna strona /engage, bez cennika)

Formy współpracy NIE są elementem nawigacji sprzedażowej ani kart z cenami. Istnieje jedna,
spokojna strona „Współpraca" opisująca, **jak zwykle zaczyna się zaangażowanie** — narracyjnie,
w tonie „tak to u nas wygląda", nie „wybierz pakiet":

1. **Każda współpraca zaczyna się rozmową** — bez zobowiązań, bez „bezpłatnej konsultacji" jako wabika; po prostu rozmowa o problemie. Jeśli nie jesteśmy właściwym adresem, mówimy to wprost i wskazujemy kierunek.
2. Z rozmowy zwykle wynika jedna z form: **diagnoza / second opinion** (krótkie, intensywne spojrzenie na architekturę, plan AI lub bezpieczeństwo — kończy się raportem i roadmapą), **doradztwo ciągłe / fractional CTO–CIO** (stała obecność zarządczo-techniczna), **delivery** (wytworzenie systemu end-to-end z pełnym przekazaniem: dokumentacja, ADR-y, runbooki), **nadzór architektoniczny** (architecture-as-a-service dla organizacji bez własnego architekta).
3. **Sygnał selektywności**: prowadzimy kilka zaangażowań jednocześnie — nie skalujemy zespołem, skalujemy metodą. (Rzadkość podnosi wartość i odsiewa leady cenowe.)

Cennik, widełki i zakresy pojawiają się dopiero w rozmowie — kwalifikacja odbywa się tam,
nie na stronie.

---

## 3. Zakres informacyjny i architektura treści (sitemap)

Wzorce, z których czerpiemy (najlepsze znane praktyki stron ekspertów/praktyk butikowych):
- **Gregor Hohpe / architectelevator.com** — nazwany framework + książki/eseje jako dowód, minimalna biografia;
- **martinfowler.com** — treść merytoryczna jako główny magnes, autorytet przez definicje pojęć (idealne pod GEO);
- **butikowe konsultancje (Equal Experts, Container Solutions, mniejsze praktyki solo)** — usługi opisane rezultatem, case studies z metrykami, produktyzowane pakiety wejściowe;
- **wzorzec „proof-of-work"** — open source i żywe produkty zamiast referencji-logotypów (dobrze pasuje do wymogu minimalnej ekspozycji osoby).

### 3.1 Struktura stron

```
/                       Strona główna (jednoekranowe sekcje, patrz 3.2)
/practice               Obszary praktyki (hub esejów-stanowisk, nie katalog usług)
/practice/enterprise-architecture
/practice/business-process-automation
/practice/cybersecurity-identity
/practice/applied-ai
/practice/software-delivery
/work                   Studia przypadków (hub) — 6–8 pozycji
/work/[slug]            Pojedyncze studium (szablon: kontekst → wyzwanie → podejście → rezultat → stack)
/insights               Artykuły/eseje (hub) — silnik SEO/GEO i główne narzędzie incepcji
/insights/[slug]        Artykuł (MDX)
/method                 „Jak pracujemy" — doktryna, proces, zasady (AI proponuje–człowiek decyduje, ADR-y, human-gate)
/engage                 „Współpraca" — jak zwykle zaczyna się zaangażowanie (§2.6, bez cennika)
/resources              Open source, narzędzia, materiały — rozdawane bez bramki e-mail (§7.3)
/about                  Nota o praktyce (KRÓTKA — patrz 3.3)
/contact                Kontakt + booking („Porozmawiajmy")
/privacy, /terms        Prawne (wymagane też pod formularze)
```

Celowo NIE istnieją: /training, /courses, /pricing, /offer — ich brak jest częścią pozycjonowania.
Uwaga SEO: podstrony /practice zachowują schema `Service` i frazy usługowe w metadanych (patrz §6.3),
więc dalej rankują na zapytania typu „konsultant architektury korporacyjnej" mimo eseistycznej formy.

Każda strona w dwóch locale: `/{pl|en}/...` (localePrefix `always` w trybie static export — wzorzec bindaro).

### 3.2 Strona główna — sekcje w kolejności

1. **Hero** — pozycjonowanie (1.2) + subline z 3 liczbami-dowodami (np. „25+ lat praktyki · systemy od banku rozwoju po halę produkcyjną · kod w produkcji, nie slajdy") + grafika Gemini (izometryczny „blueprint" — patrz §5). CTA tylko dyskretne: tekstowy link „Porozmawiajmy →" — żadnego przycisku „umów bezpłatną konsultację".
2. **Stanowiska** — 3–4 wyraziste tezy praktyki zamiast kart „problemy które rozwiązujemy" (to serce incepcji): np. „Większość planów AI nie przetrwa kontaktu z produkcją — i da się to sprawdzić w dwa tygodnie", „AI proponuje, człowiek decyduje", „Architektura, której nie ma w CI, nie istnieje". Każda teza linkuje do eseju, który ją broni.
3. **Obszary praktyki** — 5 kart (§2.1–2.5), każda z linkiem do podstrony i jednym dowodem.
4. **Metoda** — 3–4 zasady praktyki z „/method" (wyróżnik anty-AI-slop: konkretne, autorskie zasady zamiast ogólników).
5. **Wybrane realizacje** — 3 najmocniejsze case'y (Kryptoznaczek, core banking, platforma AI w produkcji) + link do /work.
6. **Proof-of-work** — pasek: open source (ea-skills, jdg-ksiegowy, keycloak-wagmi), żywe produkty (ticbottoe.lol, bindaro.io), certyfikacje (TOGAF, CGEIT, PMP, PRINCE2, MSP) — bez nazwiska, jako atrybuty praktyki.
7. **Insights teaser** — 3 ostatnie artykuły.
8. **FAQ** (6–8 pytań, JSON-LD FAQPage — sekcja krytyczna dla GEO).
9. **Zakończenie „Porozmawiajmy"** — jedna spokojna sekcja: 2 zdania zaproszenia, booking Cal.com, e-mail contact@archxs.com. Bez formularza-ściany, bez „wyceń swój projekt".

### 3.3 Zasada minimalnej ekspozycji osoby

- `/about` = „**The practice**": 2 akapity o praktyce (geneza: architektura w skali enterprise + nieprzerwana praktyka wykonawcza), lista certyfikacji, sektory doświadczenia (bankowość państwowa, płatności, fintech regulowany, poczta/logistyka, ochrona zdrowia, produkcja), link do LinkedIn. **Bez** nazwiska w treściach marketingowych stron głównych; nazwisko pojawia się wyłącznie: w stopce jako dane rejestrowe firmy (wymóg prawny), w schema.org `founder` (wymóg E-E-A-T — patrz §6.3) i w podpisach artykułów na /insights (autorstwo wzmacnia cytowalność w AI search).
- Studia przypadków pisane od strony **problemu klienta**, nie „moja rola". Firmy publiczne z natury projektu (Poczta Polska — Kryptoznaczek, StockAmbit) nazwane wprost; pozostałe anonimizowane sektorowo („państwowy bank rozwoju", „producent karm private label z partnerami B2B w Europie") — dokładnie jak w opisach LinkedIn, co zapewnia spójność narracji między kanałami.

### 3.4 Studia przypadków — lista startowa (mapowanie dowodów z repo)

| # | Tytuł roboczy | Źródło dowodu | Metryki do użycia |
|---|---|---|---|
| 1 | Blockchain w skali ogólnokrajowej: Kryptoznaczek Poczty Polskiej | publiczne + PDF w repo | produkt narodowego operatora, biznes+prawo+technologia+partnerzy |
| 2 | Architektura wymiany core banking w banku państwowym | LinkedIn (publiczne) | 300+ IT, ARB, 10+ zespołów, największa transformacja w historii banku |
| 3 | Fintech pod nadzorem KNF: od zera do produkcji | StockAmbit (publiczne) | zero→produkcja na Azure, reżim regulacyjny |
| 4 | Platforma AI-first dla producenta (anonimizowana) | ekosystem GGPF | ~10 systemów na wspólnej platformie, APS wg ISA-95, docflow+KSeF, 8–12 h → 5 min (supplier-validator), 2 827 zdjęć → 26 864 obserwacje (shelf-audit) |
| 5 | Tożsamość cyfrowa: Keycloak od SPI po passkeys i web3 | dardion-keycloak, keycloak-wagmi | własne SPI, EIP-191, ERC-4337, anti-replay |
| 6 | Governance architektury jako kod: ea-skills | repo publiczne | ArchiMate 3.2 XSD-validated, ISO 42010, bramka CI |
| 7 | Multi-chain platforma kolekcjonerska z AI (produkt własny) | Bindaro | 237 migracji, 7 języków, EVM+Solana+Tezos+Ordinals, agent AI |
| 8 | Ewaluacja LLM w praktyce: arena z rankingiem Elo | tic-bot-toe (live) | serwerowa walidacja, BYOK, ranking halucynacji |

Uwaga wykonawcza: case 4 wymaga zgody pracodawcy albo pełnej anonimizacji bez nazwy — do decyzji
przed publikacją treści (ryzyko R1, §10). Case'y 1–3 są publiczne na LinkedIn, więc bezpieczne.

### 3.5 /insights — plan startowy treści (silnik GEO)

Minimum 5 artykułów na start (puste „insights" gorsze niż brak sekcji). Tematy dobrane pod zapytania
grupy docelowej i pod cytowalność w AI (definicje, liczby, checklisty, stanowiska):

1. „AI proponuje, człowiek decyduje — architektura odpowiedzialnej automatyzacji" (manifest metody; strona filarowa).
2. „Jak odróżnić realny plan AI od myślenia życzeniowego — checklist dla zarządu" (lead magnet + FAQ).
3. „KSeF 2.0 w praktyce: czego nie mówią wdrożeniowcy" (świeży, regulacyjny, wysokie intencje wyszukiwań PL).
4. „Architektura korporacyjna jako kod: ArchiMate + governance w CI" (pod ea-skills; unikalny globalnie temat EN).
5. „Keycloak poza konfiguracją: kiedy potrzebujesz własnego SPI" (evergreen EN, przyciąga segment C/D).

Format: MDX, 1200–2000 słów, każdy z blokiem „Key takeaways" na górze (AI-parsowalne), schema Article,
data publikacji i aktualizacji.

### 3.6 Ton głosu — nienachalny profesjonalizm (obowiązuje całą treść)

Strona jest prezentacją spokojnej kompetencji, nie stroną sprzedażową. Reguły redakcyjne
(egzekwowane checklistą przy każdym tekście, PL i EN):

- **Understatement zamiast superlatyw**: zero „wiodący", „światowej klasy", „kompleksowy", „innowacyjny". Fakty i liczby mówią same; jeśli zdanie brzmi jak z broszury, wylatuje.
- **Zero języka presji**: żadnych wykrzykników, „już dziś", „nie czekaj", „ostatnie miejsca", odliczania, social-proof-widgetów („dołącz do 500+ firm").
- **Tryb oznajmujący, nie perswazyjny**: „Tak pracujemy. Tak to sprawdzamy. To zbudowaliśmy." zamiast „Pomożemy Ci osiągnąć…".
- **Przyznawanie ograniczeń** buduje wiarygodność: piszemy też, czego nie robimy i kiedy nie jesteśmy właściwym adresem (wzorzec z §2.6.1) — to najmocniejszy pojedynczy sygnał odróżniający od stron sprzedażowych.
- **Czytelnik jest inteligentny**: bez tłumaczenia oczywistości, bez infantylizowania („w dzisiejszym dynamicznym świecie technologia zmienia się szybko…" — zakaz).
- Wzorce tonu: martinfowler.com, dokumentacja techniczna wysokiej klasy, memoranda inwestycyjne — nie landing page'e SaaS.

---

## 4. Stack techniczny i architektura repo

### 4.1 Decyzje

| Obszar | Decyzja | Uzasadnienie |
|---|---|---|
| Framework | **Next.js 16 (App Router) + React 19** | sprawdzony wzorzec bindaro do skopiowania 1:1 (config, seo.ts, routing) |
| Styling | **Tailwind CSS v4 + shadcn/ui + framer-motion** | jw.; utility i keyframes z bindaro są brand-agnostyczne |
| i18n | **next-intl** (pl, en) | wzorzec bindaro/ggpf-web; hreflang + canonicale gotowe w `seo.ts` |
| Treść | **MDX** dla /insights i /work (contentlayer-owy własny loader lub `next-mdx-remote`) | treść w repo, wersjonowana, agent-friendly |
| Hosting | **GitHub Pages + static export** (`STATIC_EXPORT=true`, `.nojekyll`, CNAME bez zmian) | zero kosztów, obecna domena już wpięta; build przez GitHub Actions |
| Formularze | **Web3Forms lub Formspree** (static-friendly, bez backendu) | GH Pages nie ma serwera; spam-protection tokenem + honeypot |
| Booking | **Cal.com** (cloud free tier lub self-hosted) embed na /contact | już znany operacyjnie (używany w ggpf-recruiter) |
| Analityka | **Plausible lub self-hosted Umami** (cookieless) | brak banera zgód = mniejsze tarcie konwersji; eventy CTA |
| Grafiki | pipeline Gemini (§5) + sharp + WebP | wzorzec bindaro |

Świadomie odrzucone: Vercel (hobby tier nie do użytku komercyjnego, a Pro zbędny przy braku SSR),
WordPress/Framer/Webflow (brak kontroli nad GEO-detalami i wzorcem agentowym pracy), formularz przez
własny backend (przerost na start; można dodać później, gdy dojdzie potrzeba CRM).

### 4.2 Struktura repo (docelowa)

```
archxs-website/
├── .github/workflows/deploy.yml       # build + export + deploy na gh-pages
├── next.config.ts                     # flaga STATIC_EXPORT (wzorzec bindaro)
├── src/
│   ├── app/[locale]/                  # strony wg sitemap §3.1
│   │   ├── layout.tsx                 # metadata + JSON-LD Organization/ProfessionalService
│   │   ├── page.tsx                   # home
│   │   ├── services/…  work/…  insights/…  method/  resources/  about/  contact/
│   │   ├── sitemap.ts  robots.ts      # native metadata routes
│   │   └── globals.css                # design tokens §5.1
│   ├── components/{sections,seo,ui}/
│   ├── content/{insights,work}/{pl,en}/*.mdx
│   ├── i18n/routing.ts  messages/{pl,en}.json
│   └── lib/{seo.ts,constants.ts}
├── scripts/
│   ├── generate-archxs-images.ts      # z generate-landing-images.ts (bindaro)
│   ├── generate-infographics.ts       # z architecture-infographic-prompt.ts (retry, logi, aspectRatio)
│   ├── compose-brand-assets.ts        # logo/OG przez sharp (mode: compose — AI nie renderuje tekstu)
│   └── convert-images-to-webp.ts      # NOWY — luka wykryta w bindaro (155 MB → 5 MB po WebP)
├── public/
│   ├── img/{hero,services,work,insights,og}/   # wyłącznie .webp (PNG tylko lokalnie)
│   ├── llms.txt
│   └── Crypto_Stamp_Solution_Offer_ArchXS.pdf  # ZACHOWAĆ — istniejące linki przychodzące
└── PLAN_IMPLEMENTACJI.md              # ten dokument
```

Stary `index.html` zostaje zastąpiony; ścieżka `public/Crypto_Stamp_Solution_Offer_ArchXS.pdf` musi
pozostać identyczna (jest linkowana z zewnątrz i z obecnej strony).

---

## 5. Design — kierunek „Engineering Blueprint" (wyróżnik anty-AI-slop)

### 5.1 Koncepcja

Typowa strona „wygenerowana przez AI" w 2026: ciemny gradient granat→fiolet, glassmorphism, glow,
Inter, generyczne ilustracje 3D. **Odwracamy wszystkie te sygnały** i sięgamy po estetykę naturalnie
wynikającą z marki „Arch": **rysunek techniczny / blueprint architektoniczny**.

- **Tło jasne**: złamana biel „papieru technicznego" `#F7F5F0`, subtelna siatka milimetrowa (CSS, 8px)
  widoczna tylko w sekcjach hero/dividerach. Tryb dark jako wariant „blueprint nocny" (granat kreślarski
  `#0E1B2C`, linie cyjanowe) — przełączany, domyślny jasny (kontra do dark-defaultu AI-stron).
- **Akcent**: pomarańcz kreślarski/„redline" `#E4572E` (znaczniki, podkreślenia, CTA) + atrament `#1A1C1E`.
  Jedna barwa akcentowa, używana oszczędnie — sygnał dojrzałości projektowej.
- **Typografia**: nagłówki — serif editorial (np. **Fraunces** lub Source Serif 4, latin-ext), body —
  humanistyczny sans (np. **Inter/Instrument Sans**), detale techniczne (podpisy rysunków, metryki, kody
  case'ów) — **mono (IBM Plex Mono / JetBrains Mono)**. Serif+mono to kombinacja praktycznie nieobecna
  w AI-generowanych stronach.
- **Język graficzny detali**: wymiarowanie i „adnotacje kreślarskie" — cienkie linie odniesienia,
  znaczniki `⌀`, numeracja sekcji jak arkuszy rysunku (`A-01 HERO`, `A-02 PRACTICE AREAS`), pieczątka
  rewizji w stopce (nr wersji strony + data — mono). Hover: efekt „redline" (podkreślenie szkicowe).
- **Motion**: powściągliwy — reveal on scroll (wzorzec `use-intersection` z bindaro), rysowanie linii
  SVG (stroke-dashoffset) przy diagramach, bez partykli i neonów. `prefers-reduced-motion` respektowane.

### 5.2 Grafiki Gemini — pipeline (adaptacja bindaro)

Kopiujemy szkielet **`architecture-infographic-prompt.ts`** (najdojrzalszy: retry, `imageConfig.aspectRatio`,
`imageSize: "2K"`, zapis promptów do plików, logi generacji) + tryb `compose` z `generate-landing-images.ts`.

**`ARCHXS_STYLE_GUIDE`** (doklejany do każdego promptu — analogicznie do `BINDARO_STYLE_GUIDE`):

```
BRAND ESSENCE: technical blueprint drawing meets modern editorial illustration;
  the calm confidence of an architect's drafting table, not a sci-fi dashboard.
COLOR PALETTE: warm paper #F7F5F0 background, ink #1A1C1E linework,
  drafting-orange #E4572E accents (sparingly), muted steel-blue #46647F fills,
  NO purple, NO neon, NO glassmorphism, NO lens flares.
ART STYLE: isometric or axonometric technical illustration, thin consistent line
  weight (like 0.35mm pen), selective flat fills, subtle paper grain, dimension
  lines and small measurement marks as decoration, generous whitespace.
CONTENT RULES: no human faces, no text unless explicitly listed, no company logos.
TECHNICAL: crisp edges, high detail, print-quality, balanced composition.
```

**Inwentarz grafik (start ~18 sztuk):**

| Grupa | Sztuk | Format | Przykład promptu (SCENE) |
|---|---|---|---|
| Hero (desktop+mobile) | 2 | 16:9 / 9:16 | izometryczny stół kreślarski, na nim „budowla" z warstw systemu: fundament infra → procesy → AI, linie wymiarowe |
| Obszary praktyki | 5 | 4:3 | np. cybersecurity: przekrój twierdzy jako rysunek techniczny z oznaczonymi warstwami kontroli |
| Case studies | 6–8 | 16:9 | np. core banking: aksonometria wymiany fundamentu pod stojącym budynkiem |
| Metoda | 2 | 1:1 | pętla „AI proponuje → bramka → człowiek decyduje" jako schemat kreślarski |
| OG images | 3+ | 1200×630 | `mode: compose` — sharp, tekst przez SVG buffer (AI nie renderuje tekstu wiarygodnie) |

Zasady przejęte z analizy bindaro: `maxOutputTokens: 32768` (inaczej modele *-image-preview zużywają
budżet na „myślenie" i nie zwracają obrazu), 12 s przerwy między requestami (5 RPM), idempotencja
z flagą `--force`, logo i OG **wyłącznie komponowane sharpem** (nigdy generowane), po generacji
**obowiązkowa konwersja do WebP** (`quality ~80` — w bindaro dało 155 MB → 5 MB), na stronie tylko
`.webp`, hero z `priority`, reszta lazy. Grafiki pod nakładką gradientową ujednolicającą (maskuje
niedoskonałości generacji — wzorzec bindaro).

---

## 6. SEO + GEO/AEO — plan kompletny

### 6.1 Fundamenty techniczne (przenoszone z bindaro niemal 1:1)

- `src/lib/seo.ts`: self-referencing canonicals per locale + pełny klaster hreflang (pl, en, x-default), spójny z trybem static export (trailing slash) — dokładnie ten mechanizm, który w bindaro rozwiązał „page with redirect" w Search Console.
- `sitemap.ts` (force-static): wszystkie trasy × 2 locale z `alternates.languages`; `robots.ts` allow all + link do sitemap.
- Metadata: `metadataBase`, `title.template: "%s | ArchXS"`, description per strona, OG 1200×630 (komponowane), Twitter card, `googleBot: max-snippet -1, max-image-preview large`.
- Core Web Vitals: static HTML, WebP, jeden font-display swap, zero blocking scripts (analityka async), LCP = hero z preload. Cel: Lighthouse ≥ 95 na mobile.
- Dostępność WCAG AA (kontrast bramkowany skryptem — wzorzec petmarket-mono); dostępność to także czynnik parsowalności dla agentów.

### 6.2 Otwartość na crawlery AI

`robots.txt` jawnie **dopuszcza**: `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `ClaudeBot`, `Claude-User`,
`anthropic-ai`, `PerplexityBot`, `Google-Extended`, `Applebot-Extended`, `CCBot`, `Bytespider` (decyzja
świadoma: treść MA być konsumowana przez modele — to kanał pozyskania, nie ryzyko).

`public/llms.txt` (format jak w bindaro: nagłówek → akapit „czym jest ArchXS" → `## Services` →
`## Case studies` → `## Insights` → `## Contact`). Uwaga kalibracyjna: skuteczność llms.txt jest
przedmiotem sporu (Google określa go jako zbędny, badanie z maja 2026 nie wykazało wzrostu cytowań
z samego JSON-LD/llms.txt — źródła w §12), ale koszt to jeden plik — wdrażamy, nie budujemy na nim strategii.
**Strategią jest treść cytowalna (§6.4) + dostępność czystego HTML.**

### 6.3 Dane strukturalne (JSON-LD)

- `ProfessionalService` (globalnie): nazwa ArchXS, `areaServed` PL/EU, `knowsAbout` (enterprise architecture, applied AI, cybersecurity, business process automation, software development), `sameAs` → LinkedIn firmy, GitHub org.
- `Person` (tylko na /about i przy artykułach, minimalny): imię i nazwisko, `jobTitle` „Founder / Principal Consultant", certyfikacje jako `hasCredential`, `sameAs` → LinkedIn. To kompromis między wymogiem „minimum o mnie" a E-E-A-T: wyszukiwarki (i agenty AI) silnie premiują możliwość przypisania treści eksperckiej do weryfikowalnej osoby; trzymamy to w warstwie danych, nie w warstwie wizualnej.
- `Service` na każdej podstronie /practice (warstwa danych może mówić językiem usług, choć warstwa wizualna mówi językiem stanowisk — to celowy rozdział: SEO dostaje frazy usługowe, czytelnik nie widzi katalogu ofert); `Article` (+author, datePublished/Modified) na insights; `FAQPage` zsynchronizowane z widocznym akordeonem (komentarz-strażnik jak w bindaro); `BreadcrumbList` na podstronach.

### 6.4 Treść „pod cytowanie" (istota GEO)

Zasady redakcyjne obowiązujące każdą stronę/artykuł:
1. Pierwszy akapit każdej strony = **bezpośrednia odpowiedź** na domyślne pytanie tej strony (40–60 słów, samowystarczalna do zacytowania przez AI).
2. Nagłówki H2 formułowane jako pytania tam, gdzie naturalne (FAQ-shape).
3. Liczby i fakty w tekście głównym, nie w grafikach (AI nie cytuje obrazków): „2 827 zdjęć → 26 864 obserwacje", „8–12 h → 5 min".
4. Autorskie definicje i nazwane koncepty („AI proponuje, człowiek decyduje", „architektura jako kod") — unikalne frazy, po których modele przypisują źródło.
5. Struktura list/tabel dla porównań; `Key takeaways` na początku artykułów.
6. Daty publikacji i aktualizacji widoczne (świeżość to sygnał dla AI Overviews).

### 6.5 Migracja i pomiar

- Zachować URL PDF (§4.2); stary index.html nie ma podstron — brak mapy przekierowań poza root.
- Google Search Console + Bing Webmaster od dnia publikacji (weryfikacja przez env — wzorzec bindaro).
- Pomiar widoczności agentowej: comiesięczny ręczny test 10 zapytań w ChatGPT/Perplexity/Claude („polecany konsultant architektury IT Polska", „KSeF integration expert" itd.) + monitoring refererów `chatgpt.com`/`perplexity.ai` w analityce.

---

## 7. Konwersja: mechanika incepcji zamiast sprzedaży wprost

Zasada nadrzędna: **strona nigdzie nie sprzedaje**. Nie ma cennika, pakietów, szkoleń, webinarów,
popupów, newslettera-bramki ani „bezpłatnej konsultacji". Konwersja następuje, bo lektura zmienia
sposób, w jaki czytelnik widzi własną organizację — a kiedy zobaczy w niej luki przez naszą ramę
pojęciową, sam wraca po rozmowę. To wzorzec martinfowler.com / Stratechery / Bits about Money:
zero nacisku, ogromny inbound. „Rozdajemy myślenie, sprzedajemy wykonanie."

Sześć mechanizmów incepcji:

1. **Reframe** — każda strona praktyki i każdy esej daje czytelnikowi nową ramę pojęciową („AI proponuje, człowiek decyduje", „plan AI, który przetrwa produkcję", „architektura jako kod"). Kto przyjmie ramę, sam zaczyna oceniać nią własną firmę — i pamięta, skąd ją ma. Nazwane, autorskie koncepty działają tu podwójnie: incepcyjnie na ludzi i cytowalnie na modele AI (§6.4).
2. **Specyficzność** — opisy problemów tak konkretne, że czytelnik myśli „oni opisują naszą firmę": cztery ręczne mostki między systemami, zamówienia gubione w wątkach mailowych, plan AI bez właściciela kosztów. Konkret z realnych analiz AS-IS (mamy ich dziesiątki w repo) zamiast person marketingowych.
3. **Hojność (reciprocity)** — /resources rozdaje realną wartość **bez bramki e-mailowej**: open source, checklisty, szablony ADR, mapa kontroli bezpieczeństwa dla systemów z LLM. Czytelnik dostaje coś wartościowego bez proszenia — presję zastępuje poczucie zobowiązania i zaufanie.
4. **Dowód zamiast obietnicy** — liczby i artefakty (§3.4), żywe produkty do kliknięcia, publiczny kod. Strona nie twierdzi „jesteśmy ekspertami" — pokazuje rzeczy, które istnieją.
5. **Sygnały selektywności** — „kilka zaangażowań naraz, skalujemy metodą, nie zespołem" (§2.6.3); brak formularza „wyceń projekt" i brak katalogu usług sygnalizują: to nie jest dostawca z cennika, to strona, po której się dzwoni.
6. **Jedno spokojne wyjście** — jedyne CTA w całym serwisie: „**Porozmawiajmy**" (rozmowa, nie „konsultacja"), obecne dyskretnie w nawigacji, na końcu esejów i w stopce; na /contact booking Cal.com + krótki formularz (Web3Forms: problem, skala firmy, kanał zwrotny) + mailto. Jedna forma, wszędzie ta sama — spójność zamiast nachalności.

Operacyjnie:
- **Analityka**: eventy (klik „Porozmawiajmy", booking completed, submit form, pobrania z /resources, przejścia esej→kontakt); cel miesiąca 1: baseline; przegląd ścieżek co miesiąc. Kluczowa metryka incepcji: % sesji z ≥2 przeczytanymi esejami przed wejściem na /contact.
- **Spójność wielokanałowa**: LinkedIn (profil osobisty) linkuje do archxs.com jako „Website" (zgodnie z planem zmian LinkedIn pkt 5); artykuły /insights repostowane na LinkedIn w rytmie 1/2 tyg. — post daje tezę, esej na stronie ją broni, strona domyka incepcję.

---

## 8. Fazy implementacji

**F0 — Fundament (1–2 dni robocze)**
Scaffold Next.js 16 + Tailwind v4 + shadcn + next-intl; przeniesienie `next.config.ts`, `seo.ts`,
`routing.ts` z wzorca bindaro; design tokens (§5.1) w `globals.css`; GitHub Actions → gh-pages
(static export, `.nojekyll`, CNAME); placeholder home. **DoD:** archxs.com serwuje nową stronę-szkielet
z obu locale, Lighthouse ≥ 95.

**F1 — Design system i grafiki (2–3 dni)**
Komponenty sekcji (hero, karty, akordeon FAQ, stopka z „pieczątką rewizji"); skrypty Gemini
(`generate-archxs-images.ts`, `compose-brand-assets.ts`, `convert-images-to-webp.ts`); generacja
i selekcja ~18 grafik; logo/OG composed. **DoD:** wszystkie assety w WebP < 150 KB/szt., style guide
wizualny udokumentowany w repo.

**F2 — Treść rdzeniowa = MVP (3–5 dni)**
Home (9 sekcji §3.2), 5 podstron /practice (eseje-stanowiska), /method, /engage, /about, /contact
(Cal.com + Web3Forms), /privacy, /terms; komplet metadata + JSON-LD + sitemap + robots + llms.txt;
teksty PL+EN (redakcja ludzka — ton §3.6, checklist obowiązkowy). **DoD: publikacja produkcyjna MVP**,
GSC/Bing zweryfikowane, formularz i booking przetestowane e2e, każdy tekst przeszedł checklist tonu.

**F3 — Dowody (3–4 dni)**
/work: 6–8 case studies wg szablonu (§3.4) — najpierw 1–3 (publiczne), decyzja co do case 4 (§10/R1);
/resources z 2–3 magnesami; grafiki case'ów. **DoD:** każdy obszar praktyki ma ≥ 1 podlinkowany dowód.

**F4 — Silnik treści i pomiar (ciągłe, start 1 tydz.)**
5 artykułów startowych /insights (§3.5); analityka + eventy; baseline widoczności agentowej (§6.5);
kalendarz publikacji 1 artykuł / 2 tyg. **DoD:** insights żyje, pierwszy pełny raport widoczności po 30 dniach.

Sumarycznie do MVP (F0–F2): **~6–10 dni roboczych**; pełny zakres z dowodami i treścią startową: **~14–18 dni**.

---

## 9. Model pracy nad wdrożeniem

Zgodnie z praktyką z repozytoriów (CRYPTOCOLONY42_LANDING_INSTRUCTIONS, CLAUDE.md-driven):
ten dokument = źródło prawdy; każda faza realizowana przez agentów Claude Code z bramkami ludzkimi na:
(a) akceptacji tekstów (ton!), (b) selekcji grafik z generacji, (c) decyzjach §10, (d) publikacji.
Konwencje: commity per faza, `docs/DECISIONS.md` dla odstępstw od planu, golden-check Lighthouse w CI.

## 10. Ryzyka i decyzje otwarte

| # | Ryzyko/decyzja | Rekomendacja |
|---|---|---|
| R1 | Case study 4 (obecny pracodawca) — zgoda vs anonimizacja | pełna anonimizacja sektorowa bez nazwy do czasu pisemnej zgody; metryki bez atrybucji firmy |
| R2 | Kolizja pozycjonowania: LinkedIn celuje w role CIO/CTO (etat), strona w doradztwo | brak kolizji przy głosie „practice we" — strona sprzedaje praktykę, profil osobę; NIE linkować agresywnie strony z profilu w okresie aktywnej rekrutacji zarządczej — decyzja właściciela |
| R3 | Formularz na static hostingu — dostawca zewnętrzny (dane osobowe) | Web3Forms + zapis w polityce prywatności; alternatywnie mailto do czasu decyzji |
| R4 | Dwujęzyczna redakcja tekstów — AI-owy ton zniweczy wyróżnik | teksty PL pisane ręcznie/redagowane, EN tłumaczone z redakcją; zakaz fraz-wypełniaczy („w dzisiejszym dynamicznym świecie…") egzekwowany checklistą redakcyjną |
| R5 | Nazwa/branding ArchXS vs istniejące skojarzenie „Web3/blockchain" ze starej strony | nowa strona nadpisuje pozycjonowanie; blockchain zostaje jako jeden z dowodów, nie oferta wiodąca |
| R6 | llms.txt/schema — zawyżone oczekiwania | traktować jako higienę, nie strategię; strategia = treść cytowalna + szybki czysty HTML (§6.4) |
| R7 | Incepcja konwertuje wolniej niż jawna oferta — ryzyko cienkiego pipeline'u w pierwszych 90 dniach | świadomie zaakceptowane (jakość > wolumen); /engage i „Porozmawiajmy" pozostają widoczne; przegląd po 90 dniach — jeśli zero leadów, eksperyment z mocniejszym opisem diagnozy na /engage (nadal bez cenników i szkoleń) |

## 11. Miary sukcesu (90 dni od MVP)

- ≥ 1–2 zakwalifikowane rozmowy/mies. z bookingu lub formularza (jakość > wolumen — model incepcyjny, patrz R7).
- ≥ 30% sesji kończących się na /contact miało wcześniej ≥ 2 przeczytane eseje (metryka incepcji, §7).
- Strona cytowana przez ≥ 1 wyszukiwarkę agentową w teście 10 zapytań (§6.5).
- 10 stron w indeksie Google w obu locale, 0 błędów GSC, Lighthouse ≥ 95 utrzymane.
- ≥ 8 artykułów opublikowanych; ≥ 1 z nich z ruchem organicznym > 100 wizyt/mies.

## 12. Źródła (GEO/AEO — stan wiedzy 2026)

- [Generative Engine Optimization (GEO): The 2026 Guide — LLMrefs](https://llmrefs.com/generative-engine-optimization)
- [GEO, AEO, and SEO in 2026: enterprise guide — WRITER](https://writer.com/blog/geo-aeo-optimization/)
- [AI Search Optimization: The 2026 LLM SEO Guide — WitsCode](https://witscode.com/guides/ai-llm-seo) — m.in. badanie 05/2026 o braku mierzalnego wpływu samego JSON-LD na cytowania oraz stanowisko Google ws. llms.txt
- [SEO and GEO: A Practical Guide for 2026 — Progress](https://www.progress.com/blogs/seo-and-geo-guide)
- [GEO Best Practices 2026 — SEOTuners](https://seotuners.com/blog/generative-engine-optimization/generative-engine-optimization-best-practices/)
