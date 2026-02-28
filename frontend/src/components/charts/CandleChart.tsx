'use client';
import { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, CandlestickSeries } from 'lightweight-charts';
import { usePythPrice } from '@/hooks/usePythPrice';

interface CandleChartProps {
  symbol: string;
  height?: number;
}

function generateMockCandles(basePrice: number, count = 100) {
  const candles = [];
  let price = basePrice || 100;
  const now = Math.floor(Date.now() / 1000);
  for (let i = count; i >= 0; i--) {
    const open = price;
    const change = (Math.random() - 0.5) * price * 0.02;
    const close = Math.max(1, price + change);
    const high = Math.max(open, close) * (1 + Math.random() * 0.005);
    const low = Math.min(open, close) * (1 - Math.random() * 0.005);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    candles.push({ time: (now - i * 300) as any, open, high, low, close });
    price = close;
  }
  return candles;
}

export function CandleChart({ symbol, height = 400 }: CandleChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const { price } = usePythPrice(symbol);

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
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.1)' },
      timeScale: { borderColor: 'rgba(255,255,255,0.1)', timeVisible: true },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    series.setData(generateMockCandles(price || 100));
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
  }, [symbol, height, price]);

  return <div ref={containerRef} className="w-full" />;
}
