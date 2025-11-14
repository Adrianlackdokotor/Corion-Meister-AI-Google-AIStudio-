import { LibraryCategory, LibraryEntry } from '../types';

const markdownContent = `
Dies ist der vollständige Satz an Fragen und Antworten, exakt aus Ihren Quellen extrahiert und für eine Anwendung strukturiert.

## Fragen und Antworten für die Anwendung (Deutsch)

### I. Sicherheit, Gefahrstoffe und Organisation

| Nr. | Frage | Antwort | Quellen |
| :--- | :--- | :--- | :--- |
| 1 | Welche Anforderungen stellt der Gesetzgeber für die Umsetzung der **Gefahrstoffverordnung** für kleine und mittlere Betriebe? Nennen Sie 4. | Vermeidung von Gefahrstoffen; Reduzierung von Gefahrstoffen; Ungefährliche Stoffe verwenden; Mitarbeiter von Gefährdungen schützen. | |
| 2 | Für welche Materialien gilt die **Kennzeichnungspflicht**? | Für **alle Materialien**, die für Mensch und Umwelt eine Gefahr darstellen. | |
| 3 | Nennen Sie vier **Maßnahmen**, die aus Gründen der **Arbeitssicherheit** im Lackierbetrieb durchgeführt werden müssen? | **Gefährdungsbeurteilung** erstellen; **Betriebsanweisung** erstellen; **Mitarbeiter unterweisen**; Vorsorgepflicht für Mitarbeiter prüfen oder einhalten; Mitarbeiter regelmäßig schulen; PSA kostenlos bereitstellen; Gebots- und Verbotsschilder aufstellen; BG sprechen und Verbesserungsmaßnahmen regeln. | |
| 4 | Welche **Voraussetzungen** müssen Personen erfüllen, die Sie mit der Selbstständigen Bedienung einer **Hydraulischen Personenarbeitsbühne** beschäftigen müssen? | Muss unterwiesen sein; Muss älter als 18 sein; **Schriftlicher Auftrag** vom Betrieb; Bedienungsanleitung kennen; Ausbildung/Schulung nachweisen. | |
| 5 | Nennen Sie **5 Punkte** eines **Gefahrstoffverzeichnisses**. | **Lagerung**; Bezeichnung; Mengenbereich im Betrieb; Entsorgung; Arbeitsbereich; **Einstufung**; Produkt; Verwendungszweck; Menge. | |
| 6 | Nennen Sie **4 Bereiche** über die nach **DIN-52900** in Sicherheitsdatenblättern Angaben gemacht werden müssen. | Hersteller und Bezeichnung; Erste-Hilfe-Maßnahmen; Lagerung / Transport; Mögliche Gefahren; Verhalten im Brandfall. | |
| 7 | Nennen Sie den ausgeschriebenen Begriff **GHS** und seine Bedeutung? | **Global Harmonisiertes System (GHS)**. Bedeutung: Ein weltweit einheitliches System zur Einstufung und Kennzeichnung von Gefahrstoffen. | |
| 8 | In welchen **Gefäßen** dürfen **Beschichtungsstoffe** im Lackierbetrieb bereitgestellt werden? | Nur in **gekennzeichneten Gefäßen**, deren Sicherheitsvorschriften lesbar sind. | |
| 9 | Welche **Mengen** an Beschichtungsstoffen dürfen gelagert werden? | Nur die, die an einem **Arbeitstag verbraucht** werden. | |
| 10 | Wie müssen Sie mit den **entleerten Gefäßen** nach den durchgeführten Lackarbeiten umgehen? | Bis zum Tagesende sachgerecht in **Sondermüll entsorgen**. | |
| 11 | Welche **Konsequenzen** kann ein **Nichtbeachten der Schutzausrüstung** nach sich ziehen? | Rechtlich: **Kündigung**; Finanziell: Verlust der Lohnfortzahlung. | |
| 12 | Wie müssen Sie Ihre Mitarbeiter darauf hinweisen (PSA)? | Erst durch **mündliche Aufforderung**; Bereitstellen von PSA; Mitarbeiter darf entsprechend belehrt werden; Wiederholung; **Abmahnung**. | |
| 13 | Nennen Sie **5 Informationen**, die in einer **Betriebsanweisung** stehen müssen. | Piktogramme; PSA (Persönliche Schutzausrüstung); Verhalten; Erste Hilfe Maßnahmen; Mögliche Gefahren; Verbote; Zutritt nur für ausgewählte Personen; Gefahrenhinweise; Verhalten im Brandfall und Unfall. | |
| 14 | Nennen Sie die **Staffelanzahl (nach Arbeiter Anzahl)** und die nötige **Erste-Hilfe Einrichtung**? | Verbindungsliste Ersthelfer; Verbandbuch; Erste-Hilfe-Raum; Bis **20** Mitarbeiter → wird ein **kleiner Verbandskasten** benötigt; 21–100 Mitarbeiter → ein **großer Verbandskasten**; 101–200 Mitarbeiter → zwei große Verbandskästen. | |
| 15 | Was bedeutet der Begriff **sensibilisieren**? | Eine innere, stärkere werdende Reaktion auf einen bestimmten Reiz; Höhere Aufmerksamkeit des Körpers oder Aufnahme auf die Umgebung; Über Geruch, Hören oder visuelle Reize. | |
| 16 | Was bedeutet der Begriff **Flammpunkt**? | Ist der Punkt, bei dem z. B. Gas anfängt zu brennen; Ab einer bestimmten Temperatur, bei der ein Gefahrstoff entzündlich wird. | |
| 17 | Was bedeuten die Begriffe **Kat 1, Kat 2, Kat 3**? | Ab welcher Temperatur fängt es an zu brennen, selbstzündend. | |
| 18 | Sie besitzen einen Raum in dem **Wassergefährdende Flüssigkeiten** lagern. Welche Anforderung wird an diesen Raum gestellt? | Fläche im Depot muss von dem belegten Flächenanteil; **nicht in den Boden einsickern**. | |
| 19 | Welche **technischen Anforderungen** muss der **Fußboden** (für Lagerung) erfüllen? | Muss fest und rissfrei sein; Der Boden muss **Flüssigkeitsdicht, öl- und säurefest** sein; Rutschfest; Spritzbereich sichtbar. | |
| 20 | Sie bekommen von Ihrem Lieferanten einen neuen Lack mit Gefahrenhinweisen (H226, H317, H336, H411). Welche **Maßnahmen** müssen Sie ergreifen? | Mitarbeiter unterweisen / Vorschriften; **Atemschutz tragen und Explosionsschutz** beachten; Für gute Belüftung sorgen; Lagerung beachten; Transportbedingungen beachten; Der neue Lack nur im **EX Schutz Bereich** verwenden; Zugelassene Behälter und Gebinde verwenden; Hautkontakt vermeiden. | |
| 21 | Welche **Gefahren** kann **Strom** für den Menschen verursachen? Nennen Sie 4 Punkte. | **Stromstärke** (Stromschlag); **Stromdauer**; **Spannungshöhe**; Feuchtigkeit / schlechte Isolierung. | |

### II. Umwelt, Entsorgung und Arbeitsschutzrecht

| Nr. | Frage | Antwort | Quellen |
| :--- | :--- | :--- | :--- |
| 22 | Welchen Teil können Sie als Lackierbetrieb zu dem Ziel **Umweltbelastungen** gering zu halten beitragen. Nennen Sie 4. | **Wasserlacke** verwenden; **Instandsetzung statt Ersetzen**; Pistolenwaschautomat verwenden; Verpackung am Einkauf abgeben; Lieferantenverpackung zurückgeben; Abdeckpapier wiederverwenden. | |
| 23 | Sie möchten im Smart-Repair-Bereich die Trocknung mit **UV-Lichtblitzen** durchführen. Welche erforderliche **Schutzausrüstung** wird benötigt? | Vorgeschriebene PSA (Persönliche Schutzausrüstung); **UV-Schutzbrille**; **UV-Handschuhe**; Haut vor UV schützen. | |
| 24 | Was ist der Unterschied zwischen **Emission und Immission**? | **Emission** = Ausstoßen von Schadstoffen; **Immission** = Aufnahme von Schadstoffen. | |
| 25 | Nennen Sie 6 **Maßnahmen**, wie **Abfälle** in einem Fahrzeuglackierbetrieb **vermieden oder vermindert** werden können. | Die Lieferantenverpackung zurückgeben; Abdeckpapier wiederverwenden; Pistolenwaschautomat verwenden; Verpackung beim Einkauf abgeben; Becherwaschautomat nutzen; Reinigungstücher waschen; Dosiersystem verwenden. | |
| 26 | Welche **Informationen** enthält der **Übernahmeschein** (Begleitpapier bei Entsorgung von Farb- und Lackabfällen)? | Bezeichnung um welche Stoffe es sich handelt; Schlüsselnummer; Beförderer; Entsorger; Datum; Unterschrift; Adresse der Firma; Adresse der Deponie; Menge; Entsorgungsnummer. | |
| 27 | Nennen Sie 2 **Grundpflichten**, die Sie als Arbeitgeber für die **Arbeitssicherheit** tragen. | **PSA** (persönliche Schutzausrüstung) zur Verfügung stellen; **Gefährdungsbeurteilung** durchführen; Sicherstellen, dass alle Schutzmaßnahmen eingehalten werden. | |
| 28 | Was sind die **Ziele einer Gefährdungsbeurteilung**? | Systematische Ermittlung und Bewertung von Gefährdungen am Arbeitsplatz, um Arbeitsunfälle und arbeitsbedingte Erkrankungen zu verhindern; Festlegung und Umsetzung geeigneter Schutzmaßnahmen, um Risiken zu minimieren und eine gesundheitlich vorteilhafte Arbeitsumgebung zu schaffen. | |
| 29 | Welche **Anforderungen** stellen Sie an einen **Ersthelfer**? | Muss eine Ausbildung oder Qualifikation besitzen (z.B. Erste-Hilfe-Kurs); Sollte die richtigen Maßnahmen im Notfall sicher durchführen können; **Stressresistent und verantwortungsbewusst** handeln; Körperlich in der Lage sein zu helfen; Kenntnisse müssen regelmäßig durch **Auffrischungskurse** erneuert werden. | |
| 30 | Nennen Sie die **Staffelanzahl (nach Arbeiter Anzahl)** und die nötige **Erste-Hilfe Einrichtung**? | Bis 20 MA → wird ein **kleiner Verbandskasten** benötigt; 21–100 MA → ein **großer Verbandskasten**; 101–200 MA → zwei große Verbandskästen. | |
| 31 | Welche **Gefahren** werden in einer **Gefährdungsbeurteilung** erfasst? | Welche Gefahren von einem Stoff oder einer Maschine ausgehen können. | |
| 32 | Von welchen **Gefahren** ist am Arbeitsplatz auszugehen? | Atmung / Vergiftung; Sensibilisierung; Stürzen, Stolpern, Klemmen; Verbrennung; Funkenflug, hoher Blitzschlag; Arbeiten unter Spannung; Nicht aufhalten von Personen. | |
| 33 | Welche **Pflichten** haben Sie als Arbeitgeber, um **Unfällen und Berufskrankheiten vorzubeugen**? Nennen Sie 4. | Gefährdungsbeurteilung durchführen; Betriebsanweisung erstellen; Unterweisung der Mitarbeiter; Mitarbeiterschulungen; Vorsorgeuntersuchung von Mitarbeitern; Regelmäßige Wartung von Maschinen und Toren; Mit der BG sprechen; Gefahren für Verbesserung erfassen. | |
| 34 | Nennen Sie **2 Gründe** für die Pflicht zur **Durchsicht der EG-Sicherheitsdatenblätter**. | Die Daten enthalten Informationen zur Risiko­beurteilung und zum Schutz von Mensch und Umwelt; Angaben zur Verarbeitbarkeit und Gefährlichkeit der Stoffe müssen geprüft werden, um eine korrekte Gefährdungsbeurteilung zu erstellen. | |
| 35 | Nennen Sie **4 Arbeiten**, die **Jugendliche** laut dem **Jugendarbeitsschutzgesetz** nicht durchführen dürfen. | Arbeiten, die ihre physische oder psychische Leistungsfähigkeit übersteigen; Arbeiten, bei denen sie gesundheitlichen Gefahren ausgesetzt sind; Arbeiten, die mit Unfallgefahr verbunden sind; Arbeiten, bei denen sie Schwingungen, Lärm, Erschütterungen oder Strahlen ausgesetzt sind. | |
| 36 | Zu welchen **Zeitpunkten** werden die **Medizinischen Untersuchungen** bei Auszubildenden durchgeführt? | **Vor Beginn** der Ausbildung; **1 Jahr nach Beginn** der Ausbildung. | |
| 37 | Was wird durch diese **Medizinische Untersuchung** (bei Azubis) geprüft? | Ob in diesem Beruf gewisse Schäden durch gesundheitlich besondere Belastungen entstehen könnten; Um Berufskrankheiten zu verhindern. | |
| 38 | Warum werden **Arbeitsmedizinische Vorsorgeuntersuchungen** durchgeführt? | Um den Arbeiter vor Folgekrankheiten wie Krebs zu schützen; Um den Beruf weiterzuführen, ohne dass die Gesundheit gefährdet ist. | |
| 39 | Unter welchen Umständen hat der Arbeitgeber eine **Arbeitsmedizinische Vorsorgeuntersuchung zu fordern**? | Vor Berufseintritt; Wenn man davon ausgeht, dass die Tätigkeiten gefährlich sind oder nicht verträglich. | |
| 40 | Welche Pflichten hat der Arbeitgeber auf den Bezug der **PSA**? | Überwachungspflicht; Fürsorgepflicht; Unterweisungspflicht; Schutzmaßnahmen ergreifen; Dokumentationspflicht; Musterprüfung. | |
| 41 | Was ist beim Einsatz, der Reinigung und Lagerung von **Schutzhandschuhen** zu berücksichtigen? | **Tragedauer** beachten; Vor Wärmequellen und UV-Strahlung schützen; In gut belüfteten Räumen lagern; Nur passende Handschuhe verwenden; Keine defekten oder verschmutzten Handschuhe verwenden; Vor dem Ausziehen außen desinfizieren oder mit Wasser abwaschen; Handschuhe vor dem nächsten Gebrauch kontrollieren. | |

### III. Auftragsabwicklung, Kalkulation und Recht

| Nr. | Frage | Antwort | Quellen |
| :--- | :--- | :--- | :--- |
| 42 | Welches **Fachwissen**, welche **Fertigkeiten/Fähigkeiten** benötigt Ihr Mitarbeiter für die Aufnahme eines Schadens? | **Fachwissen:** Höflichkeitsformen; EDV-Kenntnisse; Branchensoftware; Ablaufstrukturen; Büroorganisation. **Fertigkeiten/Fähigkeiten:** Sicheres Auftreten; Nutzung der EDV; Nutzung der Software; Ablaufstruktur planen; Kommunikation und Einfühlungsvermögen; Technisches Verständnis; Organisationstalent. | |
| 43 | Nennen Sie **6 Inhalte** eines **Werkstattauftrags**. | Vollständige Kunden- und Fahrzeugdaten; Detaillierte Beschreibung der auszuführenden Arbeiten; Kostenangabe; Zeitrahmen / Fertigstellungstermin; Datum; Unterschrift des Kunden. | |
| 44 | Nennen Sie **6 Schritte** für die Vorgehensweise einer **Auftragsabwicklung**. | Kundendaten aufnehmen; Annahmedaten erfassen; Reparaturumfang festlegen; Vorschäden notieren; Unterschrift des Kunden einholen; Fahrzeugdaten ergänzen; Fertigstellungstermin festlegen; Preis und AGB bestätigen. | |
| 45 | Nennen Sie **6 organisatorische Schritte**, die bei der **Auftragsannahme** eines Kundenauftrages nötig sind. | Fahrzeugdaten aufnehmen; Reparaturumfang erfassen/festlegen; Kundendaten aufnehmen; Annahmedaten vorschreiben, notieren, **Unterschrift Kunde**; Fertigstellungstermin und Preis festlegen; AGB erläutern/bestätigen. | |
| 46 | Erstellen Sie einen konkreten **Ablaufplan** für die Abwicklung der **Kostenübernahme eines Versicherungsschadens**. | Versicherungsdaten erfassen/aufnehmen; Schadensnummer notieren/eintragen; **Kostenvoranschlag oder Gutachten** erstellen/kalkulieren; **Freigabe der Versicherung** abwarten; Unterschriebene **Abtretungserklärung** beilegen/einholen. | |
| 47 | Aus welchen Gründen kann die **Kostenübernahme verweigert** werden? | **Haftung unklar**; Keine Versicherung vorhanden; Verstoß gegen die StVO; Fahren ohne Führerschein; Verletzung der **Obliegenheitspflicht**. | |
| 48 | **Was muss vorhanden sein**, um eine **Reparaturkostenübernahme (RKU)** zu gewährleisten? | Versicherungsdaten (RKU-Daten); Schadensnummer; Kostenvoranschlag oder Gutachten; **Bestätigung der Versicherung**; Unterschriebene **Abtretungserklärung**. | |
| 49 | Was ist der **Unterschied zwischen einem Kostenvoranschlag und einem Gutachten**? | Ein **Kostenvoranschlag** ist eine grobe, subjektive Schätzung der Werkstatt über die zu erwartenden Reparaturkosten. Ein **Gutachten** ist dagegen ein **beweissicheres, unabhängiges und rechtlich verbindlicheres Dokument** eines Sachverständigen. | |
| 50 | Ihre Rechnung ist teurer als der Kostenvoranschlag. Was müssen Sie tun, um die **Mehrkosten** zu berechnen? | Der Kunde muss **rechtzeitig** über die Mehrkosten **informiert** werden; Er muss der Erhöhung **ausdrücklich zustimmen**, idealerweise schriftlich. | |
| 51 | Welche **zwei Angaben** müssen aus **Steuerlicher Sicht** auf **Ausgangsrechnungen** Ihres Fahrzeuglackierbetriebes ausgewiesen werden? | **MwSt. (Mehrwertsteuer)**; **Ausführungszeitraum**; Steuernummer. | |
| 52 | Welche **Kontrollmaßnahmen** muss der verantwortliche Mitarbeiter zu Arbeitsbeginn durchführen, wenn Ersatzteile geliefert und vom Wachdienst quittiert wurden? | Richtigkeit der Bestellung und Lieferscheine prüfen; Vollständigkeit kontrollieren; Richtige Teile in richtiger Menge überprüfen; **Unbeschädigt**. | |
| 53 | Nennen Sie **2 Gewährleistungsansprüche** die einen Kunden durch Mangelhafte ausgeführten Lackierarbeiten zustehen? | Preisnachlass; Schadenersatz; Nachbesserung; Rücktritt/Wandlung. | |
| 54 | Nennen Sie **4 Rechtsfolgen** die durch die Sachfreie **Mangelabnahme** einer Handwerksleistung ausgelöst werden? | **Zahlungspflicht**; **Garantie**; **Verjährungsfrist** fängt an; **Umkehr der Beweislast**; Beginn der Gewährleistung. | |

### IV. Nachkalkulation, Kostenstellen und Preise

| Nr. | Frage | Antwort | Quellen |
| :--- | :--- | :--- | :--- |
| 55 | Welche **Parameter** sind Grundlage der **Nachkalkulation**? Nennen Sie 4. | Tatsächlicher Materialpreis; Ersetzter Teilpreis (Ersatzteile); Zeitaufwand; Werkzeugkosten; Rüstzeiten; Subunternehmer. | |
| 56 | Welchen **Zweck dient eine Nachkalkulation**? | Ob **Gewinn oder Verlust** erzielt wurde; Wurden alle ermittelten Kosten tatsächlich durchgeführt?; Wurde profitabel gewirtschaftet?. | |
| 57 | Erarbeiten Sie eine **Gliederung der Kostenstellen** eines Karosserie- und Lackierbetriebes. Nennen Sie zu den Unterpunkten Einkauf, Karosserie und Lackierung je 3 Beispiele. | **Einkauf:** Material, Verbringung, Lohn. **Karosserie:** Instandsetzung, Werkzeug, Achsvermessung. **Lackierung:** Lackierkabine, Lack, Finish. | |
| 58 | Definieren Sie die **gemäßigte** sowie **absolute Preisuntergrenze**. | **Gemäßigt:** Keine Berücksichtigung der kalkulatorischen Kosten – nur variable, leistungsabhängige Kosten. **Absolut:** Nur die leistungsabhängigen Kosten. Es werden fixe Gemein- und Fixkosten nicht berücksichtigt. | |
| 59 | Nennen Sie 2 **Chancen** und **Gefahren** bei **Preisuntergrenzen**. | **Chancen:** Preispolitik – mit konkurrieren. **Gefahren:** Liquidität ist in Gefahr; Es würden nicht alle Kosten gedeckt. | |
| 60 | Erklären Sie den Unterschied zwischen **Vollkostenrechnung** und **Teilkostenrechnung**. | **Vollkostenrechnung:** Eine genaue Kostenauflistung auf alle Kosten, inklusive variable und fixe Kosten. **Teilkostenrechnung:** Direkt zurechenbare Kosten auf den Kostenträger verteilt. | |
| 61 | Was ist der **Break-even-point**? | Ab diesem Punkt macht das Unternehmen **Gewinn** („Gewinnschwelle“). | |
| 62 | Was ist die **Deckungsbeitragsrechnung**? | Berechnet den Betrag, ob unsere **Fixkosten gedeckt** sind. | |
| 63 | Wann spricht man von einer **zeitwertgerechten Lackierung**? | Wenn **Kosten der Lackierung nicht den Wert des Fahrzeugs übersteigen**. | |

### V. Qualitätsmanagement und Organisation

| Nr. | Frage | Antwort | Quellen |
| :--- | :--- | :--- | :--- |
| 64 | Welche **Ziele** verfolgen Sie durch eine **gute Betriebsorganisation**? Nennen Sie 4. | Arbeitsplatzsicherheit; Hohe Produktivität; Optimaler Umweltschutz; Optimale Gewinnausschüttung; Hohe Kundenakzeptanz. | |
| 65 | Welche **Voraussetzungen** für die **Planung und Organisation** (der Reparaturarbeiten) müssen gegeben sein? Nennen Sie 4. | Kundenauftrag unterschrieben; Material geplant und bestellt; Ersatzteile Verfügbarkeit geprüft; Mitarbeiter geplant unter Berücksichtigung von Qualität, Urlaub und Krankheit; Maschinen und Werkzeuge geplant und organisiert; Wenn alle stimmen, darf der Kunde zum Termin kommen. | |
| 66 | Nennen Sie **Möglichkeiten** die **Produktivität** ihres Betriebes zu erhöhen! | Mehr gezielt arbeiten; Arbeitsabläufe während der Arbeit mitbegleiten; Schulung der Mitarbeiter; Gute Sicht / Beleuchtung; Gute Maschinen; Gute Planung; Gute Organisation; Gute Werkzeuge; Sauberkeit; Struktur; Sichtbarkeit durch klare Linien; Leitsysteme. | |
| 67 | Was bedeuten die Begriffe **Qualitätssicherung (QS) und Qualitätsmanagement (QM)**? | **QS:** Gleich bleibende Produkt- und Prozessleistung sicherstellen, Kontrolle; **QM:** Ist der Standardprozess. | |
| 68 | Welche **Maßnahmen zur Qualitätssicherung (QS)** können Sie bei **Beginn, während und nach der Arbeit** ergreifen und zu welchem Zweck? | QS Maßnahmen = Kontrolle durchführen, Messwerte dokumentieren, Ziel und Ist vergleichen, Ergebnisse prüfen; Zweck: Um eine hohe QS zu gewährleisten; Beim Großauftrag auf richtige Werte achten / Zwischenkontrollen. | |
| 69 | Was bedeutet **KVP**? | **Kontinuierlicher Verbesserungsprozess**. | |
| 70 | Was ist **QM**? | Ein System zur Sicherstellung und Verbesserung der **Qualität** von Produkten, Dienstleistungen und Prozessen. | |
| 71 | Nennen Sie **Vorteile** eines **QM-Systems**. | Kundenzufriedenheit; Geringere Reklamationen; Besserer Marktpreis; Wettbewerbsvorteil; Vertrauen zum Kunden. | |

### VI. Lackierung und Technische Kontrolle

| Nr. | Frage | Antwort | Quellen |
| :--- | :--- | :--- | :--- |
| 72 | Nennen Sie 4 **Aufgaben von Pigmenten**. | Feuerschutzgebung; **Korrosionsschutz**; Untergrundabdeckung; **UV-Schutz**. | |
| 73 | Nennen Sie 4 verschiedene **Pigmente**. | Titandioxid; Eisenoxid; Ruß; Ocker. | |
| 74 | Erläutern Sie den Begriff **PVK**. | **Pigmentvolumenkonzentration**; Nicht flüchtige Anteile im Lack in % zu Gesamtmasse oder anderen Verhältnissen zu Gesamtmasse. | |
| 75 | **Klarlacke** verschiedener Hersteller haben allgemeine **Verarbeitungshinweise**. Nennen Sie 5 Punkte. | Mischungsverhältnis; Spritzgänge; Ablüftzeiten; Trockenzeit; Trockentemperatur. | |
| 76 | Wofür werden **Musterbleche mit unterschiedlichen Grautönen** genutzt? | Für jeden Farbton wird eine passende Untergrund-Farbgebung (Grauton) festgelegt; Um das richtige Farbergebnis zu erzielen, muss das entsprechende Musterblech verwendet werden. | |
| 77 | Beschreiben Sie zwei **Ursachen** für mögliche **Abweichungen der Farbtöne** zwischen Musterflächen und Fahrzeug. | **Untergrundunterschiede**; Größe der Fläche, Glanzgrad und Farbton wirken unterschiedlich. | |
| 78 | Wie können Sie vor der Ausführung der Arbeiten am Fahrzeug und mögliche **Reklamationen bei Abweichung zwischen Musterflächen und Fahrzeugflächen vorbeugen**? | Dem Kunden die Musterplatten zur Auswahl zeigen; **Schriftlich im Auftrag festhalten**; Musterblatt aufbewahren. | |
| 79 | Durch welche **Maßnahmen** können Sie bei der Ausführung am Fahrzeug die **Qualität der Musterflächen gewährleisten**? | Spritzdruck und Spritzabstand kontrollieren; Lackiermethode beibehalten; Sicherstellen, dass Musterplatten zum Vergleich bei der Abnahme vorliegen. | |
| 80 | Nennen Sie **4 Möglichkeiten** wie Sie einen Farbton **heller** erscheinen lassen können. | Verdünnung zugeben; Am hellen Grundton verwenden; Höherer Druck; Trocken spritzen; Hoher Abstand zwischen den Spritzgängen. | |
| 81 | Nennen Sie **Gründe**, warum ein Farbton **nach der Applikation anders** am Fahrzeug wirkt. | Struktur des Hintergrundes; Deckvermögen; Es wird ein anderer Farbton reflektiert; Applikation / Spritzverfahren; Material; Falsche Temperatur der Leuchte. | |
| 82 | Welche **Kontrollmaßnahmen** müssen in der **Spritzkabine** durchgeführt werden? | **a) Vor Beginn der Lackierung:** Sauberkeit, Alles abgedeckt, Lackierende Flächen reinigen, Pistole und Material einstellen. **b) Während der Lackierung:** Spritzzeuge kontrollieren, Flächendeckend und vollflächig lackieren, Farbe möglichst gleichmäßig spritzen, Abluftzeit zwischen den Spritzgängen einhalten. **c) Nach der Lackierung:** Abluftzeit einhalten, Lackstand kontrollieren, Temperatur und Trockenzeit einhalten, Staubeinschlüsse und Finish prüfen. | |
| 83 | Von welchen **Kriterien** ist die **Häufigkeit des Bodenfilterwechsels** in der Lackierkabine abhängig? | Von der Art des Materials; Von der Anzahl des Durchlaufs; Von der Größe des Objekts; Die Viskosität; Die Umfang der Lackierarbeiten; Spritzpistole einsetzen; Kammern durchsprayen. | |
| 84 | Nennen Sie den **Unterschied** zwischen den Materialien für **Hand- und Maschinenpolitur**. | **Handpolituren** haben meist **verspätete Wirkung**. **Maschinenpolituren** werden meistens in zwei Phasen benutzt: Phase 1: Oberflächenbearbeitung; Phase 2: Oberfläche versiegeln. | |
| 85 | Welche **Anforderungen** werden an eine **Spritzpistole** gestellt? | Angenehm zu handhaben; Geringes Gewicht; Kompakte Bauweise; Umweltgerecht; Wenig Spritznebel; Hohe Übertragungsrate; Leichte Reinigung. | |
| 86 | Der **Spritzdruck** der Pistole ist plötzlich **gestiegen und lässt sich nicht mehr herunter regeln**. Was ist der Grund für diese Störung? | **Luftkolbenpackung** ist **gerissen oder defekt**. | |
| 87 | Nennen Sie die **Vorgehensweise oder Arbeitsschritte zum Wechsel der Luftkolbenpackung**. | Material entfernen; Spritzpistole zerlegen – Schraube entfernen; Feder und Luftdüse entnehmen; Abzugshebel lösen / entfernen; Luftkolbenpackung ausbauen; Neue Packung einsetzen; In umgekehrter Reihenfolge montieren. | |
| 88 | Welche **Eigenschaften** sollte ein zu verarbeitender **Lack** aufweisen? | Guter Glanz; Leichte Reinigung; Wetterbeständig; Chemikalienbeständig; UV-beständig; Kratzbeständig; Farbtonstabilität; Mechanisch belastbar. | |
| 89 | Warum sollte **UV-Füller** in Lackierbetrieben häufiger eingesetzt werden? | Schnellere Trocknung; keine großen Arbeitsflächen; hoher Festkörperanteil; keine Emissionen durch Lösemittel. | |
| 90 | Wenn vom Lackhersteller im technischen Merkblatt vor dem Füllern **Waschprimer aufzutragen** ist: darf dieser dann durch **1K/UV-Füller ersetzt** werden? | **Rechtlich:** Führt zum **Garantieverlust**, wenn die Vorgaben nicht eingehalten werden; **Technisch:** Mängel bei der Haftung / Rissbildungen. | |
| 91 | Beschreiben Sie den **Aufbau einer Beschichtung im Bereich einer Spachtelstelle**, damit ein ausreichender Korrosionsschutz und ein einwandfreier Decklackstand erreicht wird. | Randzonen richtig schleifen; Vorschleifen und spätere Randzonenmarkierung vorbeugen; Vorgrundieren der blankgeschliffenen Stelle mit **EP**; Anschließend **Füller** auf die vorgrundierte Stelle applizieren; Nach Aushärtung des Füllers mit Feinschliff und Silikonentferner reinigen; Danach Decklack laut Herstellerangabe auftragen. | |
| 92 | Welche **Besonderheiten** sind beim **Reinigen und Schleifen des Dachrahmens (Alt-Lackierung)** zu beachten? | Die Oberfläche sehr gut reinigen; Kein Rollendurchschleifen, um Kosten der Kalkulation nicht zu überschreiten. | |
| 93 | Welche **Besonderheiten** sind beim **Reinigen und Schleifen des Stoßfängers (Kunststoff)** zu beachten? | Nicht zu grob schleifen; Reiniger mit **Kunststoffreiniger** verwenden; Keine alkoholischen oder emulsionstechnisch nicht geeigneten Reinigungsmittel verwenden; **Antistatische Reiniger** verwenden, um eine statische Aufladung zu vermeiden. | |
| 94 | Nennen Sie 4 **Verzinkungsarten**. | Galvanische Verzinkung; Feuerverzinkung; Spritzverzinkung; Phosphatieren. | |
| 95 | Beschreiben Sie die **Wirkungsweise des Eisenglimmers** als **Korrosionsschutzpigment**. | Eisenglimmer wird als passives Pigment eingesetzt; Durch seine Schuppenform verhindert er den direkten Kontakt von Feuchtigkeit und Luft mit dem Untergrund (Barriere-Effekt). | |
| 96 | Wie nennt man die Kombination von **aktivem und passivem Korrosionsschutz**? | **Duplex-System**; Erhöht die Haltbarkeit des Objekts erheblich, um das 2- bis 2,5-Fache. | |
| 97 | Welche **Kriterien** spielen bei der **Auswahl der Spritzpistole** eine Rolle? | Materialverbrauch; Gewicht (Ergonomie); Spritzbild; Zerstäubung; Düsen- und Wartungsaufwand. | |
| 98 | Eine Spritzpistole ist von einem Lackhersteller freigegeben. Darf sie auch für andere Lackmaterialien eines anderen Lackherstellers verwendet werden? | Text aus dem Merkblatt! (Abhängig von den Vorgaben des Herstellers). | |

### VII. Technische Instandsetzung und Karosserie

| Nr. | Frage | Antwort | Quellen |
| :--- | :--- | :--- | :--- |
| 99 | Nennen Sie in Stichpunkten **spezielle Werkzeuge** (Instandsetzung) und erläutern Sie ihre Notwendigkeit. | Bördelwerkzeug; Richtgerät; Lötgerät; Trennwerkzeug; Schweißgerät; Spachtel; Hammer. | |
| 100 | Erläutern Sie, wann ein **Einstellen des Seitenteils** notwendig ist und worauf vor dem **Einstellen der Vorderachse** zu achten ist? | **Seitenteil:** Wenn eine Schadstelle am Riss oder der Falz ist oder das Profil ungleich ausgeführt ist. **Vorderachse:** Die Richtwerte müssen mit den Herstellerangaben übereinstimmen, bevor die Vorderachse eingestellt werden darf. | |
| 101 | Warum ist es wichtig, alle **Dokumente und Messprotokolle** an alle Parteien zu versenden und in den Kundenakten aufzubewahren? | Nur das im Auftrag oder Gutachten enthaltene ist **rechtskräftig**; Es ist nötig zu dokumentieren, um die Ist- und Fachwerte nachvollziehbar zu machen. | |
| 102 | Nennen Sie 3 **Fügeverfahren**. | Schrauben; Kleben; Schweißen; Nieten. | |
| 103 | Vor- und Nachteile **Batterie abklemmen vs. Überspannungsschutzgerät** (beim Schweißen)? | **Batterie abklemmen:** Vorteil → Fahrzeug ist stromlos; Nachteil → Viele Steuergeräte müssen neu angelernt werden. **Überspannungsschutzgerät:** Vorteil → Ist schnell einsatzbereit; Nachteil → Nicht 100% sicher, da das Fahrzeug immer noch Strom hat. | |
| 104 | Nennen Sie **Vorteile** einer **Instandsetzung mit Ausbeultechnik (Multispotter)** gegenüber einer Teilersatz-Reparatur: a) Für den Betrieb, b) Für das Fahrzeug, c) Vorteile für den Kunden. | **a) Betrieb:** Kein Weiterkauf von Ersatzteilen; Geringere Kosten; Keine Kosten für die Ersatzteilbeschaffung. **b) Fahrzeug:** Erhalt der Fahrzeugstruktur; Keine Korrosionsschutzschwächung durch Schneiden; Keine Materialschwächung durch Erwärmung. **c) Kunde:** Geringere Kosten; Kürzere Werkstattaufenthaltsdauer. | |
| 105 | Nennen Sie **Vorteile von lösbaren Verbindungen**. | Materialersparnis; Zeitersparnis; Sauberere Arbeit; Besseres Ergebnis. | |
| 106 | Worauf ist bei einer **Achsvermessung** alles zu achten? Nennen Sie 4. | Reifendruck; Gerade Stellung; Gerade Stellung des Lenkrads sicherstellen; Fehlwinkel Feder; Lage der Achsköpfe. | |
| 107 | Welche **Eigenschaften** sollten **Kompressoren** aufweisen? | **Kolbenkompressor:** Laut; Geringe Kosten in der Anschaffung; Leistungsschwächer; Wartung intensiv; Einfache Bauweise; Zur Luftversorgung geeignet. **Schraubenkompressor:** Leiser; Wartungsärmer; Teurer in der Anschaffung; Gegen Kälte empfindlich. | |

### VIII. Mitarbeiterführung und Schulung

| Nr. | Frage | Antwort | Quellen |
| :--- | :--- | :--- | :--- |
| 108 | Als Ausbilder fordern Sie Ihren Auszubildenden auf, die Arbeiten zu unterbrechen, damit Sie gemeinsam ein **Gespräch zum sicheren Umgang mit den Schleifmaschinen** führen können. Notieren Sie Inhalte dieses Gesprächs. | Richtige **PSA aushändigen und erläutern**; Gerät erklären; Auf Gefahren hinweisen; Umgang bei Schleifen erklären und den Umgang der Maschine zeigen; Auf Fragen des Azubi antworten. | |
| 109 | Wie hat eine **Pflichtübertragung** an einen Arbeiter auszusehen? | **Schriftlich mit Unterschrift** beider Parteien; mit Datum und Unterschrift; sowie Festlegung der verantwortlichen Arbeitsbereiche und Aufgaben. | |
| 110 | Unter welchen **Voraussetzungen** dürfen Sie Ihren **Azubi von der Berufsschule freistellen**? | Durch einen **schriftlichen Antrag** bei der Schulleitung; z. B. bei Krankheit oder aus wichtigen betrieblichen Gründen (z. B. Teilnahme an einer betrieblichen Unterweisung). | |
| 111 | Darf sich Ihr **Azubi eigenmächtig von der Berufsschule freistellen**? Wenn ja, unter welchen Voraussetzungen? | Nur bei unerwarteten oder unabwendbaren privaten Ereignissen (z. B. Hochzeit, Trauerfall); In solchen Fällen wird jedoch meist milder gehandelt, wenn die Abwesenheit begründet ist. | |
| 112 | Wie müssen Sie Ihre Mitarbeiter anweisen, um mit **Gefahrstoffen** zu arbeiten? | Mitarbeiter unterweisen; Persönliche Schutzausrüstung (PSA) ausgeben; Kontrollen durchführen und auf Fehler hinweisen. | |

### IX. Subunternehmer und Leiharbeiter

| Nr. | Frage | Antwort | Quellen |
| :--- | :--- | :--- | :--- |
| 113 | Was ist im **Vertrag mit Ihrem Subunternehmer** enthalten? Nennen Sie 5 Punkte. | Vertragsgegenstand; Zeitplan und Fristen; Vergütung; Arbeitsmittel und Material; Haftung und Mängelansprüche; Nachweise; Kündigungsbedingungen/Kündigungsregelungen. | |
| 114 | Nennen Sie **4 Vorteile** und **4 Nachteile** für die Zusammenarbeit mit **Subunternehmern** (oder Nachunternehmern). | **Vorteile:** Mehr Aufträge können angenommen werden; Geringere Personalkosten; Keine Werkzeugkosten; Keine Maschinenkosten; Entlastung des Stammpersonals. **Nachteile:** Nicht immer mängelfreie Arbeit; Höhere Verwaltungskosten/Koordinationskosten; Termine können schwerer eingehalten werden; Unfallgefahr / Haftungsrisiko; Kein einheitliches Erscheinungsbild; Fehlende Instruktion von Mitarbeitern. | |
| 115 | Nennen Sie **Vorteile und Nachteile von Leiharbeitern**? | **Vorteile:** Kann einfach gekündigt werden; Flexibel Kunden und Gelegenheiten anpassen / gehen lassen; Entlastung des Stammpersonals. **Nachteile:** Längere Einarbeitung; Können nicht ins Team passen; Größerer Büroaufwand. | |
| 116 | Welche **Unterlagen** müssen Sie sich von einem **Nachunternehmer** zeigen lassen? | Gewerbeanmeldung; Versicherung nachweisen; Betriebshaftpflicht; Handwerkskarte; Mindestlohn beachten; Freistellung, Bescheinigung von Finanzamt; Unbedenklichkeitsbescheinigung BG. | |
| 117 | Wer **haftet für Schäden durch Nachunternehmer**? | Immer der **Auftraggeber**. | |
| 118 | Darf die **Beauftragung (von Subunternehmern) ohne Genehmigung** von statten gehen? | **Nein**, nur nach Absprache mit dem Kunden. | |

### X. Übergabe und Service

| Nr. | Frage | Antwort | Quellen |
| :--- | :--- | :--- | :--- |
| 119 | Erstellen Sie eine **Verfahrensanweisung für die Übergabe des Fahrzeugs** nach der Reparatur **(im Betrieb)**. | Kunde anrufen und Termin vereinbaren; Fahrzeug reinigen und fertigstellen; Rechnung schreiben; Dem Kunden seine Papiere aushändigen; **Abtretungserklärung unterschreiben lassen**; Fahrzeug gemeinsam mit dem Kunden besichtigen; Auf Serviceleistung hinweisen; Fragen des Kunden beantworten; Kunden eine gute Fahrt wünschen. | |
| 120 | Erstellen Sie eine **Verfahrensanweisung für die Übergabe des Fahrzeugs** nach der Reparatur **beim Kunden**. | Kunden anrufen; Termin vereinbaren; Auto fertigstellen; Bei Abholung Auto sichern; Bei selber fahren an die **StVO achten**; Alle Papiere zusammenheben und aushändigen; Abtretungserklärung unterschreiben lassen; Auto zusammen besichtigen; Fragen des Kunden beantworten; Einen guten Tag wünschen. | |
| 121 | Erklären Sie die Begriffe **Basisnutzen und Zusatznutzen**. | **Basisnutzen:** Ist das, was der Kunde haben möchte – Schaden reparieren. **Zusatznutzen:** Ist das, was über den Basisnutzen hinausgeht, wie z. B. Fahrzeug reinigen. | |
| 122 | Nennen Sie **2 Zusatznutzen für Privatkunden**. | Auto waschen/saugen/polieren/aufräumen; Hol- und Bringservice; Leihwagen. | |
| 123 | Nennen Sie Ihre **Kundengruppen**. | Privatkunden; Firmenkunden; Öffentliche Kunden (Gemeinden, Stadt, öffentliche Dienste). | |

### XI. Marketing und Betriebswirtschaft

| Nr. | Frage | Antwort | Quellen |
| :--- | :--- | :--- | :--- |
| 124 | Was bedeutet der Begriff **Mindestlohn**? | Der Mindestlohn ist der **gesetzlich oder tariflich festgelegte unterste Betrag** für den Lohn, der nicht unterschritten werden darf; Er soll Arbeitnehmer vor Ausbeutung schützen und sicherstellen, dass ein existenzsicherndes Einkommen erzielt wird. | |
| 125 | Erklären Sie den Begriff **Corporate Identity**. | Unter dem Begriff Corporate Identity versteht man das **einheitliche Erscheinungsbild** eines Unternehmens; Dieses umfasst die Merkmale, durch die sich das Unternehmen nach außen präsentiert und von anderen unterscheidet – z. B. Logo, Farben, Kommunikationsstil und Verhalten der Mitarbeiter. | |
| 126 | Nennen Sie die **4 P des Marketings**. | Product (Produkt); Price (Preis); Place (Ort/Vertrieb); Promotion (Werbung/Verkaufsförderung). | |
| 127 | Nennen Sie **4 Bereiche**, in denen Sie sich bei einer **Wettbewerbsanalyse** vergleichen. | Strategie und Ziele der Konkurrenz; Produkte und Dienstleistungen; Marketing- und Vertriebsaktivitäten; Marktstellung und finanzielle Leistungsfähigkeit. | |
| 128 | Nennen Sie **5 Auswirkungen**, wenn Sie ein **intaktes Betriebsklima** in Ihrem Unternehmen haben. | Erhöhte Motivation und Produktivität; Geringere Fehlzeiten und Fluktuation; Verbesserte Kommunikation; Bessere Zusammenarbeit; Gesteigerte Kreativität und Innovationskraft. | |
| 129 | Erklären Sie den Begriff **Stakeholder**. | Stakeholder sind alle Personen, Gruppen oder Organisationen, die ein **Interesse** an einem Unternehmen oder einem Projekt haben und von dessen Aktivitäten **direkt oder indirekt betroffen** sind; Dazu gehören zum Beispiel Kunden, Lieferanten, Mitarbeiter und die Handwerkskammer. | |
| 130 | Nennen Sie **4 Gründe** für einer **gut gestalteten Internetseite**. | Farbliche gute Gestaltung; Vorstellung des Teams; Standort-Anzeige; Leistungsangebot; 1,25 Sek. erreichbar. | |
| 131 | Erläutern Sie den Begriff **Marketing Konzept**. | Schnittstellen im Betrieb; Werbung, Stand auf Messen; Ziel ist es, neue Dienstleistungen und Produkte an den Kunde zu bringen und vermarkten. | |
| 132 | Was bedeutet der **betriebliche Erfolg**? | Umsatz; Betriebsergebnis; Gewinn; Formel: (Gewinn / Umsatz) x 100 = %. | |
| 133 | Nennen Sie **3 Gründe** für **Neukundengewinnung** im Lackierbetrieb. | Marktverhalten; Demographischer Wandel; Wechsel zu neuen Kundenaufträgen; Neue Kunden binden sich mit neuem Betrieb. | |
| 134 | Was ist der Unterschied zwischen **Logo und Signet**? | Ein **Logo** ist ein typografisches Erkennungszeichen, das eine Marke oder ein Unternehmen repräsentiert. Das kann aus Text, Symbol oder einer Kombination aus beidem bestehen. Ein **Signet** ist ein graphisches Symbol oder eine Bildmarke, die oft ohne begleitenden Text verwendet wird und als Teil eines Logos oder eigenständig als Erkennungszeichen dient. | |
| 135 | Auf welche **Parameter** müssen Sie bei der **Beschriftung der Fahrzeugseite** achten? | Optische Mitte; Farbwahl; Schriftgröße; Lesbarkeit; Thema/Bezug; Farbe; Schriftart; Zeilenabstand; Kontraste/Form; Positionierung; Flächenaufteilung. | |
| 136 | Nennen Sie die **grundlegenden Merkmale für alle Schriften**. | Schriftlinie oder Schriftgrundlinie; Oberlänge; Dichte; Verhältnis Oberlinie zum Unterlänge; Vor- und Nachbreite. | |
| 137 | Nennen Sie die **Gesetzmäßigkeiten der Typografie**. | **Serifen:** Buchstabenverzierung; **Kursiv:** Schrägstellung der Schrift; **Spationieren:** Ausgleich des Buchstabenabstands. | |

### XII. Sonstiges und Akronyme

| Nr. | Frage | Antwort | Quellen |
| :--- | :--- | :--- | :--- |
| 138 | Sie fahren Ihren Arbeitsweg mit dem Privatauto. Können Sie die **Fahrtkosten in Rechnung stellen**? | Nur, wenn dies mit dem Arbeitgeber zuvor besprochen und **schriftlich festgehalten** wurde. | |
| 139 | Nennen Sie **2 Bedingungen** für **Gefährdungsbeurteilung-Aktualisierung**. | Wenn alle Maßnahmen als wirkungslos sind; Neue Maßnahmen an neue Technik. | |
| 140 | **Abkürzungen** (DGUV, ArbStättV, ArbSchG, TRGS) ausgeschrieben. | **DGUV:** Deutsche Gesetzliche Unfallversicherung; **ArbStättV:** Arbeitsstättenverordnung; **ArbSchG:** Arbeitsschutzgesetz; **TRGS:** Technische Regeln für Gefahrstoffe. | |
| 141 | Aufgaben des **SiGeKo** (Sicherheits- und Gesundheitskoordinator). | Sicherheit und Schutzmaßnahmen ausarbeiten; Vorgesehene Maßnahmen kontrollieren. | |
| 142 | **TA-Lärm** – was ist geregelt? | Technische Anleitung zum Schutz vor Lärm. | |
| 143 | Was sollten Sie beim **Reifen und Felgen kontrollieren**? | Luftdruck; Beschädigungen; Fremdkörper. | |
| 144 | Was ist der **TWI**? | **Verschleißgrenze bei Reifen**. | |
| 145 | Was wird durch eine Medizinische Untersuchung geprüft, wenn Sie **Auskunft über einen Arztbesuch** verweigern, aber Freistellung fordern? | Ohne genaue Auskunft oder ein ärztliches Attest muss der Arbeitgeber die Freistellung **nicht genehmigen** und kann stattdessen einen Urlaubstag oder einen Fehltag berechnen. | |
| 146 | Was muss bei **Hilfsmitteln** (z.B. Kleben, Schweißen) beachtet werden? | Schutzvorkehrungen; Trennmittel; Kleben → Klebeflächen vorbereiten; Schweißen → Vorschrift einhalten, richtige Stromstärke; Nieten → Abstände kontrollieren, passende Nieten einsetzen. | |
| 147 | Nennen Sie **5 Maßnahmen**, die Sie im Beruf oder **Epoxidharz-Sicherheitskonzept** aufnehmen. | Schleifstaub nach Möglichkeit entfernen; Kontrolle der Einhaltung des Arbeitsschutzes; Einwandfreie Kleidung vorschreiben; Absaugvorrichtungen an vorgesehenen Plätzen verwenden; Ausreichende Belüftung im Lackierraum. | |
| 148 | Nennen Sie **Angaben und Dokumente** zu einem **Explosionsschutzdokument**. | Gefährdungsbeurteilung; Betriebsanweisung; Unterweisung; Prüfbescheinigung; Sicherheitsdatenblatt; EX-Schutz (Explosionsschutz) der Maschinen; Arbeitserlaubnis; Bescheinigung. | |

### MATE - Tabele

| Nr. | Frage | Antwort | Quellen |
| :--- | :--- | :--- | :--- |
| 149 | Wie werden die **Werkstoffkosten** (Materialverbrauch) berechnet? | Formel: Verbrauch = Anfangsbestand + Zugänge - Endbestand. Beispiel: 11.500 + 127.290 - 11.200 = 127.590 €. | MATE |
| 150 | Wie werden die **direkt verrechenbaren Lohnkosten** berechnet? | Gesellenlöhne direkt (nach Korrekturen) + 50% Ausbildungsvergütung (Azubi) + Produktiver Anteil Meister/Techniker. Beispiel: 400.715 + 12.030 + 33.000 = 445.745 €. | MATE |
| 151 | Wie werden die **Gesamtkosten** berechnet? | Werkstoffe + Direkte Löhne + Gemeinkosten + Sondereinzelkosten. Beispiel: 127.590 + 445.745 + 612.030 + 55.000 = 1.240.365 €. | MATE |
| 152 | Wie wird das **Betriebsergebnis** berechnet? | Formel: Betriebsleistung - Gesamtkosten. Beispiel: 1.831.840 - 1.240.365 = 591.475 €. | MATE |
| 153 | Wie wird der **Gemeinkostenzuschlag** berechnet? | Formel: (Gemeinkosten ÷ Direkt verrechenbare Lohnkosten) × 100. Beispiel: (612.030 ÷ 445.745) × 100 = 137.3%. | MATE |
| 154 | Wie wird der **Lohnkostenpreis** (Stundenverrechnungssatz) berechnet? | Formel: Durchschnittslohn × Faktor (Basislohn + GK-Zuschlag + Wagnis & Gewinn). Beispiel: 17.58 € × 2.5628 = 45.05 €/Std. | MATE |
| 155 | Warum sind **direkte Löhne** (Gesellen, Azubi, Meister) die einzigen direkt an Kunden verrechenbaren Stunden? | Weil dies die einzigen Stunden sind, die direkt einem bestimmten Projekt zugeordnet werden können. Sie erscheinen im Nenner bei der Berechnung des Gemeinkostenzuschlags (GK-Zuschlag). | MATE |
| 156 | Warum werden **Materialien nach 'Verbrauch'** und nicht nach 'Einkauf' verbucht? | Um genau abzubilden, was in einem Zeitraum verbraucht wurde, unter Verwendung der Formel: Anfangsbestand + Zugänge - Endbestand. | MATE |
`;

function parseMarkdownLibrary(markdown: string): LibraryCategory[] {
  const lines = markdown.split('\n');
  const categories: LibraryCategory[] = [];
  let currentCategory: LibraryCategory | null = null;

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Check for a category header
    const headerMatch = trimmedLine.match(/^###\s+(.+)/);
    if (headerMatch) {
      if (currentCategory) {
        categories.push(currentCategory);
      }
      currentCategory = {
        title: headerMatch[1].trim(),
        entries: [],
      };
      continue;
    }

    // Check for a table row and parse it
    if (trimmedLine.startsWith('|') && currentCategory) {
      const parts = trimmedLine.split('|').map(p => p.trim());
      // A valid row looks like: | 1 | Frage | Antwort | |
      if (parts.length >= 5 && /^\d+$/.test(parts[1])) {
        const entry: LibraryEntry = {
          id: parts[1],
          question: parts[2].replace(/\*\*/g, ''), // Remove markdown bold
          answer: parts[3].replace(/\*\*/g, ''),   // Remove markdown bold
        };
        currentCategory.entries.push(entry);
      }
    }
  }

  // Add the last category if it exists
  if (currentCategory) {
    categories.push(currentCategory);
  }

  return categories;
}

export const parsedLibraryData = parseMarkdownLibrary(markdownContent);
