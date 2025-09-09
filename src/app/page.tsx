import { redirect, RedirectType } from "next/navigation";

export default function Home() {
  redirect("dashboard", RedirectType.replace);

  return (
    <>
      <div
        className="bg-white dark:bg-neutral-900 p-5 rounded-xl shadow-[var(--shadow)] 
            border border-[rgba(11,16,32,0.04)] mb-6 
            transition-transform transition-shadow duration-200 
            hover:-translate-y-[2px] hover:shadow-[0_12px_28px_rgba(11,16,32,0.08)]"
      >
        asdsa
      </div>
    </>
  );
}
