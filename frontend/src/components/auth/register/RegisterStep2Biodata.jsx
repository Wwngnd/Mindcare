import { FiBriefcase, FiCalendar, FiUser, FiUsers } from "react-icons/fi";

import InputField from "../../ui/InputField";

// Backend hanya menerima: "laki-laki" | "perempuan" (lowercase)
const genders = [
  { value: "laki-laki", label: "Laki-laki", emoji: "👨" },
  { value: "perempuan", label: "Perempuan", emoji: "👩" },
];

const jobs = [
  { value: "mahasiswa", label: "Mahasiswa" },
  { value: "pelajar", label: "Pelajar" },
  { value: "karyawan", label: "Karyawan" },
  { value: "wirausaha", label: "Wirausaha" },
];

const RegisterStep2Biodata = ({ form, onChange }) => {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <div className="inline-block rounded-full border-2 border-pink-400/40 bg-pink-400/10 px-4 py-1 text-sm font-bold text-pink-500">
          Biodata Diri
        </div>
        <h1 className="mt-3 text-3xl font-extrabold text-[#1E293B]">Kenalan Yuk!</h1>
        <p className="mt-1 text-sm font-medium text-[#64748B]">Ceritakan sedikit tentang dirimu</p>
      </div>

      <InputField
        label="Nama Lengkap"
        id="bio-name"
        name="name"
        required
        placeholder="Masukkan nama lengkap"
        value={form.name}
        onChange={onChange}
        icon={FiUser}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField
          label="Umur"
          type="number"
          id="bio-age"
          name="umur"
          required
          min="1"
          max="120"
          placeholder="Contoh: 21"
          value={form.umur}
          onChange={onChange}
          icon={FiCalendar}
        />

        <div className="space-y-2">
          <label htmlFor="bio-job" className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
            <FiBriefcase className="text-[#8B5CF6]" size={16} />
            Pekerjaan
          </label>
          <select
            id="bio-job"
            name="pekerjaan"
            required
            value={form.pekerjaan}
            onChange={onChange}
            className="w-full rounded-2xl border-2 border-[#1E293B] bg-[#FFFDF5] px-4 py-3.5 font-medium text-[#1E293B] focus:outline-none focus:border-[#8B5CF6] focus:shadow-[4px_4px_0px_0px_#8B5CF6] transition-all duration-200"
          >
            <option value="">Pilih pekerjaan</option>
            {jobs.map((job) => (
              <option key={job.value} value={job.value}>
                {job.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
          <FiUsers className="text-pink-500" size={16} />
          Gender
        </p>
        <div className="grid grid-cols-2 gap-3">
          {genders.map((gender) => {
            const checked = form.gender === gender.value;
            return (
              <label key={gender.value} className="cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value={gender.value}
                  checked={checked}
                  onChange={onChange}
                  className="sr-only"
                />
                <div
                  className={`rounded-2xl border-2 p-3.5 flex items-center gap-2 transition-all ${
                    checked
                      ? "border-[#8B5CF6] bg-[#F5F3FF] shadow-[4px_4px_0px_0px_#8B5CF6]"
                      : "border-[#1E293B] hover:bg-slate-50"
                  }`}
                >
                  <span className="text-lg">{gender.emoji}</span>
                  <span className="text-sm font-bold text-[#1E293B]">{gender.label}</span>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RegisterStep2Biodata;
