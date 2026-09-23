'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchDashboardSummary } from '@/lib/api';
import { getTokenCookie } from '@/lib/session';
import { SalesTrendChart, type TrendPoint } from './sales-trend-chart';

type Unit = 'BOX' | 'TON';

interface UnitView {
  title: string;
  subtitle: string;
  chartTitle: string;
  peakLabel: string;
  peakValue: string;
  peakMeta: string;
  averageLabel: string;
  averageValue: string;
  averageMeta: string;
  change: string;
  changeMeta: string;
  legendDaily: string;
  series: TrendPoint[];
  average: number;
  yMax: number;
  yTicks: number[];
  formatValue: (value: number) => string;
}

const DATE_RANGE = '20 Feb – 27 Feb 2026';
const BRAND = 'MIE SEDAAP';

const TON_SERIES: TrendPoint[] = [
  { date: '20 Feb', value: 102 },
  { date: '21 Feb', value: 91.5 },
  { date: '22 Feb', value: 88.1 },
  { date: '23 Feb', value: 84.3 },
  { date: '24 Feb', value: 64.8 },
  { date: '26 Feb', value: 91.1 },
  { date: '27 Feb', value: 113.3 },
];

const BOX_SERIES: TrendPoint[] = [
  { date: '20 Feb', value: 206641 },
  { date: '21 Feb', value: 185370 },
  { date: '22 Feb', value: 178482 },
  { date: '23 Feb', value: 170783 },
  { date: '24 Feb', value: 131278 },
  { date: '26 Feb', value: 184559 },
  { date: '27 Feb', value: 229535 },
];

function formatTon(value: number): string {
  return value.toLocaleString('id-ID', {
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 1,
  });
}

function formatBox(value: number): string {
  return Math.round(value).toLocaleString('id-ID');
}

function averageOf(series: TrendPoint[]): number {
  return series.reduce((sum, point) => sum + point.value, 0) / series.length;
}

function dayOverDayChange(series: TrendPoint[]): string {
  const previous = series.at(-2)?.value;
  const latest = series.at(-1)?.value;
  if (previous === undefined || latest === undefined || previous === 0) {
    return '0.0%';
  }
  const percent = ((latest - previous) / previous) * 100;
  return `${percent >= 0 ? '+' : ''}${percent.toFixed(1)}%`;
}

const TON_AVERAGE = averageOf(TON_SERIES);
const BOX_AVERAGE = averageOf(BOX_SERIES);

const VIEWS: Record<Unit, UnitView> = {
  TON: {
    title: 'Daily Sales Tonnage',
    subtitle: `Sales tonnage (TON) · ${DATE_RANGE}`,
    chartTitle: `Daily tonnage trend — ${BRAND}`,
    peakLabel: 'Peak day',
    peakValue: '113,3 TON',
    peakMeta: '27 Feb',
    averageLabel: 'Period average',
    averageValue: `${formatTon(TON_AVERAGE)} TON`,
    averageMeta: '7-day period',
    change: dayOverDayChange(TON_SERIES),
    changeMeta: 'vs 26 Feb',
    legendDaily: 'Daily tonnage',
    series: TON_SERIES,
    average: TON_AVERAGE,
    yMax: 120,
    yTicks: [0, 20, 40, 60, 80, 100, 120],
    formatValue: formatTon,
  },
  BOX: {
    title: 'Daily Order Volume',
    subtitle: `Sales unit (BOX) · ${DATE_RANGE}`,
    chartTitle: `Daily trend — ${BRAND}`,
    peakLabel: 'Today',
    peakValue: '229.535 BOX',
    peakMeta: '27 Feb',
    averageLabel: 'Period average',
    averageValue: `${formatBox(BOX_AVERAGE)} BOX`,
    averageMeta: 'MTD · 20–27 Feb 2026',
    change: dayOverDayChange(BOX_SERIES),
    changeMeta: 'vs 26 Feb',
    legendDaily: 'Daily volume',
    series: BOX_SERIES,
    average: BOX_AVERAGE,
    yMax: 240000,
    yTicks: [0, 80000, 140000, 200000],
    formatValue: formatBox,
  },
};

/**
 * US-2: Dashboard. Layout follows the WINGS Mobile Sales Dashboard Figma
 * (Brand Manager BOX / TON frames).
 */
export default function DashboardPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [unit, setUnit] = useState<Unit>('TON');
  const view = useMemo(() => VIEWS[unit], [unit]);

  useEffect(() => {
    const token = getTokenCookie();
    if (!token) {
      router.replace('/login');
      return;
    }

    fetchDashboardSummary(token)
      .then((summary) => setGeneratedAt(summary.generatedAt))
      .catch(() =>
        setError('Could not load dashboard data. Your session may have expired.'),
      );
  }, [router]);

  return (
    <main className="sales-shell">
      <header className="sales-topbar">
        <div className="sales-brand-cluster">
          <span className="sales-logo">WINGS</span>
          <span className="sales-role">
            <span className="sales-role-dot" aria-hidden="true" />
            <span>Brand Manager</span>
          </span>
          <span className="sales-scope">Assigned brand only</span>
        </div>
        <nav className="sales-nav" aria-label="Dashboard">
          <a className="sales-nav-link is-active" href="#insights">
            Sales Insights
          </a>
          <span className="sales-nav-link">Reports</span>
          <span className="sales-nav-link">Settings</span>
          <button
            type="button"
            className="sales-user"
            onClick={() => router.push('/logout')}
          >
            <span className="sales-avatar" aria-hidden="true" />
            <span>Log out</span>
          </button>
        </nav>
      </header>

      <section className="sales-body" id="insights">
        <div className="sales-heading-row">
          <div>
            <h1 className="sales-title">{view.title}</h1>
            <p className="sales-subtitle">{view.subtitle}</p>
          </div>
          <div className="sales-filters">
            <label className="sales-filter">
              <span>Brand</span>
              <select defaultValue={BRAND} aria-label="Brand">
                <option>{BRAND}</option>
              </select>
            </label>
            <span className="sales-filter sales-filter-static">{DATE_RANGE}</span>
            <fieldset className="sales-unit-toggle" aria-label="Sales unit">
              <button
                type="button"
                className={unit === 'BOX' ? 'is-active' : undefined}
                onClick={() => setUnit('BOX')}
              >
                BOX
              </button>
              <button
                type="button"
                className={unit === 'TON' ? 'is-active' : undefined}
                onClick={() => setUnit('TON')}
              >
                TON
              </button>
            </fieldset>
          </div>
        </div>

        {error ? (
          <div className="sales-card">
            <p role="alert" className="error">
              {error}
            </p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => router.push('/logout')}
            >
              Back to login
            </button>
          </div>
        ) : (
          <div className="sales-layout">
            <aside className="sales-kpis">
              <article className="sales-card">
                <p className="sales-kpi-label">{view.peakLabel}</p>
                <p className="sales-kpi-value">{view.peakValue}</p>
                <p className="sales-kpi-meta">{view.peakMeta}</p>
              </article>
              <article className="sales-card">
                <p className="sales-kpi-label">{view.averageLabel}</p>
                <p className="sales-kpi-value">{view.averageValue}</p>
                <p className="sales-kpi-meta">{view.averageMeta}</p>
              </article>
              <article className="sales-card">
                <p className="sales-kpi-label">Day-over-day</p>
                <p className="sales-kpi-value sales-positive">{view.change}</p>
                <p className="sales-kpi-meta">{view.changeMeta}</p>
              </article>
              <article className="sales-card sales-legend">
                <p className="sales-kpi-label">Legend</p>
                <p>
                  <span className="legend-swatch is-daily" /> {view.legendDaily}
                </p>
                <p>
                  <span className="legend-swatch is-avg" /> Period average
                </p>
              </article>
            </aside>

            <SalesTrendChart
              title={view.chartTitle}
              unit={unit}
              series={view.series}
              average={view.average}
              yMax={view.yMax}
              yTicks={view.yTicks}
              formatValue={view.formatValue}
            />
          </div>
        )}

        {error ? null : (
          <p className="sales-footnote">
            {generatedAt
              ? `Served by the Wings API · generated at ${new Date(generatedAt).toLocaleString()}`
              : 'Loading dashboard data…'}
          </p>
        )}
      </section>
    </main>
  );
}
