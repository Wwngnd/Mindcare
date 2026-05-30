import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiBriefcase, FiCalendar, FiCamera, FiLogOut, FiMail, FiMenu, FiUser } from "react-icons/fi";

import AppSidebar from "../../components/layout/AppSidebar";
import { apiRequest, clearAuth } from "../../lib/api";
import { readAppData, writeAppData } from "../../lib/storage";

const apiBaseUrl = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/+$/, "").replace(/\/api$/i, "");

const getAvatarSrc = (avatar) => {
  if (!avatar) return "";
  if (avatar.startsWith("http") || avatar.startsWith("data:")) return avatar;
  return `${apiBaseUrl}${avatar.startsWith("/") ? avatar : `/${avatar}`}`;
};

const Profile = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(readAppData("user", {}));

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await apiRequest("/api/auth/me");
        const nextUser = res?.payload?.user ?? {};
        setUser(nextUser);
        writeAppData("user", nextUser);
      } catch (err) {
        setError(err?.message || "Gagal mengambil data profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const initials = useMemo(() => {
    const words = (user?.name || user?.email || "User").trim().split(/\s+/);
    return words.slice(0, 2).map((word) => word[0]?.toUpperCase()).join("");
  }, [user]);

  const profileItems = [
    { label: "Username", value: user?.name || "-", icon: FiUser },
    { label: "Email", value: user?.email || "-", icon: FiMail },
    { label: "Umur", value: user?.umur ? `${user.umur} tahun` : "-", icon: FiCalendar },
    { label: "Pekerjaan", value: user?.pekerjaan || "-", icon: FiBriefcase },
  ];

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar.");
      return;
    }

    if (file.size > 1024 * 1024) {
      setError("Ukuran foto maksimal 1MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        setSavingAvatar(true);
        setError("");
        const res = await apiRequest("/api/users/me", {
          method: "PUT",
          body: { avatar: reader.result },
        });
        const nextUser = res?.payload ?? { ...user, avatar: reader.result };
        setUser(nextUser);
        writeAppData("user", nextUser);
        window.dispatchEvent(new Event("mindcare:user-updated"));
      } catch (err) {
        setError(err?.message || "Gagal menyimpan foto profile.");
      } finally {
        setSavingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = async () => {
    try {
      await apiRequest("/api/auth/logout", { method: "DELETE" });
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      clearAuth();
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F9] text-[#1E293B]">
      <div className="flex min-h-screen">
        <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activeMenu="Profile" />

        <main className="flex-1 min-h-screen">
          <div className="p-4 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#1E293B] bg-white shadow-[4px_4px_0px_0px_#1E293B]"
              aria-label="Buka menu"
            >
              <FiMenu size={20} />
            </button>
          </div>

          <div className="mx-auto max-w-4xl space-y-6 p-6 lg:p-10">
            <div className="flex flex-col gap-4 pr-14 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-[#8B5CF6]">Akun Saya</p>
                <h1 className="mt-2 text-3xl font-extrabold text-[#1E293B]">Profile</h1>
              </div>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#1E293B] bg-[#F43F5E] px-5 py-3 font-extrabold text-white shadow-[4px_4px_0px_0px_#1E293B] transition-all hover:-translate-y-0.5"
              >
                <FiLogOut size={18} />
                Logout
              </button>
            </div>

            {error ? (
              <div className="rounded-2xl border-2 border-[#F43F5E] bg-[#FFF1F2] p-4 font-bold text-[#BE123C]">
                {error}
              </div>
            ) : null}

            <section className="rounded-[24px] border-2 border-[#1E293B] bg-white p-6 shadow-[8px_8px_0px_0px_#1E293B]">
              {loading ? (
                <div className="flex min-h-72 items-center justify-center">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#8B5CF6] border-t-transparent"></div>
                </div>
              ) : (
                <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
                  <div className="flex flex-col items-center justify-center rounded-2xl bg-[#F5F3FF] p-6 text-center">
                    <div className="relative">
                      {user?.avatar ? (
                        <img
                          src={getAvatarSrc(user.avatar)}
                          alt={user?.name || "Profile"}
                          className="h-32 w-32 rounded-full border-4 border-[#1E293B] object-cover"
                        />
                      ) : (
                        <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-[#1E293B] bg-[#8B5CF6] text-4xl font-extrabold text-white">
                          {initials}
                        </div>
                      )}
                      <label className="absolute bottom-1 right-1 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-2 border-[#1E293B] bg-white text-[#1E293B] shadow-[3px_3px_0px_0px_#1E293B] transition-all hover:-translate-y-0.5">
                        <FiCamera size={18} />
                        <input type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only" />
                      </label>
                    </div>
                    <h2 className="mt-4 text-xl font-extrabold">{user?.name || "User"}</h2>
                    <p className="mt-1 break-all text-sm font-medium text-[#64748B]">{user?.email || "-"}</p>
                    {savingAvatar ? <p className="mt-3 text-sm font-bold text-[#8B5CF6]">Menyimpan foto...</p> : null}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {profileItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.label} className="rounded-2xl border-2 border-[#CBD5E1] bg-[#FFFDF5] p-4">
                          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6]">
                            <Icon size={20} />
                          </div>
                          <p className="text-xs font-bold uppercase tracking-wider text-[#64748B]">{item.label}</p>
                          <p className="mt-1 break-words text-lg font-extrabold text-[#1E293B]">{item.value}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[24px] border-4 border-[#1E293B] bg-[#FFFDF5] p-6 text-center shadow-[8px_8px_0px_0px_#1E293B]">
            <h3 className="mb-2 text-2xl font-extrabold text-[#1E293B]">Yakin ingin keluar?</h3>
            <p className="mb-6 font-medium text-[#64748B]">
              Anda harus login kembali untuk mengakses fitur MindCare.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-[12px] border-2 border-[#1E293B] bg-white py-3 text-center font-bold text-[#1E293B] shadow-[4px_4px_0px_0px_#1E293B] transition-all hover:-translate-y-0.5"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 rounded-[12px] border-2 border-[#1E293B] bg-[#F43F5E] py-3 text-center font-bold text-white shadow-[4px_4px_0px_0px_#1E293B] transition-all hover:-translate-y-0.5"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
