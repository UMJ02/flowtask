import Image from "next/image";
import Link from "next/link";

export function AuthBrand() {
  return (
    <div className="mb-6 text-center">
      <Link href="/" className="inline-flex flex-col items-center justify-center gap-3">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-950 shadow-[0_16px_36px_rgba(15,23,42,0.16)]">
          <Image src="/icons/icon.png" alt="FlowTask" width={30} height={30} className="h-[30px] w-[30px] object-contain" priority />
        </span>
        <span className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-700">
          FlowTask
        </span>
      </Link>
    </div>
  );
}
