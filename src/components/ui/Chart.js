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

// This registers all necessary Chart.js components ONCE.
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
  const chartRef = useRef(null); // Use a ref to hold the chart instance

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // If a chart instance already exists, destroy it before creating a new one
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // Create the new chart instance and store it in the ref
    chartRef.current = new ChartJS(canvas, {
      type,
      data,
      options,
    });

    // The cleanup function will run when the component unmounts
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [data, options, type]);

  return <canvas ref={canvasRef}></canvas>;
};

export default Chart;