import { MateMaterial } from '../types';

export const initialMateData: MateMaterial[] = [
    {
        id: 'default-einzelunternehmer',
        title: 'Einzelunternehmer Kosten- und Ergebnisrechnung',
        content: `
### 1) Fallbeschreibung – Einzelunternehmen
*Originaltext (DE) mit termeni explicați (RO)*

- **Unternehmerlohn (GF-Gehalt, kalkulatorisch)** (salariu antreprenor, calculat): 60.000 €/Jahr
- **1 kaufmännische Bürokraft** (angajat administrativ): 29.000 €/Jahr
- **1 technischer Angestellter (Malermeister)** (angajat tehnic / maistru): 50.000 €/Jahr, 66 % produktiv (productiv)
- **12 Gesellen** (muncitori calificați): Gesamtbruttolohn 534.200 €/Jahr
- **2 Auszubildende** (ucenici): Ausbildungsvergütung brutto 24.060 €/Jahr, 50 % produktiv
- **Gesellen-Stundenlohn** (salariu pe oră muncitori) 2023: 17,58 €/Std.; Unproduktiv (neproductiv) auf der Baustelle: 8 %
- **Im Bruttolohn der Gesellen sind enthalten** (incluse în salariul brut): Urlaubsgeld 48.090 €, Feiertagsentlohnung 10.800 €, Weihnachtsgeld 14.770 €, Lohnfortzahlung im Krankheitsfall 22.480 €, Tariflicher Arbeitsausfall 2.500 €.
- **Weitere Posten für GuV** (profit și pierdere): Arbeitgeberanteil Sozialversicherungen 92.875 €, Umlage Lohnausgleichskassen U1+U2 8.700 €, Beiträge Berufsgenossenschaft 9.500 €, Rückerstattung Lohnausgleichskasse -6.000 €, Beiträge Malerkasse inkl. ZVK 52.040 €, Rückerstattung Malerkasse -40.100 €.
- **Werkstoffe** (materiale): Anfangsbestand (stoc inițial) 11.500 €, Zugang lt. Buchhaltung (achiziții) 127.290 €, Endbestand (stoc final) 11.200 €.
- **Subunternehmerleistungen** (servicii subcontractori): 55.000 €/Jahr.
- **Rechnungsausgänge lt. Buchhaltung** (facturi emise): 1.820.000 €/Jahr; Erlösschmälerung/Skonti (reduceri) 860 €/J; Angefangene Arbeiten 01.01. 21.200 €; 31.12. 34.000 €; Betriebserlöse 1.797.360 €; Betriebsleistung 1.831.840 €.
- **Kalkulatorische Gemeinkosten** (cheltuieli generale calculate): 612.030 €
- **Personalgemeinkosten** (chelt. generale personal): 308.520 €/Jahr; **Sachgemeinkosten** (chelt. generale materiale): 230.500 €/Jahr.

### 2) Rechenweg (Pași de calcul)

#### 2.1 Werkstoffkosten (Costul materialelor consumate)
**Formulă:** \`Verbrauch = Anfangsbestand + Zugänge − Endbestand\`
= 11.500 + 127.290 − 11.200 = **127.590 €**

#### 2.2 Lohnkosten direkt verrechenbar (Costuri directe cu forța de muncă)
1.  Zwischensumme din salarii directe (după corecții interne): 435.560 €
2.  Abzug für Baustellenwechsel/Pausen (8 % din 435.560 €) = 34.845 € → **Gesellenlöhne direkt: 400.715 €**
3.  + 50 % Ausbildungsvergütung (ucenici) = 12.030 €
4.  + Produktiver Anteil Meister/Techniker = 33.000 €
**= Direkt verrechenbare Lohnkosten: 445.745 €**

#### 2.3 Gemeinkosten (Cheltuieli generale/indirecte)
Personalgemeinkosten 308.520 € + Sachgemeinkosten 230.500 € + alte kalkulatorische Posten = **612.030 €**

#### 2.4 Sondereinzelkosten (Costuri individuale speciale)
Subunternehmerleistungen = **55.000 €**

#### 2.5 Gesamtkosten (Costuri totale)
= Werkstoffe 127.590 € + Löhne 445.745 € + Gemeinkosten 612.030 € + Sondereinzelkosten 55.000 €
= **1.240.365 €**

#### 2.6 Betriebsleistung și Ergebnis (Performanță și rezultat)
- Betriebsleistung (performanță) = **1.831.840 €**
- Betriebsergebnis (rezultat) = Betriebsleistung − Gesamtkosten = 1.831.840 − 1.240.365 = **591.475 €**

#### 2.7 Gemeinkostenzuschlag des Jahres (Suprataxa de cheltuieli generale)
**Formulă:** \`(Gemeinkosten ÷ Direkt verrechenbare Lohnkosten) × 100\`
= (612.030 ÷ 445.745) × 100 = **137.3 %**

#### 2.8 Lohnkostenpreis (Prețul orar de manoperă)
- **Formulă factor:** 100 % (salariu) + Gemeinkosten-Zuschlag + Wagnis & Gewinn
- = 100 + 137.3 + 18,98 = 256.3 % → Faktor = 2.5628
- Lohnkostenpreis/Std. = Durchschnittslohn 17.58 € × 2.5628 = **45.05 €**
- Lohnkostenpreis/Min. = 45.05 € ÷ 60 = **0.75 €**

### 3) Tabel simplu (rezumat)

| Categorie (DE/RO) | Formulă | Date folosite | Rezultat |
| :--- | :--- | :--- | :--- |
| Werkstoffverbrauch | Anfang + Zugang − Ende | \`11500+127290−11200\` | **127.590 €** |
| Direkte Löhne | Zwischensumme−8%+Azubi 50%+Meister | \`435.560−34845+12.030+33.000\` | **445.745 €** |
| Gemeinkosten | Sumă posturi generale | Personal + Sach + calc. Posten | **612.030 €** |
| Sondereinzelkosten | Subunternehmer | — | **55.000 €** |
| Gesamtkosten | Material+Löhne+Gemein+Sonder | \`127.590+445.745+...\` | **1.240.365 €** |
| Gemeinkostenzuschlag | (Gemeinkosten÷Löhne)×100 | \`612.030÷445.745\` | **137.3 %** |
| Lohnpreis/Std. | Lohn × Faktor (2,5628) | \`17.58 × 2.5628\` | **45.05 €** |
| Lohnpreis/Min. | Stundenpreis ÷ 60 | \`45.05 ÷ 60\` | **0.75 €** |

### 4) De ce extragem aceste date din cerințe
- **Salariile directe (Gesellen + Azubi 50 % + Meister productiv)** sunt singurele ore pe care le poți factura direct clienților; de aceea apar la numitor în calculul suprataxei de cheltuieli generale.
- **Gemeinkosten** includ tot ce nu poți lega direct de un proiect (birou, asigurări, amortizări etc.) și trebuie repartizate proporțional pe orele directe – de aici formula cu împărțire la ‘Direkt verrechenbare Lohnkosten’.
- **Materialele** se contabilizează pe ‘consum’, nu pe achiziții brute – de aceea folosim stoc inițial + intrări − stoc final.
- **Wagnis & Gewinn** acoperă riscul de afaceri și profitul țintă; se adaugă peste costuri pentru a forma tariful pe oră de ofertare/facturare.
- Tabelul **‘Betriebsleistung’** arată valoarea produsă într‑un an; diferența față de costurile totale dă rezultatul (profitul) operațional.
`
    }
];
