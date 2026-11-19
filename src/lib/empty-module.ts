/**
 * Stub untuk paket MediaPipe opsional.
 * ==================================
 * Dipakai sebagai alias bundler untuk paket MediaPipe yang dibawa
 * `@tensorflow-models/pose-detection` dan `@tensorflow-models/face-detection`.
 *
 * Latar belakang: kedua library meng-import paket MediaPipe secara
 * top-level walaupun kita hanya memakai runtime `tfjs`. Paket MediaPipe
 * adalah bundle UMD tanpa export ESM, sehingga bundler gagal me-resolve.
 *
 * File ini menyediakan export bernama yang dibutuhkan (supaya resolusi
 * berhasil) tapi TIDAK PERNAH dipanggil — runtime yang dipakai selalu
 * `tfjs`, jadi kelas-kelas ini tak pernah di-instansiasi.
 */

const notUsed = () => {
  throw new Error(
    "Runtime MediaPipe tidak dipakai LumiBooth (memakai tfjs).",
  );
};

/** Placeholder untuk `import { Pose } from "@mediapipe/pose"`. */
export class Pose {
  constructor() {
    notUsed();
  }
}

/** Placeholder untuk `import { FaceDetection } from "@mediapipe/face_detection"`. */
export class FaceDetection {
  constructor() {
    notUsed();
  }
}

/** Placeholder untuk `import { FaceMesh } from "@mediapipe/face_mesh"`. */
export class FaceMesh {
  constructor() {
    notUsed();
  }
}

/** Placeholder untuk `import { Hands } from "@mediapipe/hands"`. */
export class Hands {
  constructor() {
    notUsed();
  }
}
