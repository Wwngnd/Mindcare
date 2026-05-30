import { FiArrowRight, FiLock, FiMail } from "react-icons/fi";

import InputField from "../ui/InputField";
import PasswordInput from "../ui/PasswordInput";

const LoginForm = ({ form, onChange, onSubmit, loading }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <InputField
        label="Email"
        type="email"
        id="login-email"
        name="email"
        required
        placeholder="Masukkan email"
        value={form.email}
        onChange={onChange}
        icon={FiMail}
      />

      <PasswordInput
        label="Password"
        id="login-password"
        name="password"
        required
        placeholder="••••••••"
        value={form.password}
        onChange={onChange}
        icon={FiLock}
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full border-2 border-[#1E293B] bg-[#8B5CF6] px-6 py-4 text-lg font-bold text-white shadow-[4px_4px_0px_0px_#1E293B] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#1E293B] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_#1E293B] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">Memproses...</span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <span>Masuk</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#8B5CF6]">
              <FiArrowRight size={18} />
            </span>
          </span>
        )}
      </button>
    </form>
  );
};

export default LoginForm;
