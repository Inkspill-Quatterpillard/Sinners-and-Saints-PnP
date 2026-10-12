# 14 — Ausstattung

Status: done

**What to build:**

Aus dem Status ergeben sich Stufe, Geldbeutel, Tagesgeld und Besitztümer. Der Spieler übernimmt Waffen, Rüstungen, Kleidung und Ausrüstung aus einem Katalog mit Werten, Preisen und Texten. Der Katalog richtet sich nach dem gewählten Setting (Standard oder Fallout). Freie Einträge sind jederzeit möglich. Die App zeigt das Restgeld an, verbietet das Überziehen aber nicht.

**Blocked by:** 07 — Profession und Heldenfertigkeiten

Siehe Spec: `.scratch/charakter-app/spec.md`. Begriffe: `CONTEXT.md`.

- [x] Die Status-Tabelle steht in den Regeldaten (aus `Ausstattung.md`). Die Besitztümer folgen der Formel, nicht den Spannen.
- [x] Die Währung (1 Gulden = 100 Kronen, 1 Krone = 100 Pfennig) wird umgerechnet, angezeigt und eingegeben.
- [x] Die Kataloge aus `Ausrüstung/*.md` sind je Setting erfasst (Standard und Fallout), mit Schaden, Modifikator, Länge, RS, Preis und Besonderheiten, soweit vorhanden.
- [x] Freie Einträge mit Name, Preis und Notiz sind möglich.
- [x] Das Restgeld wird angezeigt. Überziehen ergibt eine Warnung, keinen Fehler.
