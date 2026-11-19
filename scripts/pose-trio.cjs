/** Pose kategori TRIO (3 orang, 15 pose). */
const { lineUp, upArms, peaceRight, handsOnHips, body } = require("./pose-group-helpers.cjs");

module.exports = [
  { id: "trio-line-arms-up", title: "Tiga Tangan ke Atas", description: "Semua mengangkat tangan, energik.", difficulty: "Easy", tags: ["playful"],
    skeletons: lineUp(3, [upArms(0.167), upArms(0.5), upArms(0.833)]) },

  { id: "trio-peace-all", title: "Peace Trio", description: "Ketiganya pose peace ke kamera.", difficulty: "Easy", tags: ["playful", "y2k"],
    skeletons: lineUp(3, [peaceRight(0.167), peaceRight(0.5), peaceRight(0.833)]) },

  { id: "trio-heart-trio", title: "Hati Bertiga", description: "Tangan membentuk hati bersama di tengah.", difficulty: "Medium", tags: ["playful", "y2k"],
    skeletons: lineUp(3, [
      { right_wrist: { x: 0.25, y: 0.16 }, right_elbow: { x: 0.28, y: 0.3 } },
      { left_wrist: { x: 0.44, y: 0.14 }, right_wrist: { x: 0.56, y: 0.14 },
        left_elbow: { x: 0.42, y: 0.28 }, right_elbow: { x: 0.58, y: 0.28 } },
      { left_wrist: { x: 0.75, y: 0.16 }, left_elbow: { x: 0.72, y: 0.3 } },
    ]) },

  { id: "trio-superhero", title: "Superhero Trio", description: "Tangan di pinggang, kaki sedikit lebar.", difficulty: "Easy", tags: ["street", "playful"],
    skeletons: lineUp(3, [handsOnHips(0.167), handsOnHips(0.5), handsOnHips(0.833)]) },

  { id: "trio-staggered", title: "Selang-seling", description: "Tengah lebih maju, dua di belakang.", difficulty: "Medium", tags: ["street"],
    skeletons: [body(0.2, 0.85, {}), body(0.5, 1, {}), body(0.8, 0.85, {})] },

  { id: "trio-arms-crossed", title: "Sedekap Trio", description: "Ketiganya tangan bersedekap, cool.", difficulty: "Easy", tags: ["street", "elegan"],
    skeletons: lineUp(3, [
      { left_wrist: { x: 0.24, y: 0.36 } }, { left_wrist: { x: 0.52, y: 0.36 } }, { left_wrist: { x: 0.79, y: 0.36 } },
    ]) },

  { id: "trio-wave", title: "Melambai Trio", description: "Satu tangan melambai ke kamera.", difficulty: "Easy", tags: ["playful"],
    skeletons: lineUp(3, [
      { right_elbow: { x: 0.24, y: 0.19 }, right_wrist: { x: 0.26, y: 0.03 } },
      { right_elbow: { x: 0.57, y: 0.19 }, right_wrist: { x: 0.59, y: 0.03 } },
      { right_elbow: { x: 0.9, y: 0.19 }, right_wrist: { x: 0.92, y: 0.03 } },
    ]) },

  { id: "trio-point-up", title: "Menunjuk Atas", description: "Semua menunjuk ke atas serentak.", difficulty: "Medium", tags: ["playful", "street"],
    skeletons: lineUp(3, [
      { right_elbow: { x: 0.22, y: 0.12 }, right_wrist: { x: 0.2, y: 0.0 } },
      { right_elbow: { x: 0.55, y: 0.12 }, right_wrist: { x: 0.53, y: 0.0 } },
      { right_elbow: { x: 0.88, y: 0.12 }, right_wrist: { x: 0.86, y: 0.0 } },
    ]) },

  { id: "trio-heart-hands", title: "Bikin Hati Trio", description: "Masing-masing bikin hati di depan dada.", difficulty: "Medium", tags: ["playful", "y2k"],
    skeletons: lineUp(3, [
      { left_wrist: { x: 0.13, y: 0.2 }, right_wrist: { x: 0.2, y: 0.2 } },
      { left_wrist: { x: 0.46, y: 0.2 }, right_wrist: { x: 0.54, y: 0.2 } },
      { left_wrist: { x: 0.8, y: 0.2 }, right_wrist: { x: 0.87, y: 0.2 } },
    ]) },

  { id: "trio-chin-rest", title: "Dagu di Tangan", description: "Ketiganya menopang dagu, elegan.", difficulty: "Medium", tags: ["elegan"],
    skeletons: lineUp(3, [
      { right_elbow: { x: 0.22, y: 0.36 }, right_wrist: { x: 0.18, y: 0.16 } },
      { right_elbow: { x: 0.55, y: 0.36 }, right_wrist: { x: 0.51, y: 0.16 } },
      { right_elbow: { x: 0.88, y: 0.36 }, right_wrist: { x: 0.84, y: 0.16 } },
    ]) },

  { id: "trio-finger-gun", title: "Finger Gun Trio", description: "Tembak ke kamera bersama.", difficulty: "Medium", tags: ["y2k", "street"],
    skeletons: lineUp(3, [
      { right_elbow: { x: 0.22, y: 0.28 }, right_wrist: { x: 0.18, y: 0.2 } },
      { right_elbow: { x: 0.55, y: 0.28 }, right_wrist: { x: 0.51, y: 0.2 } },
      { right_elbow: { x: 0.88, y: 0.28 }, right_wrist: { x: 0.84, y: 0.2 } },
    ]) },

  { id: "trio-pocket", title: "Tangan di Saku", description: "Santai, tangan masuk saku.", difficulty: "Easy", tags: ["street"],
    skeletons: lineUp(3, [
      { left_wrist: { x: 0.22, y: 0.48 } }, { left_wrist: { x: 0.55, y: 0.48 } }, { left_wrist: { x: 0.88, y: 0.48 } },
    ]) },

  { id: "trio-frame-hands", title: "Bikin Frame", description: "Membentuk bingkai di depan kamera.", difficulty: "Medium", tags: ["y2k"],
    skeletons: lineUp(3, [
      { right_wrist: { x: 0.24, y: 0.15 } }, { left_wrist: { x: 0.44, y: 0.15 }, right_wrist: { x: 0.56, y: 0.15 } },
      { right_wrist: { x: 0.76, y: 0.15 } },
    ]) },

  { id: "trio-sitting", title: "Duduk Bertiga", description: "Duduk di lantai berjejer.", difficulty: "Medium", tags: ["elegan"],
    skeletons: lineUp(3, [], 0.6) },

  { id: "trio-arms-around", title: "Rangkul Bertiga", description: "Saling merangkul bahu.", difficulty: "Easy", tags: ["elegan", "playful"],
    skeletons: lineUp(3, [
      { right_elbow: { x: 0.28, y: 0.26 }, right_wrist: { x: 0.34, y: 0.2 } },
      { left_elbow: { x: 0.42, y: 0.26 }, left_wrist: { x: 0.36, y: 0.2 },
        right_elbow: { x: 0.58, y: 0.26 }, right_wrist: { x: 0.64, y: 0.2 } },
      { left_elbow: { x: 0.72, y: 0.26 }, left_wrist: { x: 0.66, y: 0.2 } },
    ]) },
];
