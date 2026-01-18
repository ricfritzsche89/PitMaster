import { jsPDF } from "jspdf";

/**
 * Generates a PDF certificate for a participant.
 * @param {Object} event - The event object (title, date, etc.)
 * @param {Object} participant - The participant (name, score, etc.)
 * @param {string} rank - The rank text (e.g., "1. Platz", "Teilnehmer")
 * @param {string} type - "winner", "loser", or "standard"
 * @param {string} theme - "classic", "western", "bbq"
 */
export const generateCertificate = (event, participant, rank, type = "standard", theme = "classic") => {
    // Create A4 Landscape
    const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
    });

    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();

    // -- THEME DEFINITIONS --
    const themes = {
        classic: {
            bg: [255, 255, 255],
            borderOuter: [212, 175, 55], // Gold
            borderInner: [212, 175, 55],
            textTitle: [50, 50, 50],
            textNormal: [100, 100, 100],
            textAccent: [0, 0, 0],
            fontTitle: "helvetica",
            fontBody: "times"
        },
        western: {
            bg: [245, 235, 215], // Parchment / Beige
            borderOuter: [101, 67, 33], // Dark Leather Brown
            borderInner: [139, 69, 19], // Saddle Brown
            textTitle: [101, 67, 33],
            textNormal: [139, 69, 19],
            textAccent: [60, 40, 20],
            fontTitle: "times",
            fontBody: "courier"
        },
        bbq: {
            bg: [40, 40, 45], // Dark Slate / Charcoal
            borderOuter: [255, 100, 0], // Fire Orange
            borderInner: [255, 255, 255], // White Chalk
            textTitle: [255, 255, 255],
            textNormal: [200, 200, 200],
            textAccent: [255, 165, 0], // Orange
            fontTitle: "helvetica", // Ideally something bolder
            fontBody: "helvetica"
        }
    };

    const style = themes[theme] || themes.classic;

    // Overwrite for loser specific colors if needed (optional, keeping it simple for now)
    if (type === 'loser' && theme === 'classic') {
        style.bg = [245, 240, 240];
        style.borderOuter = [100, 50, 50];
    }

    // -- BACKGROUND & BORDER --
    doc.setFillColor(...style.bg);
    doc.rect(0, 0, width, height, 'F');

    // Borders
    doc.setLineWidth(2);
    doc.setDrawColor(...style.borderOuter);
    doc.rect(10, 10, width - 20, height - 20);

    doc.setLineWidth(0.5);
    doc.setDrawColor(...style.borderInner);
    doc.rect(12, 12, width - 24, height - 24);

    // -- HEADER --
    doc.setFont(style.fontTitle, "bold");
    doc.setFontSize(theme === 'western' ? 50 : 40);
    doc.setTextColor(...style.textTitle);

    let titleText = "URKUNDE";
    if (theme === 'western') titleText = "WANTED / REWARD";
    if (theme === 'bbq') titleText = "GRILL MASTER AWARD";
    if (type === 'loser') titleText = theme === 'western' ? "DORFDEPP" : "TEILNAHME";

    doc.text(titleText, width / 2, 40, { align: "center" });

    // -- EVENT INFO --
    doc.setFont(style.fontBody, "normal");
    doc.setFontSize(16);
    doc.setTextColor(...style.textNormal);
    doc.text((event.title || "Event").toUpperCase(), width / 2, 55, { align: "center" });

    const dateStr = event.date ? event.date.split('-').reverse().join('.') : new Date().toLocaleDateString();
    doc.text(dateStr, width / 2, 62, { align: "center" });

    // -- AWARD TEXT --
    doc.setFont(style.fontBody, "italic");
    doc.setFontSize(20);
    doc.setTextColor(...style.textAccent);
    doc.text("Hiermit wird verliehen an", width / 2, 85, { align: "center" });

    // -- PARTICIPANT NAME --
    doc.setFont(style.fontTitle, "bold");
    doc.setFontSize(60);

    // Name Color
    if (rank.includes("1.")) doc.setTextColor(212, 175, 55); // Gold
    else if (rank.includes("2.")) doc.setTextColor(192, 192, 192); // Silver
    else if (rank.includes("3.")) doc.setTextColor(205, 127, 50); // Bronze
    else doc.setTextColor(...style.textTitle); // Theme default

    if (theme === 'bbq') doc.setTextColor(255, 255, 255); // White chalk for name on BBQ
    if (type === 'loser') doc.setTextColor(139, 69, 19);

    doc.text(participant.name || "Teilnehmer", width / 2, 110, { align: "center" });

    // -- RANKING --
    doc.setFont(style.fontBody, "bolditalic");
    doc.setFontSize(30);
    doc.setTextColor(...style.textAccent);
    doc.text(rank, width / 2, 135, { align: "center" });

    // -- SCORE / DETAILS --
    doc.setFont(style.fontTitle, "normal");
    doc.setFontSize(18);
    doc.setTextColor(...style.textNormal);

    let points = 0;
    if (participant.round1) points += participant.round1.reduce((a, b) => a + (b || 0), 0);
    if (participant.round2) points += participant.round2.reduce((a, b) => a + (b || 0), 0);

    let subtext = `für eine herausragende Leistung von ${points} Punkten.`;
    if (type === 'loser') subtext = `hat sich stets bemüht (${points} Punkte).`;
    if (theme === 'western') subtext = `für treffsichere ${points} Punkte im Duell.`;
    if (theme === 'bbq') subtext = `Heiß serviert mit ${points} Punkten.`;

    const splitSubtext = doc.splitTextToSize(subtext, width - 80);
    doc.text(splitSubtext, width / 2, 150, { align: "center" });

    // -- SIGNATURE LINE --
    doc.setDrawColor(...style.textNormal);
    doc.setLineWidth(0.5);
    doc.line(width / 2 - 40, height - 40, width / 2 + 40, height - 40);

    doc.setFontSize(12);
    doc.text("Unterschrift (Admin)", width / 2, height - 33, { align: "center" });

    // -- FOOTER --
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("Generiert von PitMaster App", width / 2, height - 10, { align: "center" });

    // -- SAVE --
    doc.save(`Urkunde_${theme}_${participant.name.replace(/\s+/g, '_')}.pdf`);
};
