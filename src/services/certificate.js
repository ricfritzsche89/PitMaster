import { jsPDF } from "jspdf";

/**
 * Generates a PDF certificate for a participant.
 * @param {Object} event - The event object (title, date, etc.)
 * @param {Object} participant - The participant (name, score, etc.)
 * @param {string} rank - The rank text (e.g., "1. Platz", "Teilnehmer")
 * @param {string} type - "winner", "loser", or "standard"
 */
export const generateCertificate = (event, participant, rank, type = "standard") => {
    // Create A4 Landscape
    const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
    });

    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();

    // -- BACKGROUND & BORDER --
    // Fill background
    doc.setFillColor(type === 'loser' ? 245 : 255, type === 'loser' ? 240 : 253, type === 'loser' ? 240 : 225); // Light cream or reddish for loser
    doc.rect(0, 0, width, height, 'F');

    // Ornated Border
    doc.setLineWidth(2);
    doc.setDrawColor(type === 'loser' ? 100 : 212, type === 'loser' ? 50 : 175, type === 'loser' ? 50 : 55); // Bronze/Gold or Brown
    doc.rect(10, 10, width - 20, height - 20);
    // Inner thin border
    doc.setLineWidth(0.5);
    doc.rect(12, 12, width - 24, height - 24);

    // -- HEADER --
    doc.setFont("helvetica", "bold");
    doc.setFontSize(40);
    doc.setTextColor(50, 50, 50);

    let titleText = "URKUNDE";
    if (type === 'loser') titleText = "TEILNAHME-URKUNDE";

    doc.text(titleText, width / 2, 40, { align: "center" });

    // -- EVENT INFO --
    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    doc.setTextColor(100, 100, 100);
    doc.text((event.title || "Event").toUpperCase(), width / 2, 55, { align: "center" });

    const dateStr = event.date ? event.date.split('-').reverse().join('.') : new Date().toLocaleDateString();
    doc.text(dateStr, width / 2, 62, { align: "center" });

    // -- AWARD TEXT --
    doc.setFont("times", "italic");
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    doc.text("Hiermit wird verliehen an", width / 2, 85, { align: "center" });

    // -- PARTICIPANT NAME --
    doc.setFont("helvetica", "bold"); // Ideally a fancy font
    doc.setFontSize(60);

    // Color depends on rank
    if (rank.includes("1.")) doc.setTextColor(212, 175, 55); // Gold
    else if (rank.includes("2.")) doc.setTextColor(160, 160, 160); // Silver
    else if (rank.includes("3.")) doc.setTextColor(205, 127, 50); // Bronze
    else if (type === 'loser') doc.setTextColor(139, 69, 19); // Poop brown
    else doc.setTextColor(0, 0, 0);

    doc.text(participant.name || "Teilnehmer", width / 2, 110, { align: "center" });

    // -- RANKING --
    doc.setFont("times", "bolditalic");
    doc.setFontSize(30);
    doc.setTextColor(50, 50, 50);
    doc.text(rank, width / 2, 135, { align: "center" });

    // -- SCORE / DETAILS --
    doc.setFont("helvetica", "normal");
    doc.setFontSize(18);
    let points = 0;
    if (participant.round1) points += participant.round1.reduce((a, b) => a + (b || 0), 0);
    if (participant.round2) points += participant.round2.reduce((a, b) => a + (b || 0), 0);

    let subtext = `für eine herausragende Leistung von ${points} Punkten.`;
    if (type === 'loser') subtext = `für den tapferen Versuch mit ${points} Punkten.`;

    const splitSubtext = doc.splitTextToSize(subtext, width - 80);
    doc.text(splitSubtext, width / 2, 150, { align: "center" });

    // -- SIGNATURE LINE --
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(width / 2 - 40, height - 40, width / 2 + 40, height - 40);

    doc.setFontSize(12);
    doc.text("Unterschrift (Admin)", width / 2, height - 33, { align: "center" });

    // -- FOOTER --
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("Generiert von PitMaster App", width / 2, height - 10, { align: "center" });

    // -- SAVE --
    doc.save(`Urkunde_${participant.name.replace(/\s+/g, '_')}.pdf`);
};
