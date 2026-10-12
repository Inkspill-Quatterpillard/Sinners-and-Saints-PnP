# Offline-PWA ohne Server, Regeln als Datendateien

Die App ist eine statisch gehostete Progressive Web App ohne eigenes Backend. Charaktere werden lokal auf dem Gerät gespeichert und lassen sich als JSON exportieren und importieren. Die Regeldaten (Spezies, Fertigkeiten, Ausrüstung …) liegen in eigenen, von Hand gepflegten Datendateien und nicht im Code. Jede Datei verweist auf ihre Markdown-Quelle im `Regelwerk/`. Ein Prüfskript meldet Abweichungen zu den gut auslesbaren Markdown-Tabellen.

Gründe: Die App soll öffentlich für alle verfügbar sein und am Spieltisch offline auf dem Handy laufen. Ohne Server fallen weder Kosten noch Logins oder Wartung an. Eine PWA erreicht Android, iOS und Desktop mit einer einzigen Codebasis. Das Regelwerk ist noch ein Prototyp und wird von seinem Autor als Markdown gepflegt. Getrennte Daten halten Regeländerungen aus dem Code heraus.

## Considered Options

- **Store-App (Flutter/Capacitor):** zurückgestellt wegen App-Store-Kosten, Mac-Pflicht und Review-Prozess. Später möglich: Die PWA kann als Trusted Web Activity in den Play Store oder per Capacitor in die Stores gebracht werden.
- **Server mit Konten:** zurückgestellt. Ein Cloud-Sync, etwa über ein Google-Konto, kann später ergänzt werden, ohne die lokale Speicherung aufzugeben.
- **Markdown beim Build automatisch auslesen:** verworfen, weil große Teile des Regelwerks (Herkunft, Zauber, Spezies-Eigenschaften) Fließtext sind und das Auslesen bei jeder Formatänderung bricht.
- **Datendateien als Quelle, Markdown daraus erzeugen:** verworfen, weil der Autor dafür seine Arbeitsweise ändern müsste.
