# 🚀 Deployment Anleitung (GitHub Pages)

Deine App ist lokal fertig konfiguriert. Jetzt bringen wir sie online!

Führe diese Befehle nacheinander in deinem Terminal aus:

### 1. Deployment-Tool installieren (einmalig)
```powershell
npm install gh-pages --save-dev
```

### 2. Git einrichten und Code sichern
(Falls du noch nie Git in diesem Ordner benutzt hast)
```powershell
git init
git add .
git commit -m "PitMaster Pro Version fertig"
git branch -M main
git remote add origin https://github.com/ricfritzsche89/PitMaster.git
```
*(Falls "remote origin already exists" kommt, ist das okay/egal)*

### 3. Hochladen & Veröffentlichen
```powershell
git push -u origin main
npm run deploy
```

---
**✅ Fertig!**
Deine App wird in ca. 2-5 Minuten hier erreichbar sein:
👉 **https://ricfritzsche89.github.io/PitMaster/**
