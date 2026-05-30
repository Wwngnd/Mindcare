import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthCard from "../../components/auth/AuthCard";
import AuthError from "../../components/auth/AuthError";
import AuthLogo from "../../components/auth/AuthLogo";
import RegisterNavigation from "../../components/auth/register/RegisterNavigation";
import RegisterStep1Account from "../../components/auth/register/RegisterStep1Account";
import RegisterStep2Biodata from "../../components/auth/register/RegisterStep2Biodata";
import { apiRequest } from "../../lib/api";
import { writeAppData } from "../../lib/storage";

const totalSteps = 2;
const allowedJobs = ["mahasiswa", "pelajar", "karyawan", "wirausaha"];

const calculatePasswordStrength = (value) => {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^a-zA-Z0-9]/.test(value)) score += 1;
  return score;
};

const Register = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [accountForm, setAccountForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [bioForm, setBioForm] = useState({
    name: "",
    umur: "",
    pekerjaan: "",
    gender: "",
  });

  const passwordStrength = useMemo(
    () => calculatePasswordStrength(accountForm.password),
    [accountForm.password],
  );

  const handleAccountChange = (event) => {
    setError("");
    const { name, value } = event.target;
    setAccountForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBioChange = (event) => {
    setError("");
    const { name, value } = event.target;
    setBioForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateStep1 = () => {
    if (!accountForm.email) return "Email harus diisi!";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(accountForm.email)) return "Format email tidak valid!";
    if (!accountForm.password) return "Password harus diisi!";
    if (accountForm.password.length < 8) return "Password minimal 8 karakter!";
    if (accountForm.password !== accountForm.confirmPassword) return "Password dan konfirmasi tidak cocok!";
    return "";
  };

  const validateStep2 = () => {
    if (!bioForm.name) return "Nama lengkap harus diisi!";
    if (bioForm.name.length < 2) return "Nama minimal 2 karakter!";
    if (!bioForm.umur) return "Umur harus diisi!";
    const umur = Number(bioForm.umur);
    if (!Number.isInteger(umur) || umur < 1 || umur > 120) return "Umur harus berupa angka 1 sampai 120!";
    if (!bioForm.pekerjaan) return "Pekerjaan harus diisi!";
    if (!allowedJobs.includes(bioForm.pekerjaan)) return "Pilih pekerjaan yang tersedia!";
    if (!bioForm.gender) return "Pilih jenis kelamin!";
    return "";
  };

  // Auto-login setelah register berhasil, simpan token ke storage
  const autoLogin = async (email, password) => {
    const loginRes = await apiRequest("/api/auth/login", {
      method: "POST",
      auth: false,
      body: { email, password },
    });

    const accessToken = loginRes?.payload?.token?.accessToken ?? null;
    const user = {
      id: loginRes?.payload?.id ?? null,
      name: loginRes?.payload?.name ?? "",
      email: loginRes?.payload?.email ?? "",
      avatar: loginRes?.payload?.avatar ?? "",
      jenis_kelamin: loginRes?.payload?.jenis_kelamin ?? "",
      umur: loginRes?.payload?.umur ?? "",
      pekerjaan: loginRes?.payload?.pekerjaan ?? "",
    };

    if (accessToken) writeAppData("auth", { accessToken });
    writeAppData("user", user);
  };

  const handleNext = () => {
    setError("");
    if (currentStep === 1) {
      const message = validateStep1();
      if (message) return setError(message);
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      const message = validateStep2();
      if (message) return setError(message);

      const payload = {
        name: bioForm.name,
        email: accountForm.email,
        password: accountForm.password,
        confPassword: accountForm.confirmPassword,
        jenis_kelamin: bioForm.gender,
        umur: Number(bioForm.umur),
        pekerjaan: bioForm.pekerjaan,
      };

      setLoading(true);
      apiRequest("/api/users/register", {
        method: "POST",
        auth: false,
        body: payload,
      })
        .then(() => autoLogin(accountForm.email, accountForm.password))
        .then(() => {
          setShowOfferModal(true);
        })
        .catch((err) => {
          setError(err?.message || "Registrasi gagal.");
        })
        .finally(() => setLoading(false));
      return;
    }
  };

  const handleBack = () => {
    setError("");
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] px-4 py-4 md:py-6 flex items-center justify-center">
      <div className="w-full max-w-lg">
        <AuthCard className="rounded-[42px] bg-[#EFEFF2] p-5 md:p-7 shadow-[10px_10px_0px_0px_#CFD4DE]">
          <AuthLogo widthClass="w-48" />
          <AuthError message={error} />

          {currentStep === 1 ? (
            <RegisterStep1Account
              form={accountForm}
              passwordStrength={passwordStrength}
              onChange={handleAccountChange}
            />
          ) : null}

          {currentStep === 2 ? <RegisterStep2Biodata form={bioForm} onChange={handleBioChange} /> : null}

          <RegisterNavigation
            currentStep={currentStep}
            totalSteps={totalSteps}
            isQuizLastQuestion={false}
            onBack={handleBack}
            onNext={handleNext}
            loading={loading}
          />
        </AuthCard>

        <div className="mt-6 text-center">
          <p className="font-medium text-[#64748B]">
            Sudah punya akun?{" "}
            <Link
              to="/"
              className="font-bold text-[#8B5CF6] underline decoration-2 underline-offset-4 transition-colors hover:text-pink-400"
            >
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>

      {showOfferModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-sm rounded-[32px] border-4 border-[#1E293B] bg-white p-8 shadow-[8px_8px_0px_0px_#1E293B]">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#8B5CF6]/10 text-3xl">
                ✨
              </div>
              <h2 className="mb-2 text-2xl font-extrabold text-[#1E293B]">Registrasi Berhasil!</h2>
              <p className="mb-6 text-sm font-medium text-[#64748B]">
                Mau coba fitur Cek Stress sekarang untuk mendapatkan rekomendasi aktivitas yang pas buat kamu?
              </p>

              <div className="space-y-3">
                <button
                  id="btn-cek-stress"
                  onClick={() => navigate("/stress-check")}
                  className="w-full rounded-2xl border-2 border-[#1E293B] bg-[#8B5CF6] py-3 font-bold text-white shadow-[4px_4px_0px_0px_#1E293B] transition-all hover:-translate-y-0.5"
                >
                  Ya, Cek Sekarang
                </button>
                <button
                  id="btn-ke-dashboard"
                  onClick={() => navigate("/dashboard")}
                  className="w-full rounded-2xl border-2 border-[#1E293B] bg-white py-3 font-bold text-[#1E293B] transition-all hover:bg-slate-50"
                >
                  Nanti Saja
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
