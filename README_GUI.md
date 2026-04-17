# VanityGen GUI - Bitcoin Vanity Address Generator

Eine moderne Graphical User Interface für VanityGen++, den Bitcoin- & Krypto-Addressen-Generator.

## Setup

### 1. Abhängigkeiten installieren

```bash
npm install
```

### 2. Vanilla-Executable bauen (vor GUI-Schritt)

Das Tool benötigt ein kompiiliertes `vanitygen.exe`:

```bash
build.exe
```

Oder manuell:

```bash
g++ -o vanitygen.exe *.c third_party/**/*.c $(pkg-config --libs openssl)

### 3. GUI starten

```bash
npm start
```

## Features

- ✅ **Muster-basierte Suche**: Generiere Bitcoin-Adressen mit benutzerdefinierten Präfixen (z.B. `1MyPattern*`)
- 🔄 **Multiple Kryptowährungen**: BTC, ETH, XLM, ATOM, GRS, TRX
- ⚡ **Multi-Threaded**: Automatische CPU-Nutzung oder manuell einstellbar
- 📁 **Datei-basiert**: Lade Muster aus Textdateien oder über stdin
- 💾 **Ausgabe-Datei**: Speichere Ergebnisse in CSV/Text
- 🔐 **Seed-File**: RNG-Seed für reproducierbare Tests
- ⦿ **Regex-Modus**: Regulaer Ausdrücke statt exakten Präfixes
- 🎭 **Case-insensitive**, **Compressed** Optionen

## GUI-Benutzeroberfläche

### Hauptbereiche

1. **Patterns**: Gib Muster ein (z.B. `1MyPattern*`, `70%...85%`)
2. **Einstellungen**: Threads, Min/Max Bits, Coin-Auswahl
3. **Files**: Ausgabe-Datei und Seed-File wählen
4. **Results**: Generierte Adressen mit Match-Status
5. **Console**: Live-Ausgabe des Generators

### Beispiel-Gebrauch

1. Starte die GUI (`npm start`)
2. Gib ein Muster ein: `1VanityGen*` 
3. Wähle Bitcoin (BTC) oder andere Coin
4. Klicke auf "⚡ Generate"
5. Ergebnisse werden in der Results-Sektion angezeigt

## Kommandozeilen-Argumente (im GUI einstellbar)

| Flag | Beschreibung | GUI-Einstellung |
|------|--------------|-----------------|
| -t <n> | Threads | Dropdown-Menü |
| -c | Compressed PubKey | Toggle Schalter |
| -i | Case insensitive | Toggle Schalter |
| -r | Regex Modus | Toggle Schalter |
| -o <file> | Output Datei | "Choose" Button |
| -s <seed> | Seed File | "Load" Button |
| -e,-l | Prefix-Bits | Min/Max Bits Feld |

## Struktur

```
vanitygen-plusplus/
├── src/
│   ├── main.js          # Electron Main Process
│   ├── index.html       # GUI UI
│   ├── preload.js       # IPC Bridge
│   └── renderer.js      # Client-Side Logic
├── vanitygen.c          # Original Core (C)
├── build/               # Compiliertes Executive (muss erstellt werden)
├── package.json         # Node Dependencies
└── README_GUI.md       # Diese Datei
```

## Sicherheitshinweise

- ⚠️ **Private Keys** werden im CLI oder GUI generiert - sichere sie gut!
- 🔐 Passwort-Schutz möglich für private Keys (CLI: `-e`)
- 💾 Exportiere private keys sicher von der GUI-Ausgabe

## Lizenz

Basiert auf der GNU Affero General Public License v3.0

## Probleme & Hilfe

Bei Problemen den Build-Prozess prüfen oder im CLI testen:

```bash
# Teste den Compiler
build.exe

# Ersten Testlauf
vanitygen -v 1Gen* -t 4 -o test.txt
