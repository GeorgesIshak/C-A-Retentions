"use client";

import { useActionState, useEffect, useState, startTransition } from "react";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react"; // 👈 icons
import { changePasswordAction, type ChangePwState } from "@/lib/actions/auth";

const initial: ChangePwState = { ok: false, message: "" };

export default function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, initial);

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!state.message) return;
    if (state.ok) {
      toast.success(state.message);
      setCurrent("");
      setNext("");
      setConfirm("");
    } else {
      toast.error(state.message);
    }
  }, [state]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => formAction(fd));
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
      autoComplete="off"
    >
      {/* OLD PASSWORD */}
      <PasswordField
        label="Old Password"
        name="currentPassword"
        value={current}
        setValue={setCurrent}
        show={showCurrent}
        toggleShow={() => setShowCurrent((s) => !s)}
        placeholder="Enter old Password"
        autoComplete="current-password"
      />

      {/* NEW PASSWORD */}
      <PasswordField
        label="New Password"
        name="newPassword"
        value={next}
        setValue={setNext}
        show={showNext}
        toggleShow={() => setShowNext((s) => !s)}
        placeholder="Enter New Password"
        autoComplete="new-password"
      />

      {/* CONFIRM NEW PASSWORD */}
      <PasswordField
        label="Confirm New Password"
        name="confirmNewPassword"
        value={confirm}
        setValue={setConfirm}
        show={showConfirm}
        toggleShow={() => setShowConfirm((s) => !s)}
        placeholder="Confirm New Password"
        autoComplete="new-password"
      />

      {/* SUBMIT */}
      <div className="md:col-span-3 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full border border-[#D6E3EE] px-4 py-2 text-sm text-[#0F1F33] disabled:opacity-60"
        >
          {pending ? "Updating…" : "Update Password"}
        </button>
      </div>
    </form>
  );
}

/* 🔒 Reusable password input field with eye toggle */
function PasswordField({
  label,
  name,
  value,
  setValue,
  show,
  toggleShow,
  placeholder,
  autoComplete,
}: {
  label: string;
  name: string;
  value: string;
  setValue: (val: string) => void;
  show: boolean;
  toggleShow: () => void;
  placeholder: string;
  autoComplete: string;
}) {
  return (
    <div>
      <label className="mb-2 text-[13px] font-semibold text-[#22384F] block">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          name={name}
          className="input pr-10"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
        />
        <button
          type="button"
          onClick={toggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#0F1F33] transition"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}
