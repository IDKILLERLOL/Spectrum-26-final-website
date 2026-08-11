import { NAVY, PINK } from "./tokens"
import { questBody } from "./fonts"

export function StepProgress({ step, total = 4 }: { step: number; total?: number }) {
  return (
    <div className="flex flex-col gap-2 px-5">
      <p className={`${questBody.className} text-[10px] uppercase tracking-wide opacity-60`} style={{ color: NAVY }}>
        Step {step} of {total}
      </p>
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className="h-1.5 flex-1"
            style={{ background: i < step ? PINK : `${NAVY}22` }}
          />
        ))}
      </div>
    </div>
  )
}
