import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Request from '../../../request';
import { formatDate, formatCurrency } from '../../../../utils/formatters';
import './style.css';
import { 
  BackIcon, 
  ExportIcon, 
  ElectricityIcon, 
  GasIcon,
  DocumentIcon,
  CalendarIcon,
  PriceTagIcon,
  HomeIcon,
  PrintIcon,
  DeleteIcon,
  ChartIcon
} from '../../../icons/index';
import ConfirmModal from '../../../dashboardComponents/calculationConfirmModal/confirmModal';
import PieChart from '../../../dashboardComponents/charts/pieChart';
import BarChart from '../../../dashboardComponents/charts/barChart';


const CalculationView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState();
  
  useEffect(() => {
    fetchCalculation();
  }, [id]);
  
  const fetchCalculation = async () => {
    try {
      setLoading(true);
      const response = await Request.calculations.getOne(id);
      setCalculation(response.data.calculation);
      setError('');
    } catch (err) {
      console.error('Error fetching calculation:', err);
      setError('Failed to load calculation details. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const deleteCalculation = async () => {
    try {
      await Request.calculations.delete(id);
      navigate('/calculations', { 
        state: { message: 'Calculation deleted successfully' } 
      });
    } catch (err) {
      console.error('Error deleting calculation:', err);
      setError('Failed to delete the calculation. Please try again.');
    }
  };
  
  const exportCalculationPDF = async () => {
    try {
      const response = await Request.calculations.exportPDF(id);
      
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `calculation-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error exporting PDF:', err);
      setError('Failed to export the calculation as PDF. Please try again.');
    }
  };
  
  const printCalculation = () => {
    window.print();
  };
  
  const getElectricityChartData = () => {
    if (!calculation || !calculation.consumption) return [];
    
    const { consumption } = calculation;
    
    return [
      {
        name: 'F0 (All Hours)',
        value: parseFloat(consumption.electricityF0) || 0,
        color: '#004bad'
      },
      {
        name: 'F1 (Peak Hours)',
        value: parseFloat(consumption.electricityF1) || 0,
        color: '#0063e5'
      },
      {
        name: 'F2 (Mid-Peak Hours)',
        value: parseFloat(consumption.electricityF2) || 0,
        color: '#3d8bff'
      },
      {
        name: 'F3 (Off-Peak Hours)',
        value: parseFloat(consumption.electricityF3) || 0,
        color: '#a1c6ff'
      }
    ];
  };
  
  const getCostsChartData = () => {
    if (!calculation || !calculation.results || !calculation.results.monthlyCosts) return [];
    
    const { monthlyCosts } = calculation.results;
    const electricityF0 = parseFloat(monthlyCosts.electricityByBand.F0) || 0;
    const electricityF1 = parseFloat(monthlyCosts.electricityByBand.F1) || 0;
    const electricityF2 = parseFloat(monthlyCosts.electricityByBand.F2) || 0;
    const electricityF3 = parseFloat(monthlyCosts.electricityByBand.F3) || 0;
    const fixedCosts = parseFloat(monthlyCosts.fixedCosts) || 0;
    const gasTotal = parseFloat(monthlyCosts.gas) || 0;
    
    return [
      {
        name: 'Electricity F0',
        value: electricityF0,
        color: '#004bad'
      },
      {
        name: 'Electricity F1',
        value: electricityF1,
        color: '#0063e5'
      },
      {
        name: 'Electricity F2',
        value: electricityF2,
        color: '#3d8bff'
      },
      {
        name: 'Electricity F3',
        value: electricityF3,
        color: '#a1c6ff'
      },
      {
        name: 'Fixed Costs',
        value: fixedCosts,
        color: '#8b8b8b'
      },
      ...(gasTotal > 0 ? [{
        name: 'Gas',
        value: gasTotal,
        color: '#ff3130'
      }] : [])
    ];
  };
  
  if (loading) {
    return (
      <div className="calculation-view-page">
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading calculation details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="calculation-view-page">
        <div className="error-container">
          <div className="error-message">{error}</div>
          <Link to="/calculations" className="back-link">
            <BackIcon className="back-icon" />
            <span>Back to Calculations</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!calculation) {
    return (
      <div className="calculation-view-page">
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading calculation details...</p>
        </div>
      </div>
    );
  }

  const hasElectricity = calculation.consumption && (
    parseFloat(calculation.consumption.electricityF0) > 0 ||
    parseFloat(calculation.consumption.electricityF1) > 0 ||
    parseFloat(calculation.consumption.electricityF2) > 0 ||
    parseFloat(calculation.consumption.electricityF3) > 0
  );
  
  const hasGas = calculation.consumption && parseFloat(calculation.consumption.gas) > 0;
  
  return (
    <div className="calculation-view-page">
      {/* Breadcrumb and navigation */}
      <div className="page-navigation">
        <div className="breadcrumb">
          <Link to="/" className="breadcrumb-item">
            <HomeIcon className="breadcrumb-icon" />
            <span>Home</span>
          </Link>
          <span className="breadcrumb-separator">/</span>
          <Link to="/calculations" className="breadcrumb-item">
            Calculations
          </Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item active">
            Calculation Details
          </span>
        </div>
        <div className="navigation-actions hide-on-print">
          <button 
            className="action-button delete-button"
            onClick={() => {setShowDeleteModal(true);
                console.log("hello")
            }}
            title="Delete Calculation"
          >
            <DeleteIcon className="action-icon" />
            <span className="action-text">Delete</span>
          </button>
          <button 
            className="action-button export-button"
            onClick={exportCalculationPDF}
            title="Export as PDF"
          >
            <ExportIcon className="action-icon" />
            <span className="action-text">Export PDF</span>
          </button>
        </div>
      </div>

      {/* Header section */}
      <div className="calculation-header">
        <div className="header-left">
          <h1>Calculation Details</h1>
          <div className="calculation-meta">
            <div className="meta-item">
              <DocumentIcon className="meta-icon" />
              <span>{calculation.document.name}</span>
            </div>
            <div className="meta-item">
              <CalendarIcon className="meta-icon" />
              <span>{formatDate(calculation.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="header-right">
          <div className="energy-types">
            {hasElectricity && (
              <div className="energy-badge electricity">
                <ElectricityIcon className="badge-icon" />
                <span>Electricity</span>
              </div>
            )}
            {hasGas && (
              <div className="energy-badge gas">
                <GasIcon className="badge-icon" />
                <span>Gas</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="tabs-container hide-on-print">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'consumption' ? 'active' : ''}`}
          onClick={() => setActiveTab('consumption')}
        >
          Consumption Details
        </button>
        <button 
          className={`tab-button ${activeTab === 'charts' ? 'active' : ''}`}
          onClick={() => setActiveTab('charts')}
        >
          Charts
        </button>
      </div>

      {/* Main content section */}
      <div className="calculation-content">
        {/* Overview Tab */}
        {(activeTab === 'overview' || !activeTab) && (
          <div className="overview-tab">
            <div className="summary-cards">
              <div className="summary-card monthly">
                <h3>Monthly Cost</h3>
                <div className="card-amount">
                  <PriceTagIcon className="amount-icon" />
                  <span>{formatCurrency(calculation.results.monthlyCosts.total)}</span>
                </div>
              </div>
              <div className="summary-card annual">
                <h3>Annual Cost</h3>
                <div className="card-amount">
                  <PriceTagIcon className="amount-icon" />
                  <span>{formatCurrency(calculation.results.annualCosts.total)}</span>
                </div>
              </div>
            </div>
            
            {/* Costs breakdown section */}
            <div className="section">
              <h2 className="section-title">Monthly Cost Breakdown</h2>
              <div className="costs-grid">
                <div className="cost-card">
                  <h3>Electricity Costs</h3>
                  <div className="cost-details">
                    {hasElectricity ? (
                      <>
                        <div className="cost-row">
                          <span className="cost-label">F0 (All hours):</span>
                          <span className="cost-value">{formatCurrency(calculation.results.monthlyCosts.electricityByBand.F0)}</span>
                        </div>
                        <div className="cost-row">
                          <span className="cost-label">F1 (Peak hours):</span>
                          <span className="cost-value">{formatCurrency(calculation.results.monthlyCosts.electricityByBand.F1)}</span>
                        </div>
                        <div className="cost-row">
                          <span className="cost-label">F2 (Mid-peak hours):</span>
                          <span className="cost-value">{formatCurrency(calculation.results.monthlyCosts.electricityByBand.F2)}</span>
                        </div>
                        <div className="cost-row">
                          <span className="cost-label">F3 (Off-peak hours):</span>
                          <span className="cost-value">{formatCurrency(calculation.results.monthlyCosts.electricityByBand.F3)}</span>
                        </div>
                        <div className="cost-row">
                          <span className="cost-label">Fixed monthly fees:</span>
                          <span className="cost-value">{formatCurrency(calculation.results.monthlyCosts.fixedCosts)}</span>
                        </div>
                        <div className="cost-row total">
                          <span className="cost-label">Total Electricity:</span>
                          <span className="cost-value">{formatCurrency(calculation.results.monthlyCosts.totalElectricity)}</span>
                        </div>
                      </>
                    ) : (
                      <div className="no-data">No electricity consumption data</div>
                    )}
                  </div>
                </div>
                
                <div className="cost-card">
                  <h3>Gas Costs</h3>
                  <div className="cost-details">
                    {hasGas ? (
                      <div className="cost-row total">
                        <span className="cost-label">Total Gas:</span>
                        <span className="cost-value">{formatCurrency(calculation.results.monthlyCosts.gas)}</span>
                      </div>
                    ) : (
                      <div className="no-data">No gas consumption data</div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="total-card">
                <div className="total-row">
                  <span className="total-label">Total Monthly Cost:</span>
                  <span className="total-value">{formatCurrency(calculation.results.monthlyCosts.total)}</span>
                </div>
              </div>
            </div>
            
            {/* Annual costs */}
            <div className="section">
              <h2 className="section-title">Annual Cost Projection</h2>
              <div className="costs-grid">
                <div className="cost-card">
                  <h3>Annual Costs</h3>
                  <div className="cost-details">
                    {hasElectricity && (
                      <div className="cost-row">
                        <span className="cost-label">Annual Electricity Cost:</span>
                        <span className="cost-value">{formatCurrency(calculation.results.annualCosts.electricity)}</span>
                      </div>
                    )}
                    {hasGas && (
                      <div className="cost-row">
                        <span className="cost-label">Annual Gas Cost:</span>
                        <span className="cost-value">{formatCurrency(calculation.results.annualCosts.gas)}</span>
                      </div>
                    )}
                    <div className="cost-row total">
                      <span className="cost-label">Total Annual Cost:</span>
                      <span className="cost-value">{formatCurrency(calculation.results.annualCosts.total)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="cost-card offer-details">
                  <h3>Offer Details</h3>
                  <div className="offer-info">
                    <div className="offer-row">
                      <span className="offer-label">Offer Name:</span>
                      <span className="offer-value">{calculation.document.extractedData.offerName}</span>
                    </div>
                    <div className="offer-row">
                      <span className="offer-label">Offer Code:</span>
                      <span className="offer-value">{calculation.document.extractedData.offerCode}</span>
                    </div>
                    <div className="offer-row">
                      <span className="offer-label">Price Formula:</span>
                      <span className="offer-value">{calculation.document.extractedData.priceFormula}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Consumption Details Tab */}
        {activeTab === 'consumption' && (
          <div className="consumption-tab">
            <div className="section">
              <h2 className="section-title">Energy Consumption</h2>
              
              <div className="info-box">
                <p>This calculation is based on the consumption values you entered. The rates are determined by the uploaded document and contract terms.</p>
              </div>
              
              <div className="costs-grid">
                <div className="cost-card">
                  <h3>Electricity Consumption</h3>
                  <div className="cost-details">
                    {hasElectricity ? (
                      <>
                        {parseFloat(calculation.consumption.electricityF0) > 0 && (
                          <div className="cost-row">
                            <span className="cost-label">F0 (All hours):</span>
                            <span className="cost-value">{calculation.consumption.electricityF0} kWh</span>
                          </div>
                        )}
                        {parseFloat(calculation.consumption.electricityF1) > 0 && (
                          <div className="cost-row">
                            <span className="cost-label">F1 (Peak hours):</span>
                            <span className="cost-value">{calculation.consumption.electricityF1} kWh</span>
                          </div>
                        )}
                        {parseFloat(calculation.consumption.electricityF2) > 0 && (
                          <div className="cost-row">
                            <span className="cost-label">F2 (Mid-peak hours):</span>
                            <span className="cost-value">{calculation.consumption.electricityF2} kWh</span>
                          </div>
                        )}
                        {parseFloat(calculation.consumption.electricityF3) > 0 && (
                          <div className="cost-row">
                            <span className="cost-label">F3 (Off-peak hours):</span>
                            <span className="cost-value">{calculation.consumption.electricityF3} kWh</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="no-data">No electricity consumption data</div>
                    )}
                  </div>
                </div>
                
                <div className="cost-card">
                  <h3>Gas Consumption</h3>
                  <div className="cost-details">
                    {hasGas ? (
                      <div className="cost-row">
                        <span className="cost-label">Gas consumption:</span>
                        <span className="cost-value">{calculation.consumption.gas} m³</span>
                      </div>
                    ) : (
                      <div className="no-data">No gas consumption data</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="section">
              <h2 className="section-title">Rates Applied</h2>
              
              <div className="costs-grid">
                <div className="cost-card">
                  <h3>Electricity Rates</h3>
                  <div className="cost-details">
                    <div className="cost-row">
                      <span className="cost-label">F0 Rate:</span>
                      <span className="cost-value">€{(calculation.document.extractedData.punRates.F0 + 0.05).toFixed(5)}/kWh</span>
                    </div>
                    <div className="cost-row">
                      <span className="cost-label">F1 Rate:</span>
                      <span className="cost-value">€{(calculation.document.extractedData.punRates.F1 + 0.05).toFixed(5)}/kWh</span>
                    </div>
                    <div className="cost-row">
                      <span className="cost-label">F2 Rate:</span>
                      <span className="cost-value">€{(calculation.document.extractedData.punRates.F2 + 0.05).toFixed(5)}/kWh</span>
                    </div>
                    <div className="cost-row">
                      <span className="cost-label">F3 Rate:</span>
                      <span className="cost-value">€{(calculation.document.extractedData.punRates.F3 + 0.05).toFixed(5)}/kWh</span>
                    </div>
                  </div>
                </div>
                
                <div className="cost-card">
                  <h3>Fixed Fees</h3>
                  <div className="cost-details">
                    <div className="cost-row">
                      <span className="cost-label">Monthly Fee:</span>
                      <span className="cost-value">€{calculation.document.extractedData.fixedFees.monthlyFee.toFixed(2)}</span>
                    </div>
                    <div className="cost-row">
                      <span className="cost-label">Contribution Fee:</span>
                      <span className="cost-value">€{calculation.document.extractedData.fixedFees.contributionFee.toFixed(2)}</span>
                    </div>
                    <div className="cost-row">
                      <span className="cost-label">Programmation Fee:</span>
                      <span className="cost-value">€{calculation.document.extractedData.variableFees.programmationFee.toFixed(2)}/kWh</span>
                    </div>
                    <div className="cost-row">
                      <span className="cost-label">Variable Commission:</span>
                      <span className="cost-value">€{calculation.document.extractedData.variableFees.variableCommission.toFixed(2)}/kWh</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Charts Tab */}
        {activeTab === 'charts' && (
          <div className="charts-tab">
            <div className="info-box hide-on-print">
              <ChartIcon className="info-icon" />
              <p>Visual representation of your consumption and costs data. These charts help you better understand your energy usage patterns.</p>
            </div>
            
            <div className="charts-grid">
              {hasElectricity && (
                <div className="chart-card">
                  <h3>Electricity Consumption by Time Band</h3>
                  <div className="chart-container">
                    <PieChart data={getElectricityChartData()} />
                  </div>
                </div>
              )}
              
              <div className="chart-card">
                <h3>Cost Breakdown</h3>
                <div className="chart-container">
                  <PieChart data={getCostsChartData()} />
                </div>
              </div>
              
              {hasElectricity && (
                <div className="chart-card wide">
                  <h3>Electricity Cost by Time Band</h3>
                  <div className="chart-container">
                    <BarChart 
                      labels={['F0', 'F1', 'F2', 'F3', 'Fixed Costs']}
                      values={[
                        parseFloat(calculation.results.monthlyCosts.electricityByBand.F0) || 0,
                        parseFloat(calculation.results.monthlyCosts.electricityByBand.F1) || 0,
                        parseFloat(calculation.results.monthlyCosts.electricityByBand.F2) || 0,
                        parseFloat(calculation.results.monthlyCosts.electricityByBand.F3) || 0,
                        parseFloat(calculation.results.monthlyCosts.fixedCosts) || 0
                      ]}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="section">
              <h2 className="section-title">Cost Comparison</h2>
              <div className="comparison-table">
                <table>
                  <thead>
                    <tr>
                      <th>Cost Type</th>
                      <th>Monthly</th>
                      <th>Annual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hasElectricity && (
                      <tr>
                        <td>Electricity</td>
                        <td>{formatCurrency(calculation.results.monthlyCosts.totalElectricity)}</td>
                        <td>{formatCurrency(calculation.results.annualCosts.electricity)}</td>
                      </tr>
                    )}
                    {hasGas && (
                      <tr>
                        <td>Gas</td>
                        <td>{formatCurrency(calculation.results.monthlyCosts.gas)}</td>
                        <td>{formatCurrency(calculation.results.annualCosts.gas)}</td>
                      </tr>
                    )}
                    <tr className="total-row">
                      <td>Total</td>
                      <td>{formatCurrency(calculation.results.monthlyCosts.total)}</td>
                      <td>{formatCurrency(calculation.results.annualCosts.total)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notes section */}
      <div className="notes-section">
        <h2 className="section-title">Notes</h2>
        <ul className="notes-list">
          <li>Calculations based on the Energy Smart Casa 2025 contract terms.</li>
          <li>All costs include VAT and applicable taxes.</li>
          <li>Actual costs may vary based on real consumption patterns.</li>
          <li>The time bands are defined as follows:
            <ul>
              <li>F0: All hours of the day</li>
              <li>F1: Weekdays from 8:00 to 19:00</li>
              <li>F2: Weekdays from 7:00 to 8:00 and from 19:00 to 23:00, and Saturdays from 7:00 to 23:00</li>
              <li>F3: Weekdays and Saturdays from 00:00 to 7:00 and from 23:00 to 24:00, Sundays and holidays all day</li>
            </ul>
          </li>
        </ul>
      </div>
      
      <div className="page-footer hide-on-print">
        <Link to="/calculations" className="back-link">
          <BackIcon className="back-icon" />
          <span>Back to Calculations</span>
        </Link>
      </div>

      {showDeleteModal && (
        <ConfirmModal
          title="Delete Calculation"
          message={`Are you sure you want to delete this calculation? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={deleteCalculation}
          onCancel={() => setShowDeleteModal(false)}
          danger={true}
        />
      )}
    </div>
  );
};

export default CalculationView;