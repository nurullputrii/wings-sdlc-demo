export interface TrendPoint {
  date: string;
  value: number;
}

interface SalesTrendChartProps {
  title: string;
  unit: string;
  series: TrendPoint[];
  average: number;
  yMax: number;
  yTicks: number[];
  formatValue: (value: number) => string;
}

export function SalesTrendChart({
  title,
  unit,
  series,
  average,
  yMax,
  yTicks,
  formatValue,
}: SalesTrendChartProps) {
  const width = 640;
  const height = 280;
  const pad = { top: 28, right: 56, bottom: 36, left: 52 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const x = (index: number) =>
    pad.left + (series.length === 1 ? innerW / 2 : (index / (series.length - 1)) * innerW);
  const y = (value: number) => pad.top + innerH - (value / yMax) * innerH;

  const line = series
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${x(index)} ${y(point.value)}`)
    .join(' ');

  return (
    <section className="sales-chart" aria-label={title}>
      <div className="sales-chart-head">
        <h2>{title}</h2>
        <span className="sales-unit-tag">Unit: {unit}</span>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${title} line chart`}
      >
        {yTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={pad.left}
              x2={width - pad.right}
              y1={y(tick)}
              y2={y(tick)}
              className="sales-grid"
            />
            <text x={pad.left - 8} y={y(tick) + 4} className="sales-axis" textAnchor="end">
              {formatValue(tick)}
            </text>
          </g>
        ))}
        <line
          x1={pad.left}
          x2={width - pad.right}
          y1={y(average)}
          y2={y(average)}
          className="sales-avg-line"
        />
        <path d={line} className="sales-trend-line" />
        {series.map((point, index) => (
          <g key={point.date}>
            <circle cx={x(index)} cy={y(point.value)} r={5} className="sales-dot" />
            <text
              x={x(index)}
              y={y(point.value) - 10}
              className="sales-point-label"
              textAnchor="middle"
            >
              {formatValue(point.value)}
            </text>
            <text
              x={x(index)}
              y={height - 10}
              className="sales-axis"
              textAnchor="middle"
            >
              {point.date}
            </text>
          </g>
        ))}
        <g>
          <circle
            cx={width - pad.right}
            cy={y(average)}
            r={5}
            className="sales-avg-dot"
          />
          <text
            x={width - pad.right + 8}
            y={y(average) + 4}
            className="sales-avg-label"
          >
            {formatValue(average)}
          </text>
        </g>
      </svg>
    </section>
  );
}
