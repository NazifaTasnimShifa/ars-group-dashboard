// src/components/ui/Chart.js

import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register all the components you need for your charts, but only once.
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Chart = ({ options, data, type }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const chart = new ChartJS(canvas, {
      type,
      data,
      options,
    });

    // When the component unmounts, destroy the chart to prevent canvas errors
    return () => {
      chart.destroy();
    };
  }, [data, options, type]);

  return <canvas ref={canvasRef}></canvas>;
};

export default Chart;