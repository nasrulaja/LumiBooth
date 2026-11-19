/** Pose kategori COUPLE (2 orang, 15 pose). */
const { body } = require("./pose-helpers.cjs");

module.exports = [
  { id: "couple-side-hug", title: "Peluk Samping", description: "Berdiri berdampingan, saling merangkul bahu.", difficulty: "Easy", tags: ["elegan"],
    skeletons: [body(0.34, 1, { right_elbow: { x: 0.47, y: 0.28 }, right_wrist: { x: 0.52, y: 0.2 } }),
                body(0.66, 1, { left_elbow: { x: 0.53, y: 0.28 }, left_wrist: { x: 0.48, y: 0.2 } })] },

  { id: "couple-heart-together", title: "Hati Berdua", description: "Kedua tangan diangkat membentuk setengah hati.", difficulty: "Medium", tags: ["playful"],
    skeletons: [body(0.34, 1, { right_elbow: { x: 0.45, y: 0.18 }, right_wrist: { x: 0.5, y: 0.06 } }),
                body(0.66, 1, { left_elbow: { x: 0.55, y: 0.18 }, left_wrist: { x: 0.5, y: 0.06 } })] },

  { id: "couple-back-to-back", title: "Punggung Bersandar", description: "Saling membelakangi, tangan bersedekap.", difficulty: "Easy", tags: ["street"],
    skeletons: [body(0.36, 1, { left_wrist: { x: 0.5, y: 0.36 } }),
                body(0.64, 1, { right_wrist: { x: 0.5, y: 0.36 } })] },

  { id: "couple-peace-duo", title: "Peace Berdua", description: "Dua-duanya pose peace di depan kamera.", difficulty: "Easy", tags: ["playful", "y2k"],
    skeletons: [body(0.34, 1, { right_elbow: { x: 0.44, y: 0.3 }, right_wrist: { x: 0.4, y: 0.13 } }),
                body(0.66, 1, { left_elbow: { x: 0.56, y: 0.3 }, left_wrist: { x: 0.6, y: 0.13 } })] },

  { id: "couple-piggyback", title: "Gendong", description: "Satu orang digendong di punggung.", difficulty: "Medium", tags: ["playful"],
    skeletons: [body(0.4, 1, {}),
                body(0.6, 0.78, { left_wrist: { x: 0.44, y: 0.12 }, right_wrist: { x: 0.52, y: 0.14 } })] },

  { id: "couple-dip", title: "Gaya Dansa", description: "Satu menopang, satu menekuk ke belakang.", difficulty: "Medium", tags: ["elegan"],
    skeletons: [body(0.38, 1, { left_elbow: { x: 0.5, y: 0.28 }, left_wrist: { x: 0.6, y: 0.24 } }),
                body(0.66, 0.8, { nose: { x: 0.74, y: 0.3 } })] },

  { id: "couple-hand-heart", title: "Hati Pakai Tangan", description: "Berdempetan, satu tangan bikin setengah hati.", difficulty: "Easy", tags: ["playful", "y2k"],
    skeletons: [body(0.34, 1, { right_elbow: { x: 0.42, y: 0.3 }, right_wrist: { x: 0.46, y: 0.18 } }),
                body(0.66, 1, { left_elbow: { x: 0.58, y: 0.3 }, left_wrist: { x: 0.54, y: 0.18 } })] },

  { id: "couple-mirror-pose", title: "Pose Mirror", description: "Satu tangan ke atas, satu tangan ke bawah.", difficulty: "Medium", tags: ["street", "y2k"],
    skeletons: [body(0.34, 1, { right_wrist: { x: 0.4, y: 0.04 } }),
                body(0.66, 1, { left_wrist: { x: 0.6, y: 0.5 } })] },

  { id: "couple-look-each-other", title: "Saling Menatap", description: "Badan menghadap satu sama lain, senyum.", difficulty: "Easy", tags: ["elegan"],
    skeletons: [body(0.34, 1, { nose: { x: 0.4, y: 0.09 } }),
                body(0.66, 1, { nose: { x: 0.6, y: 0.09 } })] },

  { id: "couple-fist-bump", title: "Tos Kepalan", description: "Kepalan tangan saling bertemu di tengah.", difficulty: "Easy", tags: ["street", "playful"],
    skeletons: [body(0.34, 1, { right_elbow: { x: 0.44, y: 0.26 }, right_wrist: { x: 0.5, y: 0.24 } }),
                body(0.66, 1, { left_elbow: { x: 0.56, y: 0.26 }, left_wrist: { x: 0.5, y: 0.24 } })] },

  { id: "couple-cheek-to-cheek", title: "Pipi Tempel", description: "Pipi berdekatan, kepala sedikit miring.", difficulty: "Easy", tags: ["playful"],
    skeletons: [body(0.38, 1, { nose: { x: 0.44, y: 0.1 } }),
                body(0.62, 1, { nose: { x: 0.56, y: 0.1 } })] },

  { id: "couple-frame-hands", title: "Bikin Frame", description: "Kedua tangan membentuk bingkai di depan.", difficulty: "Medium", tags: ["y2k"],
    skeletons: [body(0.34, 1, { right_elbow: { x: 0.45, y: 0.24 }, right_wrist: { x: 0.47, y: 0.14 } }),
                body(0.66, 1, { left_elbow: { x: 0.55, y: 0.24 }, left_wrist: { x: 0.53, y: 0.14 } })] },

  { id: "couple-sitting-ground", title: "Duduk Berdua", description: "Duduk di lantai, tangan di lutut.", difficulty: "Medium", tags: ["elegan"],
    skeletons: [body(0.34, 0.6, { left_knee: { x: 0.26, y: 0.72 }, right_knee: { x: 0.42, y: 0.72 } }),
                body(0.66, 0.6, { left_knee: { x: 0.58, y: 0.72 }, right_knee: { x: 0.74, y: 0.72 } })] },

  { id: "couple-superhero-duo", title: "Duo Superhero", description: "Keduanya tangan di pinggang, kaki lebar.", difficulty: "Easy", tags: ["playful", "street"],
    skeletons: [body(0.34, 1, { left_elbow: { x: 0.22, y: 0.33 }, right_elbow: { x: 0.46, y: 0.33 },
                                left_wrist: { x: 0.28, y: 0.48 }, right_wrist: { x: 0.4, y: 0.48 } }),
                body(0.66, 1, { left_elbow: { x: 0.54, y: 0.33 }, right_elbow: { x: 0.78, y: 0.33 },
                                left_wrist: { x: 0.6, y: 0.48 }, right_wrist: { x: 0.72, y: 0.48 } })] },

  { id: "couple-one-knee", title: "Satu Lutut", description: "Satu orang berlutut, satu berdiri di samping.", difficulty: "Medium", tags: ["elegan"],
    skeletons: [body(0.34, 1, {}),
                body(0.66, 0.72, { left_knee: { x: 0.6, y: 0.62 }, right_knee: { x: 0.72, y: 0.62 } })] },
];
