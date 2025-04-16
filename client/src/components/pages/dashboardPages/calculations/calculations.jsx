import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Request from "../../../request";
import "./style.css";

import { formatDate, formatCurrency } from "../../../../utils/formatters";
import {
  AddIcon,
  GridViewIcon,
  ListViewIcon,
  SearchIcon,
  SortIcon,
  CalculationIcon,
  DeleteIcon,
  ViewIcon,
  ExportIcon,
  ElectricityIcon,
  GasIcon,
  CalendarIcon,
  DocumentIcon,
  PriceTagIcon,
  FilterIcon,
} from "../../../icons/index";

import ConfirmModal from "../../../dashboardComponents/calculationConfirmModal/confirmModal";

const Calculations = () => {
  const [calculations, setCalculations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState("date"); // 'date', 'cost', 'name'
  const [sortOrder, setSortOrder] = useState("desc"); // 'asc' or 'desc'
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCalculation, setSelectedCalculation] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterType, setFilterType] = useState("all"); // 'all', 'electricity', 'gas', 'both'
  const [calculationStats, setCalculationStats] = useState(null);

  // Fetch calculations
  useEffect(() => {
    fetchCalculations();
  }, []);

  useEffect(() => {
    if (calculations.length > 0) {
      calculateStats();
    }
  }, [calculations]);

  // Fetch all calculations for the user
  const fetchCalculations = async () => {
    try {
      setLoading(true);
      const response = await Request.calculations.getAll();
      setCalculations(response.data.calculations);
      setError("");
    } catch (err) {
      console.error("Error fetching calculations:", err);
      setError("Failed to load your calculations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics based on calculations
  const calculateStats = () => {
    const stats = {
      totalCalculations: calculations.length,
      averageMonthlyCost: 0,
      highestMonthlyCost: 0,
      lowestMonthlyCost: Infinity,
      recentCalculations: 0,
      byEnergyType: {
        electricity: 0,
        gas: 0,
        both: 0,
      },
    };

    // Calculate the date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let totalCost = 0;

    calculations.forEach((calc) => {
      // Count by energy type
      if (calc.hasElectricity && calc.hasGas) {
        stats.byEnergyType.both++;
      } else if (calc.hasElectricity) {
        stats.byEnergyType.electricity++;
      } else if (calc.hasGas) {
        stats.byEnergyType.gas++;
      }

      // Track costs
      const cost = parseFloat(calc.monthlyCost);
      totalCost += cost;

      if (cost > stats.highestMonthlyCost) {
        stats.highestMonthlyCost = cost;
      }

      if (cost < stats.lowestMonthlyCost) {
        stats.lowestMonthlyCost = cost;
      }

      // Count recent calculations
      const calcDate = new Date(calc.createdAt);
      if (calcDate >= thirtyDaysAgo) {
        stats.recentCalculations++;
      }
    });

    stats.averageMonthlyCost = totalCost / calculations.length;

    if (stats.lowestMonthlyCost === Infinity) {
      stats.lowestMonthlyCost = 0;
    }

    setCalculationStats(stats);
  };

  const deleteCalculation = async (id) => {
    try {
      await Request.calculations.delete(id);
      setCalculations(calculations.filter((calc) => calc.id !== id));
      setShowDeleteModal(false);
      setSelectedCalculation(null);
    } catch (err) {
      console.error("Error deleting calculation:", err);
      setError("Failed to delete the calculation. Please try again.");
    }
  };

  const exportCalculationPDF = async (id) => {
    try {
      const response = await Request.calculations.exportPDF(id);

      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `calculation-${id}.pdf`);
      document.body.appendChild(link);
      link.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error exporting PDF:", err);
      setError("Failed to export the calculation as PDF. Please try again.");
    }
  };

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
  };

  const filteredAndSortedCalculations = () => {
    let filtered = calculations.filter((calc) => {
      const matchesSearch =
        searchQuery === "" ||
        calc.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        calc.offerName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        filterType === "all" ||
        (filterType === "electricity" && calc.hasElectricity && !calc.hasGas) ||
        (filterType === "gas" && calc.hasGas && !calc.hasElectricity) ||
        (filterType === "both" && calc.hasElectricity && calc.hasGas);

      return matchesSearch && matchesType;
    });

    // Sort calculations
    filtered.sort((a, b) => {
      let comparison = 0;

      if (sortBy === "date") {
        comparison = new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === "cost") {
        comparison = parseFloat(b.monthlyCost) - parseFloat(a.monthlyCost);
      } else if (sortBy === "name") {
        comparison = a.documentName.localeCompare(b.documentName);
      }

      return sortOrder === "asc" ? -comparison : comparison;
    });

    return filtered;
  };

  // Render loading state
  if (loading) {
    return (
      <div className="calculations-page">
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading your calculations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="calculations-page">
      <div className="page-header">
        <div className="title-section">
          <h1>Your Calculations</h1>
          <p className="subtitle">
            View and manage your utility bill calculations
          </p>
        </div>
        <div className="header-actions">
          <Link to="/upload" className="new-calculation-btn">
            <AddIcon className="btn-icon" />
            <span>New Calculation</span>
          </Link>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {calculations.length === 0 && !loading ? (
        <div className="empty-state">
          <CalculationIcon className="empty-icon" />
          <h2>No Calculations Yet</h2>
          <p>
            You haven't created any calculations yet. Start by uploading a
            document and entering consumption data.
          </p>
          <Link to="/upload" className="empty-cta-button">
            Create Your First Calculation
          </Link>
        </div>
      ) : (
        <>
          {/* Statistics section */}
          {calculationStats && (
            <div className="stats-section">
              <div className="stat-card">
                <CalculationIcon className="stat-icon" />
                <div className="stat-value">
                  {calculationStats.totalCalculations}
                </div>
                <div className="stat-label">Total Calculations</div>
              </div>
              <div className="stat-card">
                <PriceTagIcon className="stat-icon" />
                <div className="stat-value">
                  {formatCurrency(calculationStats.averageMonthlyCost)}
                </div>
                <div className="stat-label">Average Monthly Cost</div>
              </div>
              <div className="stat-card">
                <ElectricityIcon className="stat-icon" />
                <div className="stat-value">
                  {formatCurrency(calculationStats.highestMonthlyCost)}
                </div>
                <div className="stat-label">Highest Monthly Cost</div>
              </div>
              <div className="stat-card">
                <CalendarIcon className="stat-icon" />
                <div className="stat-value">
                  {calculationStats.recentCalculations}
                </div>
                <div className="stat-label">Last 30 Days</div>
              </div>
            </div>
          )}

          <div className="controls-section">
            <div className="search-filter">
              {/* <div className="search-box">
                <input
                  type="text"
                  placeholder="Search calculations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <SearchIcon className="search-icon" />
              </div> */}
              <div className="filter-dropdown">
                <FilterIcon className="filter-icon" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="electricity">Electricity Only</option>
                  <option value="gas">Gas Only</option>
                  <option value="both">Electricity & Gas</option>
                </select>
              </div>
            </div>
            <div className="view-sort-controls">
              <div className="view-toggle">
                <button
                  className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                  onClick={() => setViewMode("grid")}
                  title="Grid View"
                >
                  <GridViewIcon className="view-icon" />
                </button>
                <button
                  className={`view-btn ${viewMode === "list" ? "active" : ""}`}
                  onClick={() => setViewMode("list")}
                  title="List View"
                >
                  <ListViewIcon className="view-icon" />
                </button>
              </div>
              <div className="sort-controls">
                <span className="sort-label">Sort by:</span>
                <button
                  className={`sort-btn ${sortBy === "date" ? "active" : ""}`}
                  onClick={() => handleSortChange("date")}
                >
                  <span>Date</span>
                  {sortBy === "date" && (
                    <SortIcon
                      className={`sort-direction ${
                        sortOrder === "asc" ? "asc" : "desc"
                      }`}
                    />
                  )}
                </button>
                <button
                  className={`sort-btn ${sortBy === "cost" ? "active" : ""}`}
                  onClick={() => handleSortChange("cost")}
                >
                  <span>Cost</span>
                  {sortBy === "cost" && (
                    <SortIcon
                      className={`sort-direction ${
                        sortOrder === "asc" ? "asc" : "desc"
                      }`}
                    />
                  )}
                </button>
                <button
                  className={`sort-btn ${sortBy === "name" ? "active" : ""}`}
                  onClick={() => handleSortChange("name")}
                >
                  <span>Name</span>
                  {sortBy === "name" && (
                    <SortIcon
                      className={`sort-direction ${
                        sortOrder === "asc" ? "asc" : "desc"
                      }`}
                    />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Calculations display */}
          <div className={`calculations-container ${viewMode}`}>
            {filteredAndSortedCalculations().length === 0 ? (
              <div className="no-results">
                <p>No calculations match your search criteria.</p>
                <button
                  className="reset-btn"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterType("all");
                  }}
                >
                  Reset Filters
                </button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="calculations-grid">
                {filteredAndSortedCalculations().map((calc) => (
                  <div key={calc.id} className="calculation-card">
                    <div className="card-header">
                      <div className="energy-type-icons">
                        {calc.hasElectricity && (
                          <ElectricityIcon
                            className="type-icon electricity"
                            title="Electricity"
                          />
                        )}
                        {calc.hasGas && (
                          <GasIcon className="type-icon gas" title="Gas" />
                        )}
                      </div>
                      <div className="card-date">
                        <CalendarIcon className="date-icon" />
                        {formatDate(calc.createdAt)}
                      </div>
                    </div>
                    <div className="card-content">
                      <div className="card-document">
                        <DocumentIcon className="document-icon" />
                        <h3>{calc.documentName}</h3>
                      </div>
                      <div className="card-offer">{calc.offerName}</div>
                      <div className="card-cost">
                        <div className="monthly-cost">
                          <span className="cost-label">Monthly:</span>
                          <span className="cost-value">
                            {formatCurrency(calc.monthlyCost)}
                          </span>
                        </div>
                        <div className="annual-cost">
                          <span className="cost-label">Annual:</span>
                          <span className="cost-value">
                            {formatCurrency(calc.annualCost)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="card-actions">
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
                      <button
                        className="action-btn delete-btn"
                        onClick={() => {
                          setSelectedCalculation(calc);
                          setShowDeleteModal(true);
                        }}
                        title="Delete Calculation"
                      >
                        <DeleteIcon className="action-icon" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="calculations-list">
                <div className="list-header">
                  <div className="list-col date">Date</div>
                  <div className="list-col document">Document</div>
                  <div className="list-col offer">Offer</div>
                  <div className="list-col type">Type</div>
                  <div className="list-col cost">Monthly Cost</div>
                  <div className="list-col cost">Annual Cost</div>
                  <div className="list-col actions">Actions</div>
                </div>
                <div className="list-body">
                  {filteredAndSortedCalculations().map((calc) => (
                    <div key={calc.id} className="list-row">
                      <div className="list-col date">
                        {formatDate(calc.createdAt)}
                      </div>
                      <div
                        className="list-col document"
                        title={calc.documentName}
                      >
                        {calc.documentName}
                      </div>
                      <div className="list-col offer" title={calc.offerName}>
                        {calc.offerName}
                      </div>
                      <div className="list-col type">
                        <div className="energy-type-icons">
                          {calc.hasElectricity && (
                            <ElectricityIcon
                              className="type-icon electricity"
                              title="Electricity"
                            />
                          )}
                          {calc.hasGas && (
                            <GasIcon className="type-icon gas" title="Gas" />
                          )}
                        </div>
                      </div>
                      <div className="list-col cost">
                        {formatCurrency(calc.monthlyCost)}
                      </div>
                      <div className="list-col cost">
                        {formatCurrency(calc.annualCost)}
                      </div>
                      <div className="list-col actions">
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
                        <button
                          className="action-btn delete-btn"
                          onClick={() => {
                            setSelectedCalculation(calc);
                            setShowDeleteModal(true);
                          }}
                          title="Delete Calculation"
                        >
                          <DeleteIcon className="action-icon" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Confirm Delete Modal */}
      {showDeleteModal && selectedCalculation && (
        <ConfirmModal
          title="Delete Calculation"
          message={`Are you sure you want to delete the calculation for "${selectedCalculation.documentName}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={() => deleteCalculation(selectedCalculation.id)}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedCalculation(null);
          }}
        />
      )}
    </div>
  );
};

export default Calculations;
