type MathPart =
  | { type: "text"; value: string }
  | { denominator: string; numerator: string; type: "fraction" };

export function ReadableMathText({ text }: { text: string }) {
  const parts = toReadableMathParts(text);

  return (
    <span className="whitespace-pre-wrap">
      {parts.map((part, index) =>
        part.type === "fraction" ? (
          <span
            className="mx-1 inline-grid translate-y-1 grid-rows-[auto_auto] items-center text-center align-middle"
            key={`${part.numerator}-${part.denominator}-${index}`}
          >
            <span className="border-b-2 border-current px-1 leading-5">{part.numerator}</span>
            <span className="px-1 leading-5">{part.denominator}</span>
          </span>
        ) : (
          <span key={`${part.value}-${index}`}>{part.value}</span>
        ),
      )}
    </span>
  );
}

function toReadableMathParts(rawText: string): MathPart[] {
  let text = rawText
    .replace(/\\\[/g, "")
    .replace(/\\\]/g, "")
    .replace(/\$\$/g, "")
    .replace(/\\left|\\right/g, "")
    .replace(/\\times/g, "×")
    .replace(/\\cdot/g, "·")
    .replace(/\\div/g, "÷")
    .replace(/\\%/g, "%")
    .replace(/\\,/g, " ")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\\text\{([^{}]*)\}/g, "$1")
    .replace(/\s+([,.!?])/g, "$1");

  const parts: MathPart[] = [];
  const fractionPattern = /\\frac\{([^{}]+)\}\{([^{}]+)\}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = fractionPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: cleanMathText(text.slice(lastIndex, match.index)) });
    }

    parts.push({
      denominator: cleanMathText(match[2]),
      numerator: cleanMathText(match[1]),
      type: "fraction",
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", value: cleanMathText(text.slice(lastIndex)) });
  }

  return parts.length ? parts : [{ type: "text", value: cleanMathText(text) }];
}

function cleanMathText(text: string) {
  return text
    .replace(/[{}]/g, "")
    .replace(/\\[a-zA-Z]+/g, "")
    .replace(/\((\s*)/g, "(")
    .replace(/(\s*)\)/g, ")")
    .replace(/[ \t]{2,}/g, " ");
}
