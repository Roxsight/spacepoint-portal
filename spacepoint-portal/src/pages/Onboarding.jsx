import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../lib/auth";

const roles = ["instructor", "ambassador", "intern"];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");
  const [organization, setOrganization] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  async function handleFinish() {
    setError("");
    setLoading(true);

    const { error: updateError } = await updateProfile(user.id, {
      full_name: fullName,
      country,
      organization,
      role,
      onboarding_complete: true,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    await refreshProfile(user.id);
    setLoading(false);
    navigate("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <section className="w-full max-w-xl rounded-lg border border-slate-800 bg-slate-900 p-8">
        <div className="mb-6 flex gap-2">
          {[1, 2, 3].map((item) => (
            <div className={`h-2 flex-1 rounded-full ${step >= item ? "bg-cyan-300" : "bg-slate-700"}`} key={item} />
          ))}
        </div>

        {error && <p className="mb-4 rounded-md bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold">Profile</h1>
              <p className="mt-2 text-sm text-slate-400">Tell us who you are.</p>
            </div>
            <label className="block space-y-2">
              <span className="text-sm text-slate-300">Full name</span>
              <input className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-cyan-300" onChange={(event) => setFullName(event.target.value)} value={fullName} />
            </label>
            <label className="block space-y-2">
              <span className="text-sm text-slate-300">Country</span>
              <input className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-cyan-300" onChange={(event) => setCountry(event.target.value)} value={country} />
            </label>
            <button className="w-full rounded-md bg-cyan-300 px-4 py-2 font-semibold text-slate-950 disabled:opacity-50" disabled={!fullName || !country} onClick={() => setStep(2)}>
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold">Organization</h1>
              <p className="mt-2 text-sm text-slate-400">Add your school, company, or institution.</p>
            </div>
            <label className="block space-y-2">
              <span className="text-sm text-slate-300">Organization</span>
              <input className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-cyan-300" onChange={(event) => setOrganization(event.target.value)} value={organization} />
            </label>
            <div className="flex gap-3">
              <button className="flex-1 rounded-md border border-slate-700 px-4 py-2" onClick={() => setStep(1)}>
                Back
              </button>
              <button className="flex-1 rounded-md bg-cyan-300 px-4 py-2 font-semibold text-slate-950" onClick={() => setStep(3)}>
                Next
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold">Role</h1>
              <p className="mt-2 text-sm text-slate-400">Choose your dashboard type.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {roles.map((item) => (
                <button
                  className={`rounded-md border px-4 py-3 capitalize ${role === item ? "border-cyan-300 bg-cyan-300 text-slate-950" : "border-slate-700 bg-slate-950 text-white"}`}
                  key={item}
                  onClick={() => setRole(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button className="flex-1 rounded-md border border-slate-700 px-4 py-2" onClick={() => setStep(2)}>
                Back
              </button>
              <button className="flex-1 rounded-md bg-cyan-300 px-4 py-2 font-semibold text-slate-950 disabled:opacity-50" disabled={!role || loading} onClick={handleFinish}>
                {loading ? "Saving..." : "Finish"}
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
