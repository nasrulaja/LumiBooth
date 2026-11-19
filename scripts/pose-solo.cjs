/** Pose kategori SOLO (17 pose). */
const { body } = require("./pose-helpers.cjs");

module.exports = [
  { id: "solo-hand-on-hip", title: "Tangan di Pinggang", description: "Satu tangan di pinggang, dada tegak percaya diri.", difficulty: "Easy", tags: ["elegan", "street"],
    skeleton: body(0.5, 1, { left_elbow: { x: 0.28, y: 0.34 }, left_wrist: { x: 0.37, y: 0.47 } }) },

  { id: "solo-peace-sign", title: "Peace di Pipi", description: "Dua jari di samping pipi, senyum manis.", difficulty: "Easy", tags: ["playful", "y2k"],
    skeleton: body(0.5, 1, { right_elbow: { x: 0.72, y: 0.3 }, right_wrist: { x: 0.58, y: 0.13 } }) },

  { id: "solo-arms-crossed", title: "Tangan Bersedekap", description: "Kedua tangan menyilang di depan dada.", difficulty: "Easy", tags: ["street", "elegan"],
    skeleton: body(0.5, 1, {
      left_elbow: { x: 0.3, y: 0.33 }, right_elbow: { x: 0.7, y: 0.33 },
      left_wrist: { x: 0.62, y: 0.36 }, right_wrist: { x: 0.38, y: 0.36 },
    }) },

  { id: "solo-hands-up", title: "Tangan ke Atas", description: "Kedua tangan terangkat, selebrasi ringan.", difficulty: "Easy", tags: ["playful"],
    skeleton: body(0.5, 1, {
      left_elbow: { x: 0.24, y: 0.16 }, left_wrist: { x: 0.22, y: 0.02 },
      right_elbow: { x: 0.76, y: 0.16 }, right_wrist: { x: 0.78, y: 0.02 },
    }) },

  { id: "solo-heart-hands", title: "Bikin Hati", description: "Dua tangan membentuk hati di depan dada.", difficulty: "Medium", tags: ["playful", "y2k"],
    skeleton: body(0.5, 1, {
      left_elbow: { x: 0.36, y: 0.32 }, right_elbow: { x: 0.64, y: 0.32 },
      left_wrist: { x: 0.46, y: 0.2 }, right_wrist: { x: 0.54, y: 0.2 },
    }) },

  { id: "solo-look-away", title: "Lihat ke Samping", description: "Kepala menoleh, tangan menyentuh leher.", difficulty: "Medium", tags: ["elegan"],
    skeleton: body(0.5, 1, {
      nose: { x: 0.44, y: 0.09 },
      right_elbow: { x: 0.68, y: 0.34 }, right_wrist: { x: 0.57, y: 0.26 },
    }) },

  { id: "solo-wave", title: "Melambai", description: "Satu tangan terangkat melambai ke kamera.", difficulty: "Easy", tags: ["playful"],
    skeleton: body(0.5, 1, { right_elbow: { x: 0.74, y: 0.19 }, right_wrist: { x: 0.76, y: 0.03 } }) },

  { id: "solo-pocket", title: "Tangan di Saku", description: "Satu tangan masuk saku, gaya santai.", difficulty: "Easy", tags: ["street", "elegan"],
    skeleton: body(0.5, 1, { left_elbow: { x: 0.32, y: 0.35 }, left_wrist: { x: 0.43, y: 0.48 } }) },

  { id: "solo-finger-gun", title: "Finger Gun", description: "Tembak ke kamera dengan satu tangan.", difficulty: "Medium", tags: ["y2k", "street"],
    skeleton: body(0.5, 1, { right_elbow: { x: 0.7, y: 0.28 }, right_wrist: { x: 0.6, y: 0.2 } }) },

  { id: "solo-chin-rest", title: "Dagu di Tangan", description: "Tangan menopang dagu, ekspresi tenang.", difficulty: "Medium", tags: ["elegan"],
    skeleton: body(0.5, 1, { right_elbow: { x: 0.66, y: 0.36 }, right_wrist: { x: 0.55, y: 0.16 } }) },

  { id: "solo-crouch", title: "Jongkok Santai", description: "Jongkok rendah, satu tangan menyentuh lutut.", difficulty: "Medium", tags: ["street"],
    skeleton: body(0.5, 0.72, {
      left_knee: { x: 0.34, y: 0.62 }, right_knee: { x: 0.66, y: 0.62 },
      left_wrist: { x: 0.36, y: 0.6 },
    }) },

  { id: "solo-side-profile", title: "Profil Samping", description: "Badan menyamping, tangan di belakang.", difficulty: "Medium", tags: ["elegan"],
    skeleton: body(0.5, 1, {
      nose: { x: 0.42, y: 0.09 },
      left_shoulder: { x: 0.44, y: 0.2 }, right_shoulder: { x: 0.56, y: 0.2 },
      left_wrist: { x: 0.62, y: 0.46 },
    }) },

  { id: "solo-superhero", title: "Superhero", description: "Kedua tangan di pinggang, kaki sedikit lebar.", difficulty: "Easy", tags: ["playful", "street"],
    skeleton: body(0.5, 1, {
      left_elbow: { x: 0.26, y: 0.33 }, right_elbow: { x: 0.74, y: 0.33 },
      left_wrist: { x: 0.36, y: 0.48 }, right_wrist: { x: 0.64, y: 0.48 },
      left_ankle: { x: 0.3, y: 0.98 }, right_ankle: { x: 0.7, y: 0.98 },
    }) },

  { id: "solo-blow-kiss", title: "Kiss ke Kamera", description: "Tangan ke mulut, gestur meniup ciuman.", difficulty: "Medium", tags: ["playful", "y2k"],
    skeleton: body(0.5, 1, { right_elbow: { x: 0.68, y: 0.3 }, right_wrist: { x: 0.55, y: 0.12 } }) },

  { id: "solo-hair-flip", title: "Main Rambut", description: "Satu tangan menyentuh rambut, kepala sedikit miring.", difficulty: "Medium", tags: ["elegan", "y2k"],
    skeleton: body(0.5, 1, {
      nose: { x: 0.52, y: 0.1 },
      left_elbow: { x: 0.28, y: 0.24 }, left_wrist: { x: 0.43, y: 0.11 },
    }) },

  { id: "solo-point-up", title: "Menunjuk Atas", description: "Satu tangan menunjuk ke atas, pose dinamis.", difficulty: "Easy", tags: ["playful", "street"],
    skeleton: body(0.5, 1, { right_elbow: { x: 0.72, y: 0.14 }, right_wrist: { x: 0.7, y: 0.0 } }) },

  { id: "solo-sitting-cross", title: "Duduk Bersila", description: "Duduk bersila dengan tangan di lutut.", difficulty: "Medium", tags: ["elegan"],
    skeleton: body(0.5, 0.6, {
      left_knee: { x: 0.3, y: 0.72 }, right_knee: { x: 0.7, y: 0.72 },
      left_wrist: { x: 0.32, y: 0.7 }, right_wrist: { x: 0.68, y: 0.7 },
    }) },
];
