import Image from "next/image";
import Link from "next/link";

export function AuthBrand() {
  return (
    <div className="mb-5 text-center">
      <Link href="/" className="inline-flex flex-col items-center justify-center gap-2.5">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 shadow-[0_16px_36px_rgba(15,23,42,0.16)]">
          <Image src="/icons/icon.png" alt="FlowTask" width={26} height={26} className="h-[26px] w-[26px] object-contain" priority />
        </span>
        <span className="text-[13px] font-semibold uppercase tracking-[0.28em] text-emerald-700">
          FlowTask
        </span>
      </Link>
    </div>
  );
}
