import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './style.css';
import Request from '../../../request';
import { formatDate, formatCurrency } from '../../../../utils/formatters';
import { 
  ElectricityIcon, 
  GasIcon, 
  CalculationIcon, 
  PriceTagIcon,
  CalendarIcon,
  ChartIcon,
  DocumentIcon,
  ViewIcon,
  ExportIcon
} from '../../../icons/index';
import { useAuth } from '../../../../context/context';
import PieChart from '../../../dashboardComponents/charts/pieChart';
import BarChart from '../../../dashboardComponents/charts/barChart';

const Homepage = () => {
  const { user } = useAuth();
  const [calculations, setCalculations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardStats, setDashboardStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  
  useEffect(() => {
    fetchCalculations();
  }, []);
  
  useEffect(() => {
    if (calculations.length > 0) {
      calculateStats();
      prepareChartData();
    }
  }, [calculations]);
  
  // Fetch all calculations
  const fetchCalculations = async () => {
    try {
      setLoading(true);
      const response = await Request.calculations.getAll();
      setCalculations(response.data.calculations);
      setError('');
    } catch (err) {
      console.error('Error fetching calculations:', err);
      setError('Unable to load your calculations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate statistics for dashboard
  const calculateStats = () => {
    if (calculations.length === 0) return;
    
    // Calculate the date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Initialize stats object
    const stats = {
      totalCalculations: calculations.length,
      recentCalculations: 0,
      averageMonthlyCost: 0,
      totalMonthlyCost: 0,
      totalAnnualCost: 0,
      highestMonthlyCost: 0,
      lowestMonthlyCost: Infinity,
      totalElectricity: 0,
      totalGas: 0,
      lastCalculationDate: null,
      energyTypes: {
        electricityOnly: 0,
        gasOnly: 0,
        both: 0
      }
    };
    
    // Process calculations
    calculations.forEach(calc => {
      // Count recent calculations
      const calcDate = new Date(calc.createdAt);
      if (calcDate >= thirtyDaysAgo) {
        stats.recentCalculations++;
      }
      
      // Track last calculation date
      if (!stats.lastCalculationDate || calcDate > new Date(stats.lastCalculationDate)) {
        stats.lastCalculationDate = calc.createdAt;
      }
      
      // Track costs
      const monthlyCost = parseFloat(calc.monthlyCost);
      const annualCost = parseFloat(calc.annualCost);
      
      stats.totalMonthlyCost += monthlyCost;
      stats.totalAnnualCost += annualCost;
      
      if (monthlyCost > stats.highestMonthlyCost) {
        stats.highestMonthlyCost = monthlyCost;
      }
      
      if (monthlyCost < stats.lowestMonthlyCost) {
        stats.lowestMonthlyCost = monthlyCost;
      }
      
      // Track energy types
      if (calc.hasElectricity && calc.hasGas) {
        stats.energyTypes.both++;
        stats.totalElectricity += monthlyCost * 0.7; // Approximate split
        stats.totalGas += monthlyCost * 0.3; // Approximate split
      } else if (calc.hasElectricity) {
        stats.energyTypes.electricityOnly++;
        stats.totalElectricity += monthlyCost;
      } else if (calc.hasGas) {
        stats.energyTypes.gasOnly++;
        stats.totalGas += monthlyCost;
      }
    });
    
    // Calculate average
    stats.averageMonthlyCost = stats.totalMonthlyCost / calculations.length;
    
    // Fix edge case
    if (stats.lowestMonthlyCost === Infinity) {
      stats.lowestMonthlyCost = 0;
    }
    
    setDashboardStats(stats);
  };
  
  const prepareChartData = () => {
    if (calculations.length === 0) return;
    
    const recentCalcs = [...calculations]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .reverse(); 
    
    const data = {
      costDistribution: [
        {
          name: 'Electricity',
          value: dashboardStats?.totalElectricity || 0,
          color: '#004bad'
        },
        {
          name: 'Gas',
          value: dashboardStats?.totalGas || 0,
          color: '#ff3130'
        }
      ],
      energyTypes: [
        {
          name: 'Electricity Only',
          value: dashboardStats?.energyTypes.electricityOnly || 0,
          color: '#0063e5'
        },
        {
          name: 'Gas Only',
          value: dashboardStats?.energyTypes.gasOnly || 0,
          color: '#ff5a59'
        },
        {
          name: 'Electricity & Gas',
          value: dashboardStats?.energyTypes.both || 0,
          color: '#8b8b8b'
        }
      ],
      recentCosts: {
        labels: recentCalcs.map(calc => formatDate(calc.createdAt, 'short')),
        values: recentCalcs.map(calc => parseFloat(calc.monthlyCost))
      }
    };
    
    setChartData(data);
  };
  
  // Export calculation as PDF
  const exportCalculationPDF = async (id) => {
    try {
      const response = await Request.calculations.exportPDF(id);
      
      // Create a download link for the PDF
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `calculation-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error exporting PDF:', err);
      setError('Failed to export the calculation as PDF. Please try again.');
    }
  };
  
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  
  // Get the first name from the full name
  const getFirstName = () => {
    if (!user || !user.full_name) return '';
    return user.full_name.split(' ')[0];
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="homepage">
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="homepage">
      {/* Welcome section */}
      <div className="welcome-section">
        <div className="welcome-message">
          <h1>{getGreeting()}, {getFirstName()}</h1>
          <p className="welcome-subtitle">Here's an overview of your utility calculations</p>
        </div>
        <div className="welcome-actions">
          <Link to="/upload" className="new-calculation-button">
            <span>New Calculation</span>
          </Link>
        </div>
      </div>
      
      {/* Error message if any */}
      {error && <div className="error-message">{error}</div>}
      
      {calculations.length === 0 ? (
        // Empty state when no calculations exist
        <div className="empty-state">
          <CalculationIcon className="empty-icon" />
          <h2>No Calculations Yet</h2>
          <p>Start by uploading a utility bill document and entering consumption data to create your first calculation.</p>
          <Link to="/upload" className="cta-button">Create Your First Calculation</Link>
        </div>
      ) : (
        <>
          {/* Stats cards */}
          <div className="stats-cards">
            <div className="stat-card primary">
              <div className="stat-header">
                <h3>Total Monthly Cost</h3>
                <PriceTagIcon className="stat-icon" />
              </div>
              <div className="stat-value">{formatCurrency(dashboardStats?.totalMonthlyCost || 0)}</div>
              <div className="stat-footer">
                <span>Avg. {formatCurrency(dashboardStats?.averageMonthlyCost || 0)} per calculation</span>
              </div>
            </div>
            
            <div className="stat-card secondary">
              <div className="stat-header">
                <h3>Total Annual Cost</h3>
                <PriceTagIcon className="stat-icon" />
              </div>
              <div className="stat-value">{formatCurrency(dashboardStats?.totalAnnualCost || 0)}</div>
              <div className="stat-footer">
                <span>Based on {dashboardStats?.totalCalculations || 0} calculations</span>
              </div>
            </div>
            
            <div className="stat-card tertiary">
              <div className="stat-header">
                <h3>Energy Distribution</h3>
                <ElectricityIcon className="stat-icon" />
              </div>
              <div className="energy-distribution">
                <div className="energy-type">
                  <ElectricityIcon className="energy-icon electricity" />
                  <div className="energy-details">
                    <span className="energy-label">Electricity</span>
                    <span className="energy-value">{formatCurrency(dashboardStats?.totalElectricity || 0)}</span>
                  </div>
                </div>
                <div className="energy-type">
                  <GasIcon className="energy-icon gas" />
                  <div className="energy-details">
                    <span className="energy-label">Gas</span>
                    <span className="energy-value">{formatCurrency(dashboardStats?.totalGas || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="stat-card quaternary">
              <div className="stat-header">
                <h3>Recent Activity</h3>
                <CalendarIcon className="stat-icon" />
              </div>
              <div className="stat-value">{dashboardStats?.recentCalculations || 0}</div>
              <div className="stat-footer">
                <span>Calculations in the last 30 days</span>
              </div>
            </div>
          </div>
          
          {/* Charts section */}
          {chartData && (
            <div className="dashboard-charts">
              <div className="chart-row">
                <div className="chart-card">
                  <div className="chart-header">
                    <h3>Monthly Costs by Date</h3>
                    <ChartIcon className="chart-icon" />
                  </div>
                  <div className="chart-container">
                    <BarChart 
                      labels={chartData.recentCosts.labels}
                      values={chartData.recentCosts.values}
                    />
                  </div>
                </div>
                
                <div className="chart-card">
                  <div className="chart-header">
                    <h3>Cost Distribution</h3>
                    <ChartIcon className="chart-icon" />
                  </div>
                  <div className="chart-container">
                    <PieChart data={chartData.costDistribution} />
                  </div>
                </div>
              </div>
              
              <div className="chart-row">
                <div className="chart-card">
                  <div className="chart-header">
                    <h3>Calculation Types</h3>
                    <ChartIcon className="chart-icon" />
                  </div>
                  <div className="chart-container">
                    <PieChart data={chartData.energyTypes} />
                  </div>
                </div>
                <div className="profile-card">
                  <div className="profile-header">
                    <div className="profile-avatar-homepage">
                      {getFirstName().charAt(0)}
                    </div>
                    <div className="profile-info">
                      <h3>{user?.full_name || 'User'}</h3>
                      <p>{user?.email || 'user@example.com'}</p>
                    </div>
                  </div>
                  <div className="profile-stats">
                    <div className="profile-stat">
                      <CalculationIcon className="profile-stat-icon" />
                      <div className="profile-stat-details">
                        <span className="profile-stat-label">Total Calculations</span>
                        <span className="profile-stat-value">{dashboardStats?.totalCalculations || 0}</span>
                      </div>
                    </div>
                    <div className="profile-stat">
                      <CalendarIcon className="profile-stat-icon" />
                      <div className="profile-stat-details">
                        <span className="profile-stat-label">Last Calculation</span>
                        <span className="profile-stat-value">
                          {dashboardStats?.lastCalculationDate 
                            ? formatDate(dashboardStats.lastCalculationDate) 
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="profile-actions">
                    <Link to="/profile" className="profile-button">View Profile</Link>
                    <Link to="/settings" className="profile-button secondary">Settings</Link>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Recent calculations */}
          <div className="recent-calculations">
            <div className="section-header">
              <h2>Recent Calculations</h2>
              <Link to="/calculations" className="view-all-link">View All</Link>
            </div>
            
            <div className="recent-table">
              <div className="table-header">
                <div className="table-cell date">Date</div>
                <div className="table-cell document">Document</div>
                <div className="table-cell type">Type</div>
                <div className="table-cell cost">Monthly Cost</div>
                <div className="table-cell actions">Actions</div>
              </div>
              <div className="table-body">
                {calculations.slice(0, 5).map(calc => (
                  <div className="table-row" key={calc.id}>
                    <div className="table-cell date">{formatDate(calc.createdAt)}</div>
                    <div className="table-cell document" title={calc.documentName}>
                      <DocumentIcon className="cell-icon" />
                      <span className="document-name">{calc.documentName}</span>
                    </div>
                    <div className="table-cell type">
                      <div className="energy-type-icons">
                        {calc.hasElectricity && <ElectricityIcon className="type-icon electricity" title="Electricity" />}
                        {calc.hasGas && <GasIcon className="type-icon gas" title="Gas" />}
                      </div>
                    </div>
                    <div className="table-cell cost">{formatCurrency(calc.monthlyCost)}</div>
                    <div className="table-cell actions">
                      <Link
                        to={`/calculations/${calc.id}`}
                        className="action-btn view-btn"
                        title="View Details"
                      >
                        <ViewIcon className="action-icon" />
                      </Link>
                      <button
                        className="action-btn export-btn"
                        onClick={() => exportCalculationPDF(calc.id)}
                        title="Export as PDF"
                      >
                        <ExportIcon className="action-icon" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mobile-calculations">
              {calculations.slice(0, 5).map(calc => (
                <div className="mobile-calculation-card" key={calc.id}>
                  <div className="card-header">
                    <div className="card-title" title={calc.documentName}>
                      <DocumentIcon className="card-icon" />
                      <span>{calc.documentName}</span>
                    </div>
                    <div className="card-date">{formatDate(calc.createdAt)}</div>
                  </div>
                  <div className="card-body">
                    <div className="card-energy-types">
                      {calc.hasElectricity && <div className="energy-badge electricity">Electricity</div>}
                      {calc.hasGas && <div className="energy-badge gas">Gas</div>}
                    </div>
                    <div className="card-cost">{formatCurrency(calc.monthlyCost)}</div>
                  </div>
                  <div className="card-actions">
                    <Link to={`/calculations/${calc.id}`} className="card-button primary">View Details</Link>
                    <button 
                      className="card-button secondary"
                      onClick={() => exportCalculationPDF(calc.id)}
                    >
                      Export PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Homepage;