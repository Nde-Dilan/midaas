interface Props {
  title: string;
  value: number | string;
  icon: React.ReactElement<unknown>;
  variant?: "default" | "maroon";
  subtitle?: string;
}

export default function StatisticCard({
  title,
  value,
  icon,
  variant = "default",
  subtitle,
}: Props) {
  const isMaroon = variant === "maroon";

  return (
    <article
      className={`min-w-[220px] rounded-3xl px-6 py-6 flex flex-col items-start justify-start gap-3 transition-shadow ${
        isMaroon ? "bg-[#50E3C2] text-white shadow-sm" : "bg-white"
      }`}
    >
      <div className="flex items-center justify-center [&_svg]:w-12 [&_svg]:h-12 [&_svg]:text-[#D4A574]">
        {icon}
      </div>

      <div className="flex flex-col justify-center gap-1 w-full">
        <span
          className={`text-4xl font-bold font-amikoBold ${
            isMaroon ? "text-white" : "text-black"
          }`}
        >
          {value}
        </span>
        <span
          className={`text-base font-bold ${isMaroon ? "text-white" : "text-gray-600"}`}
        >
          {title}
        </span>
        {subtitle && (
          <span className="text-sm font-bold text-[#D4A574] mt-1">
            {subtitle}
          </span>
        )}
      </div>
    </article>
  );
}
