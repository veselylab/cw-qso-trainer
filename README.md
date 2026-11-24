# CW QSO Trainer v1.2 (opravená fáze 1)

Statická aplikace pro nácvik běžného HF CW QSO, určená pro použití s fyzickým klíčem a mikrofonem zachycujícím **příposlech**. Nevyžaduje npm, framework, kompilaci, server API ani internet po načtení stránky. Veškerý kód běží lokálně v prohlížeči.

## Spuštění

V adresáři s `index.html`:

```bash
python3 -m http.server 8000
```

Otevřete `http://localhost:8000`. **Nepoužívejte `file://`**: mikrofon vyžaduje bezpečný kontext a AudioWorklet samostatně načítaný JS soubor.

### GitHub Pages

1. Nahrajte všech 5 souborů (`index.html`, `app.js`, `cw-worklet.js`, `README.md`, `.nojekyll`) do kořene repozitáře.
2. V GitHubu otevřete **Settings → Pages → Build and deployment → Deploy from a branch**, vyberte `main` a `/ (root)`.
3. Po nasazení otevřete `https://<ucet>.github.io/<repo>/` a povolte mikrofon. Web je statický, nic se neposílá na server.

Na Chromebooku je nejjednodušší spouštět lokální server v Linux Terminalu (Crostini), v Chrome otevřít `localhost:8000` a pro nasazení použít `git add . && git commit -m 'CW trainer' && git push`.

## Ovládání

1. **Zapnout přijímač**: aktivuje AudioContext až na kliknutí. Pro Chrome a Safari je důležité povolení mikrofonu. Neudělené oprávnění stále umožňuje používat záložní klávesnici, pokud se podaří inicializovat Web Audio.
2. **Kalibrovat**: 2 s ticha → opakovaně vyslat `VVV` do příposlechu → automatické určení tónu 300–1200 Hz → ještě 3 s `VVV` na již zamčeném tónu pro změření tempa a asymetrie hran; v režimu reproduktoru následuje zkouška přeslechu. Pokud není tón správně nalezen, lze frekvenci upravit ručně v rozšířeném nastavení. Odhad WPM ze živého CW dekodéru vyžaduje, aby byl během kalibrace vyhodnocen dostatek skutečných značek; jinak se použije výchozí WPM.
3. Připojte příposlech TRX nebo cvičný oscilátor k **mikrofonu**. V IC‑7300 použijte **vypnutý break-in**, takže se nic nevysílá do éteru. U kabelového propojení chraňte mikrofonní vstup před přebuzením a případným DC napětím z externího výstupu. **Sluchátka doporučena**; na iPhonu spíše kabelová než Bluetooth.
4. Zvolte **A · Volám CQ**, **B · Odpovídám na CQ** nebo **C · Volám stanici** a **Nové QSO**. Hodnota **seed** umožňuje scénář zopakovat.
5. Při záložním režimu napište v Tréninku text, **Enter** jej zaklíčuje jako příposlech, **Esc** přeruší. Při tomto vysílání je dekodér mikrofonu pozastaven.
6. Log `CALL`, `RST TX`, `RST RX`, `NAME`, `QTH` vyplňujte ručně. Po skončení je zobrazen přepis, kontrola a skóre.
7. **Zkouška** skryje nápovědu, přepis protistanice a záložní klávesnici.

### Diagnostika a testy

Na `index.html#selftest` klikněte **Spustit všech 54 testů**. Prvních pět prověřuje skutečný zdroj `cw-worklet.js` přes `OfflineAudioContext` s workletem, pokud jej prohlížeč podporuje. Jinak je tentýž procesor spuštěn v deterministických 128vzorových blocích na hlavním vlákně (bez druhé implementace DSP). Následuje 12 původních logických testů, 24 regresních testů v1.1 a 13 regresních testů v1.2; část používá skutečný `cw-worklet.js` v offline audiu a ostatní běží ve virtuálním čase. Výsledky uvádějí PASS/FAIL/nepodporováno; **nejde o předem deklarovaný úspěch**.

Tlačítko **E2E test (~2 min)** je samostatná zkouška v reálném čase: otevře druhý `AudioContext`, vytvoří v něm CW oscilátor a bílý šum −55 dBFS RMS, povede signál přes `MediaStreamDestination`, krátce podvrhne `getUserMedia` a nechá izolovanou instanci `AudioEngine` projít normální mikrofonní cestu až do `AudioWorkletu`. Po 1,5 s ustálení šumu automaticky odklíčuje QRL?, CQ, předání a uzavření spojení A na 25 WPM s ±10 % odchylkou. Ověřuje dokončení QSO, nulové mimořádné hrany a dokončení přechodu nejvýše 900 ms po K a KN. Test je záměrně dlouhý; pro E2E použijte Chrome na HTTPS nebo `localhost`, zapněte zvuk a neuspávejte záložku. Během testu nepoužívejte skutečný klíč. Pokud browser nepovolí přepsání `getUserMedia`, test skončí s chybou a původní implementace je obnovena.

**Poznámka k ověření:** automatizovaná syntetická sada může běžet i v samostatné simulaci mimo browser. Prohlížečový E2E test je nutné provést v cílovém Chrome; lokální simulace nenahrazuje test fyzického mikrofonu a plánovače OS.

Detektor používá kvadraturní směšování a dvě dvoupólové dolní propusti po obou složkách I/Q: to odstraňuje čekání na celé FFT okno. Konkrétní **end-to-end latenci ≤10 ms nelze slíbit na všech mikrofonech, mobilních OS a prohlížečích**. Časy hran se označují číslem audio rámce, které se nemusí rovnat okamžiku doručení zprávy UI. V diagnostice jsou uváděny rovněž `baseLatency`, `outputLatency` a odhad latence doručení.

RIT mění slyšený tón protistanice, nikoli střed CW filtru. Přeslechu reproduktoru se předchází oddělením tónu cca 250 Hz, při zaklíčování semi break-in ztlumí příjem. AEC je experimentální (výchozí vypnuto), potlačení šumu a AGC jsou výslovně požadovány vypnuté.

## Co obsahuje tato dodávka

- **Fáze 1:** dekodér, mikrofonní vstup, kalibrace, šumový HF přijímač se dvěma filtry, RIT, slabý signál, QSB, semi break-in, prefixy evropských stanic, 3 stavové automaty QSO, fuzzy parser, log, hodnocení ruky/QSO a self-test.
- **Fáze 2 nebyla implementována:** vodopád, QSK, historie vývoje v čase a exporty ADIF/CSV.
- **Fáze 3 nebyla implementována:** soutok více stanic, QRN, QRM, SOTA, PWA/offline service worker.

## Technické poznámky a omezení

- Jedná se o tréninkový simulátor, nikoli o certifikovaný měřicí přístroj nebo nástroj pro přímé RF vysílání. Výstupní úrovně a S‑metr jsou orientační, přesná absolutní SNR závisí na zařízení a akustice.
- Všechna QSO jsou simulovaná. Generátor používá přidělené rodiny prefixů jako vzory, **nezaručuje existenci konkrétní přidělené značky**. Profily měst a jmen jsou syntetické.
- Přístup k `localStorage` je ošetřen, takže aplikace funguje i při zakázaném ukládání; nastavení/historie se pak nezachovají.
- Virtuální čas a seed zaručují determinismus **QSOEngine při stejné konfiguraci a stejné posloupnosti vstupů**. Živé zvukové časování, rukopis a šum prostředí se reprodukovat nedají přesně.
- Selftest s OfflineAudioContext může být na některých verzích Safari nepodporovaný. Reálná akustická cesta reproduktor → mikrofon vyžaduje individuální kalibraci.


## Changelog – v1.1 (2026-11-24)

- **A1 – inicializace a smyčka:** `AudioEngine` se do `TrainerUI.audio` přiděluje až po dokončení `start()`, aktualizace audia jsou chráněné `ready` a kontrolou uzlů. `requestAnimationFrame` se plánuje na začátku každé iterace; sekce běhu mají samostatný `try/catch`. Testy 18, 34.
- **A2 – nalezení tónu:** nová čistá funkce `pickTonePeak`, správné `-Infinity` místo implicitních nul, parabolická interpolace a minimální odstup 15 dB nad mediánem. Testy 19, 20.
- **A3 – klid detektoru:** `floor` je pomalý průměr obálky v klidu, `peak` má dolní referenci a prahy 4×/2,5× noise floor se stabilní hysterezí; I/Q + dvě dvojice biquadů beze změny. Testy 35, 41, původní 1–5.
- **A4 – aktivita klíče:** `QSOEngine.keyActivity(now,on)` aktualizuje stav během značek i mezer. Timeout odkládá při klíčování, CQ a naplánovaná TX čekají na klid, kolize se vyhodnocují od skutečného začátku klíčování do příjmu. Záložní klávesnice oznamuje aktivitu na začátku i konci. Testy 30–32 a původní 10.
- **B5 – koncové značky:** `K`, `KN`, `<KN>`, `BK`, `<SK>`, `SK`, `<AR>`, `E` a dotazy ukončují přechod po zvoleném tichu. Test 21.
- **B6 – nepřerušené ukončení:** výchozí konec po terminátoru je `max(12 teček, 600 ms)`; po `<SK>` a `<SK> E` může následovat E / E E. Testy 22 a 38.
- **B7 – lidská ruka a rychlost:** tečka se adaptuje z krátkých/dlouhých značek i krátkých mezer; vzorce se vyhodnotí až při dokončení znaku, aby se opravila klasifikace při rychlém přechodu 15 → 25 WPM. Z VVV se měří WPM a asymetrie hran (`estimateHandTiming`). Testy 36–39 a 41.
- **C8 – zkrácená odpověď:** `MY MY` bez `DE` je přijatelná značka `fromCall` v režimu B. Test 23.
- **C9 – trenér:** zakončení se kontrolují přes `Parser.endSign`, u B a C/a) je samotné koncové `E` povoleno, statistiky ruky se agregují za celé QSO. Testy 24, 25, 33, 40.
- **C10 – parser a QTH:** dekódování `UR 579` / `UR 5NN`, víceslovný QTH do následujícího klíčového slova a města `NOVO MESTO`, `NOVI SAD` zachovaná jako jednotky. Testy 26, 27.
- **C11 – kalibrace oddělená od QSO:** při kalibraci se hrany jen měří, před návratem do QSO se klasifikátor resetuje. Testy 28, 39.
- **C12 – prázdné přechody:** žádné prázdné záznamy ME, vymazání chybných indikátorů překryvu. Test 28.
- **C13 – S-metr:** z aktuální amplitudy přehrávané stanice krát QSB, nikoli ze samotného nastavení. Test 29.
- **C14 – E2E:** nové tlačítko pro uzavřený reálný test A přes virtuální mikrofon, sdílená cesta `AudioEngine.openMicrophone()` a skutečný `ToneDetectorProcessor`. Kontroly zahrnují dokončení, falešné hrany a dokončení K / `<KN>` do 900 ms; spouští se samostatně a může odhalit odlišnosti na konkrétním zařízení.

Sada `#selftest` nadále zachovává všech původních 17 položek; regresní testy jsou přidané, nikoli náhradní.


## Changelog – v1.2 (2026-11-24)

- **1 – otevřený přechod / režim B:** `QSOEngine.setTurnOpen()` udržuje ochranu od první skutečně potvrzené značky až po `onFinal` (včetně zkrácené odpovědi `MY MY` a pomalého 8 WPM). `cq`, `cqNext`, naplánované `tx` i timeouty čekají, dokud je přechod otevřený. Simplex se hodnotí podle začátku platného klíčování během RX, nikoliv podle toho, zda protistanice vysílá až při `receive()`. Testy 42–44, 50; původní 10 upraven, aby opravdu simuloval klíčování do RX.
- **2 – rozběh a nové ladění detektoru:** `ToneDetectorProcessor` po startu, připojení mikrofonu, resetu, přeladění a znovuzapnutí 300 ms používá rychlý průměr obálky (EMA, τ 35 ms) bez odesílání hran. Potom automaticky přejde na nezměněnou původní EMA šumu a prahy. Syntetické CW testy mají na začátku 550 ms klidového šumu. E2E čeká po připojení virtuálního mikrofonu 1,5 s; klasifikátor se po každém přechodu resetuje. Testy 51–54.
- **3 – ignorování krátkých pulzů:** `keyActivity()` se volá pouze pro ověřenou značku ≥ `max(15 ms, 0,3 tečky)`. Dlouhý KEY DOWN je potvrzen ještě za běhu, bez čekání na uvolnění klíče. Neplatné krátké hrany neobnovují čas poslední mezery a neblokují dokončení otevřeného přechodu. Testy 45–46.
- **4 – rozloučení `waitE`:** V režimech B i C se uzná koncový přechod obsahující samostatné `E`, `73` nebo `<SK>`, tedy i `TU 73 E E` či `R TU 73 DE OK1JDV <SK> E E`. Testy 47–48.
- **5 – kalibrace:** Zobrazená frekvence v poli a souhrnu kalibrace je zaokrouhlená na celé Hz; interní odhad pro dekodér zůstává s desetinnou přesností. Test 49.

**Zachováno:** pět původních souborů repozitáře, žádný build ani nové závislosti; I/Q směšovač, dva kaskádové biquady, ustálené násobky prahů 4×/2,5×, dolní mez `peak`, timing/gramatika CW, generátor stanic, seed, Coach a vzhled UI. V `#selftest` je 54 položek (původních 41 + 13 nových). Oddělený reálný E2E zůstává dostupný svým tlačítkem a je třeba jej spustit v cílovém Chrome.
