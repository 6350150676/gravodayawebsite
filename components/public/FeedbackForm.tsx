"use client";

import { useActionState, useState } from "react";
import { Star, Heart } from "lucide-react";
import { createFeedbackAction, type FeedbackFormState } from "@/lib/actions/feedback.actions";

interface Props {
  /** Which form the customer just completed. */
  source: "contact" | "inquiry" | "submission";
}

const initial: FeedbackFormState = { ok: false };

/** Quick star-rating feedback form shown on thank-you screens. */
export function FeedbackForm({ source }: Props) {
  const [state, action, pending] = useActionState(createFeedbackAction, initial);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  if (state.ok) {
    return (
      <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
        <Heart size={15} className="text-[var(--color-gold)]" fill="currentColor" />
        Thank you for your feedback!
      </div>
    );
  }

  return (
    <form action={action} className="mt-6 w-full max-w-sm mx-auto bg-white/70 border border-gray-100 rounded-2xl p-5 text-left">
      <input type="hidden" name="source" value={source} />
      <input type="hidden" name="rating" value={rating} />

      <p className="text-sm font-semibold text-[var(--color-brand)] text-center mb-3">
        How was your experience with us?
      </p>

      <div className="flex items-center justify-center gap-1.5 mb-4" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className="p-1 transition-transform hover:scale-110"
          >
            <Star
              size={26}
              className={
                n <= (hover || rating)
                  ? "text-[var(--color-gold)]"
                  : "text-gray-300"
              }
              fill={n <= (hover || rating) ? "currentColor" : "none"}
            />
          </button>
        ))}
      </div>

      {rating > 0 && (
        <textarea
          name="comment"
          rows={2}
          maxLength={1000}
          placeholder="Anything we could do better? (optional)"
          className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 outline-none resize-none focus:border-[var(--color-royal)] focus:ring-2 focus:ring-[var(--color-royal)]/15 mb-3"
        />
      )}

      {state.error && <p className="text-xs text-red-500 text-center mb-2">{state.error}</p>}

      <button
        type="submit"
        disabled={pending || rating === 0}
        className="w-full bg-[var(--color-brand)] text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-[var(--color-royal)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? "Sending…" : "Share Feedback"}
      </button>
    </form>
  );
}
