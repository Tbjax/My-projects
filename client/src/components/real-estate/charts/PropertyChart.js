import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Box, CircularProgress } from '@mui/material';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import api from '../../../services/api';

// Register the required chart components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

/**
 * A pie chart showing property types distribution
 * 
 * @returns {JSX.Element} - The property chart component
 */
const PropertyChart = () => {
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
        // const response = await api.get('/api/real-estate/dashboard/property-types');
        
        // Mock data for development
        const mockData = {
          labels: ['Single Family', 'Condo', 'Townhouse', 'Multi-Family', 'Land', 'Commercial'],
          datasets: [
            {
              label: 'Property Types',
              data: [45, 25, 15, 8, 5, 2],
              backgroundColor: [
                'rgba(255, 99, 132, 0.7)',
                'rgba(54, 162, 235, 0.7)',
                'rgba(255, 206, 86, 0.7)',
                'rgba(75, 192, 192, 0.7)',
                'rgba(153, 102, 255, 0.7)',
                'rgba(255, 159, 64, 0.7)'
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
              ],
              borderWidth: 1
            }
          ]
        };
        
        setChartData(mockData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching property types data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 15,
          padding: 15
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
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
      <Pie data={chartData} options={options} />
    </Box>
  );
};

export default PropertyChart;
