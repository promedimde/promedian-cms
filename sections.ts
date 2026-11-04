export const sections = [
  { id: "profile", label: "Profil Prodi" },
  { id: "curriculum", label: "Kurikulum" },
  { id: "lecturers", label: "Dosen" },
  { id: "student_works", label: "Karya Mahasiswa" },
  { id: "facilities", label: "Fasilitas" },
  { id: "industry", label: "Industri & Mitra" },
  { id: "campus_life", label: "Campus Life" },
  { id: "admission", label: "Informasi PMB" }
] as const;

export type SectionId = typeof sections[number]["id"];
export const sectionLabel = (id: string) =>
  sections.find((item) => item.id === id)?.label ?? id;
