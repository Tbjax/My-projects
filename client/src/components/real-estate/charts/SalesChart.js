import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Box, CircularProgress } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import api from '../../../services/api';

// Register the required chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * A bar chart showing sales performance over time
 * 
 * @returns {JSX.Element} - The sales chart component
 */
const SalesChart = () => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // In a real app, this would be an API call
        // const response = await api.get('/api/real-estate/dashboard/sales-performance');
        
        // Mock data for development
        const mockData = {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            {
              label: 'Sales Volume ($M)',
              data: [4.2, 3.8, 5.1, 6.3, 5.9, 7.2],
              backgroundColor: 'rgba(54, 162, 235, 0.7)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            },
            {
              label: 'Number of Transactions',
              data: [12, 10, 14, 18, 16, 20],
              backgroundColor: 'rgba(255, 99, 132, 0.7)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1
            }
          ]
        };
        
        setChartData(mockData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching sales performance data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value;
          }
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 15,
          padding: 15
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (context.dataset.label === 'Sales Volume ($M)') {
                label += '$' + context.parsed.y + 'M';
              } else {
                label += context.parsed.y;
              }
            }
            return label;
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box height="100%" width="100%">
      <Bar data={chartData} options={options} />
    </Box>
  );
};

export default SalesChart;
