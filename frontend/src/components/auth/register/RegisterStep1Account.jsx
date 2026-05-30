import { FiLock, FiMail, FiShield } from "react-icons/fi";

import InputField from "../../ui/InputField";
import PasswordInput from "../../ui/PasswordInput";

const RegisterStep1Account = ({
  form,
  passwordStrength,
  onChange,
}) => {
  const colors = ["#EF4444", "#F59E0B", "#3B82F6", "#34D399"];
  const labels = ["Lemah", "Cukup", "Baik", "Kuat!"];
  const score = passwordStrength;

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <div className="inline-block rounded-full border-2 border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-4 py-1 text-sm font-bold text-[#8B5CF6]">
          Buat Akun
        </div>
        <h1 className="mt-3 text-3xl font-extrabold text-[#1E293B]">Mulai Perjalananmu</h1>
        <p className="mt-1 text-sm font-medium text-[#64748B]">Daftar untuk memulai</p>
      </div>

      <InputField
        label="Email"
        type="email"
        id="reg-email"
        name="email"
        required
        placeholder="contoh@email.com"
        value={form.email}
        onChange={onChange}
        icon={FiMail}
        inputClassName="rounded-3xl border-[3px] bg-[#F6F6F2]"
      />

      <div className="space-y-2">
        <PasswordInput
          label="Password"
          id="reg-password"
          name="password"
          required
          placeholder="Min. 8 karakter"
          value={form.password}
          onChange={onChange}
          icon={FiLock}
          inputClassName="rounded-3xl border-[3px] bg-[#F6F6F2]"
        />
        {form.password ? (
          <div className="space-y-1">
            <div className="flex gap-1.5">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className="h-1.5 flex-1 rounded-full transition-colors duration-300"
                  style={{ backgroundColor: idx < score ? colors[score - 1] : "#E2E8F0" }}
                />
              ))}
            </div>
            <p className="text-xs font-medium" style={{ color: score ? colors[score - 1] : "#64748B" }}>
              {score ? labels[score - 1] : ""}
            </p>
          </div>
        ) : null}
      </div>

      <PasswordInput
        label="Konfirmasi Password"
        id="reg-confirm"
        name="confirmPassword"
        required
        placeholder="Ulangi password"
        value={form.confirmPassword}
        onChange={onChange}
        icon={FiShield}
        inputClassName="rounded-3xl border-[3px] bg-[#F6F6F2]"
      />
    </div>
  );
};

export default RegisterStep1Account;
