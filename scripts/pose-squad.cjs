/** Pose kategori SQUAD (4 orang, 15 pose). */
const { lineUp, upArms, peaceRight, handsOnHips } = require("./pose-group-helpers.cjs");

const S = 0.85; // squad berdiri lebih rapat → skala badan sedikit kecil

module.exports = [
  { id: "squad-line-arms-up", title: "Squad Selebrasi", description: "Semua tangan ke atas, penuh energi.", difficulty: "Easy", tags: ["playful"],
    skeletons: lineUp(4, [upArms(0.125), upArms(0.375), upArms(0.625), upArms(0.875)], S) },

  { id: "squad-peace-all", title: "Squad Peace", description: "Semua pose peace serentak.", difficulty: "Easy", tags: ["playful", "y2k"],
    skeletons: lineUp(4, [peaceRight(0.125), peaceRight(0.375), peaceRight(0.625), peaceRight(0.875)], S) },

  { id: "squad-superhero", title: "Squad Superhero", description: "Tangan di pinggang, gagah berjajar.", difficulty: "Easy", tags: ["street", "playful"],
    skeletons: lineUp(4, [handsOnHips(0.125), handsOnHips(0.375), handsOnHips(0.625), handsOnHips(0.875)], S) },

  { id: "squad-v-formation", title: "Formasi V", description: "Dua depan, dua belakang membentuk V.", difficulty: "Medium", tags: ["street"],
    skeletons: [
      { ...lineUp(4, [], S)[0] }, { ...lineUp(4, [], S)[3] },
      { ...lineUp(4, [], S)[1] }, { ...lineUp(4, [], S)[2] },
    ] },

  { id: "squad-arms-crossed", title: "Sedekap Squad", description: "Semua tangan bersedekap, cool.", difficulty: "Easy", tags: ["street", "elegan"],
    skeletons: lineUp(4, [
      { left_wrist: { x: 0.18, y: 0.36 } }, { left_wrist: { x: 0.43, y: 0.36 } },
      { left_wrist: { x: 0.68, y: 0.36 } }, { left_wrist: { x: 0.93, y: 0.36 } },
    ], S) },

  { id: "squad-heart-hands", title: "Hati Squad", description: "Semua membentuk hati di dada.", difficulty: "Medium", tags: ["playful", "y2k"],
    skeletons: lineUp(4, [
      { left_wrist: { x: 0.09, y: 0.2 }, right_wrist: { x: 0.16, y: 0.2 } },
      { left_wrist: { x: 0.34, y: 0.2 }, right_wrist: { x: 0.41, y: 0.2 } },
      { left_wrist: { x: 0.59, y: 0.2 }, right_wrist: { x: 0.66, y: 0.2 } },
      { left_wrist: { x: 0.84, y: 0.2 }, right_wrist: { x: 0.91, y: 0.2 } },
    ], S) },

  { id: "squad-point-up", title: "Menunjuk Atas", description: "Semua menunjuk ke atas.", difficulty: "Medium", tags: ["playful", "street"],
    skeletons: lineUp(4, [
      { right_elbow: { x: 0.18, y: 0.12 }, right_wrist: { x: 0.16, y: 0.0 } },
      { right_elbow: { x: 0.43, y: 0.12 }, right_wrist: { x: 0.41, y: 0.0 } },
      { right_elbow: { x: 0.68, y: 0.12 }, right_wrist: { x: 0.66, y: 0.0 } },
      { right_elbow: { x: 0.93, y: 0.12 }, right_wrist: { x: 0.91, y: 0.0 } },
    ], S) },

  { id: "squad-sitting-row", title: "Duduk Berjajar", description: "Duduk di lantai berjajar rapi.", difficulty: "Medium", tags: ["elegan"],
    skeletons: lineUp(4, [], 0.6) },

  { id: "squad-wave", title: "Melambai Squad", description: "Semua melambai ke kamera.", difficulty: "Easy", tags: ["playful"],
    skeletons: lineUp(4, [
      { right_elbow: { x: 0.18, y: 0.19 }, right_wrist: { x: 0.2, y: 0.03 } },
      { right_elbow: { x: 0.43, y: 0.19 }, right_wrist: { x: 0.45, y: 0.03 } },
      { right_elbow: { x: 0.68, y: 0.19 }, right_wrist: { x: 0.7, y: 0.03 } },
      { right_elbow: { x: 0.93, y: 0.19 }, right_wrist: { x: 0.95, y: 0.03 } },
    ], S) },

  { id: "squad-finger-gun", title: "Finger Gun Squad", description: "Tembak ke kamera bersama.", difficulty: "Medium", tags: ["y2k", "street"],
    skeletons: lineUp(4, [
      { right_elbow: { x: 0.18, y: 0.28 }, right_wrist: { x: 0.14, y: 0.2 } },
      { right_elbow: { x: 0.43, y: 0.28 }, right_wrist: { x: 0.39, y: 0.2 } },
      { right_elbow: { x: 0.68, y: 0.28 }, right_wrist: { x: 0.64, y: 0.2 } },
      { right_elbow: { x: 0.93, y: 0.28 }, right_wrist: { x: 0.89, y: 0.2 } },
    ], S) },

  { id: "squad-pocket", title: "Tangan di Saku", description: "Gaya santai tangan masuk saku.", difficulty: "Easy", tags: ["street"],
    skeletons: lineUp(4, [
      { left_wrist: { x: 0.18, y: 0.48 } }, { left_wrist: { x: 0.43, y: 0.48 } },
      { left_wrist: { x: 0.68, y: 0.48 } }, { left_wrist: { x: 0.93, y: 0.48 } },
    ], S) },

  { id: "squad-chin-rest", title: "Dagu di Tangan", description: "Semua menopang dagu, elegan.", difficulty: "Medium", tags: ["elegan"],
    skeletons: lineUp(4, [
      { right_elbow: { x: 0.18, y: 0.36 }, right_wrist: { x: 0.14, y: 0.16 } },
      { right_elbow: { x: 0.43, y: 0.36 }, right_wrist: { x: 0.39, y: 0.16 } },
      { right_elbow: { x: 0.68, y: 0.36 }, right_wrist: { x: 0.64, y: 0.16 } },
      { right_elbow: { x: 0.93, y: 0.36 }, right_wrist: { x: 0.89, y: 0.16 } },
    ], S) },

  { id: "squad-arms-around", title: "Rangkul Squad", description: "Saling merangkul sepanjang barisan.", difficulty: "Easy", tags: ["elegan", "playful"],
    skeletons: lineUp(4, [
      { right_elbow: { x: 0.22, y: 0.26 }, right_wrist: { x: 0.27, y: 0.2 } },
      { left_elbow: { x: 0.33, y: 0.26 }, left_wrist: { x: 0.3, y: 0.2 }, right_elbow: { x: 0.47, y: 0.26 }, right_wrist: { x: 0.52, y: 0.2 } },
      { left_elbow: { x: 0.58, y: 0.26 }, left_wrist: { x: 0.55, y: 0.2 }, right_elbow: { x: 0.72, y: 0.26 }, right_wrist: { x: 0.77, y: 0.2 } },
      { left_elbow: { x: 0.83, y: 0.26 }, left_wrist: { x: 0.8, y: 0.2 } },
    ], S) },

  { id: "squad-frame-hands", title: "Bikin Frame", description: "Membentuk bingkai bersama.", difficulty: "Medium", tags: ["y2k"],
    skeletons: lineUp(4, [
      { right_wrist: { x: 0.2, y: 0.15 } },
      { left_wrist: { x: 0.38, y: 0.15 }, right_wrist: { x: 0.45, y: 0.15 } },
      { left_wrist: { x: 0.55, y: 0.15 }, right_wrist: { x: 0.62, y: 0.15 } },
      { right_wrist: { x: 0.8, y: 0.15 } },
    ], S) },

  { id: "squad-jump", title: "Lompat Bersama", description: "Semua melompat, tangan terangkat.", difficulty: "Medium", tags: ["playful", "street"],
    skeletons: lineUp(4, [upArms(0.125), upArms(0.375), upArms(0.625), upArms(0.875)], 0.78) },
];
