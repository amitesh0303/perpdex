'use client';
import { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, HistogramSeries } from 'lightweight-charts';

interface FundingChartProps {
  symbol: string;
  height?: number;
}

function generateMockFundingData(count = 48) {
  const data = [];
  const now = Math.floor(Date.now() / 1000);
  for (let i = count; i >= 0; i--) {
    data.push({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      time: (now - i * 3600) as any,
      value: (Math.random() - 0.5) * 0.002,
    });
  }
  return data;
}

export function FundingChart({ symbol, height = 150 }: FundingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.05)' },
        horzLines: { color: 'rgba(255,255,255,0.05)' },
      },
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.1)' },
      timeScale: { borderColor: 'rgba(255,255,255,0.1)', timeVisible: true },
    });

    const series = chart.addSeries(HistogramSeries, {
      color: '#3b82f6',
      priceFormat: { type: 'percent' },
    });

    series.setData(generateMockFundingData());
    chartRef.current = chart;

    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [symbol, height]);

  void chartRef;
  return <div ref={containerRef} className="w-full" />;
}
