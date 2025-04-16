import React, { useState, useRef } from "react";
import Request from "../../../request";
import "./style.css";

const Upload = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [filePreview, setFilePreview] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [extractedData, setExtractedData] = useState(null);
  const [documentId, setDocumentId] = useState(null);
  const [calculationId, setCalculationId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [consumptionData, setConsumptionData] = useState({
    electricityF0: "",
    electricityF1: "",
    electricityF2: "",
    electricityF3: "",
    gas: "",
  });
  const [calculationResults, setCalculationResults] = useState(null);
  const [activeTab, setActiveTab] = useState("upload");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setFileName(selectedFile.name);

      // Create file preview URL
      const fileURL = URL.createObjectURL(selectedFile);
      setFilePreview(fileURL);

      // Reset other states
      setUploadStatus("idle");
      setExtractedData(null);
      setCalculationResults(null);
      setErrorMessage("");
    }
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  // Handle file drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
      setFileName(droppedFile.name);

      // Create file preview URL
      const fileURL = URL.createObjectURL(droppedFile);
      setFilePreview(fileURL);

      // Reset other states
      setUploadStatus("idle");
      setExtractedData(null);
      setCalculationResults(null);
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    try {
      setUploadStatus("uploading");

      // Create FormData object
      const formData = new FormData();
      formData.append("document", file);

      // Upload the document
      const response = await Request.documents.upload(formData);

      // Handle successful upload
      setUploadStatus("success");

      // Store document ID
      setDocumentId(response.data.document.id);

      // Set extracted data from response
      setExtractedData(response.data.document.extractedData);
      setActiveTab("consumption");
    } catch (error) {
      console.error("Error uploading document:", error);
      setUploadStatus("error");
      setErrorMessage("Failed to upload document. Please try again.");
    }
  };

  // Handle consumption data input
  const handleConsumptionChange = (e) => {
    const { name, value } = e.target;
    setConsumptionData({
      ...consumptionData,
      [name]: value,
    });
  };

  const calculateCosts = async () => {
    if (!extractedData || !documentId) return;

    try {
      // Prepare data for calculation
      const calculationData = {
        documentId: documentId,
        consumption: {
          electricityF0: parseFloat(consumptionData.electricityF0) || 0,
          electricityF1: parseFloat(consumptionData.electricityF1) || 0,
          electricityF2: parseFloat(consumptionData.electricityF2) || 0,
          electricityF3: parseFloat(consumptionData.electricityF3) || 0,
          gas: parseFloat(consumptionData.gas) || 0,
        },
      };

      // Call API to create calculation
      const response = await Request.calculations.create(calculationData);

      // Set calculation results from response
      setCalculationResults(response.data.results);
      setCalculationId(response.data.calculationId);
      setActiveTab("results");
    } catch (error) {
      console.error("Error creating calculation:", error);
      setErrorMessage("Failed to calculate costs. Please try again.");
    }
  };

  const exportToPDF = async () => {
    if (!calculationId) return;
    
    try {
      // Call API to export PDF
      const response = await Request.calculations.exportPDF(calculationId);
      
      // Check if response is JSON or actual PDF data
      const contentType = response.headers['content-type'] || '';
      
      if (contentType.includes('application/json')) {
        // Handle case where API returns JSON instead of PDF
        console.log('Received JSON response instead of PDF:', response.data);
        setErrorMessage('PDF generation not yet implemented on the server');
        
        // For demo purposes - generate a simple PDF client-side
        // In production, this should come from the server
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();
        
        // Add content to PDF
        doc.setFontSize(16);
        doc.text('Calculation Results', 20, 20);
        
        doc.setFontSize(12);
        doc.text(`Monthly Total: €${calculationResults.monthlyCosts.total}`, 20, 40);
        doc.text(`Annual Total: €${calculationResults.annualCosts.total}`, 20, 50);
        
        // Save PDF
        doc.save(`calculation-${calculationId}.pdf`);
      } else {
        // This is an actual PDF file - handle normally
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `calculation-${calculationId}.pdf`);
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setErrorMessage('Failed to export PDF. Please try again.');
      
      // For demo purposes - if the server PDF export fails
      try {
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();
        
        // Simple fallback PDF
        doc.setFontSize(16);
        doc.text('Calculation Results', 20, 20);
        
        doc.setFontSize(12);
        doc.text(`Monthly Total: €${calculationResults.monthlyCosts.total}`, 20, 40);
        doc.text(`Annual Total: €${calculationResults.annualCosts.total}`, 20, 50);
        
        // Save PDF
        doc.save(`calculation-${calculationId}.pdf`);
      } catch (pdfError) {
        console.error('Error generating fallback PDF:', pdfError);
        setErrorMessage('Could not generate PDF. Please try again later.');
      }
    }
  };

  return (
    <div className="upload-page-container">
      <div className="page-header">
        <h1>Utility Bill Calculator</h1>
        <p className="subtitle">
          Upload contract documents and calculate costs
        </p>
      </div>

      {errorMessage && (
        <div className="upload-error">
          <p>{errorMessage}</p>
        </div>
      )}

      <div className="upload-workflow-tabs">
        <button
          className={`workflow-tab ${activeTab === "upload" ? "active" : ""}`}
          onClick={() => setActiveTab("upload")}
        >
          <span className="tab-number">1</span>
          <span className="tab-text">Upload Document</span>
        </button>
        <div className="tab-connector"></div>
        <button
          className={`workflow-tab ${
            activeTab === "consumption" ? "active" : ""
          } ${!extractedData ? "disabled" : ""}`}
          onClick={() => extractedData && setActiveTab("consumption")}
          disabled={!extractedData}
        >
          <span className="tab-number">2</span>
          <span className="tab-text">Enter Consumption</span>
        </button>
        <div className="tab-connector"></div>
        <button
          className={`workflow-tab ${activeTab === "results" ? "active" : ""} ${
            !calculationResults ? "disabled" : ""
          }`}
          onClick={() => calculationResults && setActiveTab("results")}
          disabled={!calculationResults}
        >
          <span className="tab-number">3</span>
          <span className="tab-text">View Results</span>
        </button>
      </div>

      <div className="upload-content-container">
        {/* Step 1: Upload Document */}
        {activeTab === "upload" && (
          <div className="upload-section">
            <div className="upload-container">
              <div
                className="upload-dropzone"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={handleUploadClick}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf"
                  className="file-input"
                />

                {!file ? (
                  <div className="upload-placeholder">
                    <div className="upload-icon">📄</div>
                    <h3>Drag & Drop or Click to Upload</h3>
                    <p>
                      Upload a PDF document with utility economic conditions
                    </p>
                    <button className="upload-button">Select PDF</button>
                  </div>
                ) : (
                  <div className="file-preview">
                    <div className="file-info">
                      <div className="file-icon">📄</div>
                      <div className="file-details">
                        <h3>{fileName}</h3>
                        <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      className="remove-file-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setFileName("");
                        setFilePreview(null);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {file && (
                <div className="upload-actions">
                  <button
                    className="process-button"
                    onClick={handleSubmit}
                    disabled={uploadStatus === "uploading"}
                  >
                    {uploadStatus === "uploading"
                      ? "Processing..."
                      : "Process Document"}
                  </button>
                </div>
              )}

              {uploadStatus === "error" && (
                <div className="upload-error">
                  <p>
                    There was an error processing your document. Please try
                    again.
                  </p>
                </div>
              )}
            </div>

            {filePreview && (
              <div className="document-preview">
                <h3>Document Preview</h3>
                <iframe
                  src={filePreview}
                  title="PDF Preview"
                  className="pdf-preview"
                />
              </div>
            )}
          </div>
        )}

        {/* Step 2: Enter Consumption Data */}
        {activeTab === "consumption" && extractedData && (
          <div className="consumption-section">
            <div className="extracted-data-card">
              <h3>Extracted Contract Information</h3>
              <div className="data-grid">
                <div className="data-item">
                  <span className="data-label">Offer Name:</span>
                  <span className="data-value">{extractedData.offerName}</span>
                </div>
                <div className="data-item">
                  <span className="data-label">Offer Code:</span>
                  <span className="data-value">{extractedData.offerCode}</span>
                </div>
                <div className="data-item">
                  <span className="data-label">Price Formula:</span>
                  <span className="data-value">
                    {extractedData.priceFormula}
                  </span>
                </div>
                <div className="data-item">
                  <span className="data-label">Monthly Fee:</span>
                  <span className="data-value">
                    €{extractedData.fixedFees.monthlyFee.toFixed(2)}
                  </span>
                </div>
                <div className="data-item">
                  <span className="data-label">Contribution Fee:</span>
                  <span className="data-value">
                    €{extractedData.fixedFees.contributionFee.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="consumption-form">
              <h3>Enter Consumption Data</h3>
              <p className="form-hint">
                Enter the consumption data to calculate estimated costs
              </p>

              <div className="form-section">
                <h4>Electricity Consumption (kWh/month)</h4>
                <div className="input-grid">
                  <div className="input-group">
                    <label htmlFor="electricityF0">F0 (All hours)</label>
                    <input
                      type="number"
                      id="electricityF0"
                      name="electricityF0"
                      placeholder="Enter kWh"
                      value={consumptionData.electricityF0}
                      onChange={handleConsumptionChange}
                    />
                    <span className="input-hint">
                      Rate: €{(extractedData.punRates.F0 + 0.05).toFixed(5)}/kWh
                    </span>
                  </div>

                  <div className="input-group">
                    <label htmlFor="electricityF1">F1 (Peak hours)</label>
                    <input
                      type="number"
                      id="electricityF1"
                      name="electricityF1"
                      placeholder="Enter kWh"
                      value={consumptionData.electricityF1}
                      onChange={handleConsumptionChange}
                    />
                    <span className="input-hint">
                      Rate: €{(extractedData.punRates.F1 + 0.05).toFixed(5)}/kWh
                    </span>
                  </div>

                  <div className="input-group">
                    <label htmlFor="electricityF2">F2 (Mid-peak hours)</label>
                    <input
                      type="number"
                      id="electricityF2"
                      name="electricityF2"
                      placeholder="Enter kWh"
                      value={consumptionData.electricityF2}
                      onChange={handleConsumptionChange}
                    />
                    <span className="input-hint">
                      Rate: €{(extractedData.punRates.F2 + 0.05).toFixed(5)}/kWh
                    </span>
                  </div>

                  <div className="input-group">
                    <label htmlFor="electricityF3">F3 (Off-peak hours)</label>
                    <input
                      type="number"
                      id="electricityF3"
                      name="electricityF3"
                      placeholder="Enter kWh"
                      value={consumptionData.electricityF3}
                      onChange={handleConsumptionChange}
                    />
                    <span className="input-hint">
                      Rate: €{(extractedData.punRates.F3 + 0.05).toFixed(5)}/kWh
                    </span>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Gas Consumption (m³/month)</h4>
                <div className="input-grid">
                  <div className="input-group">
                    <label htmlFor="gas">Gas Consumption</label>
                    <input
                      type="number"
                      id="gas"
                      name="gas"
                      placeholder="Enter m³"
                      value={consumptionData.gas}
                      onChange={handleConsumptionChange}
                    />
                    <span className="input-hint">
                      Optional - for gas contracts
                    </span>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  className="secondary-button"
                  onClick={() => setActiveTab("upload")}
                >
                  Back
                </button>
                <button className="primary-button" onClick={calculateCosts}>
                  Calculate Costs
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "results" && calculationResults && (
          <div className="results-section">
            <div className="results-header">
              <h2>Calculation Results</h2>
              <button className="export-button-u" onClick={exportToPDF}>
                Export to PDF
              </button>
            </div>

            <div className="results-grid">
              <div className="result-card">
                <h3>Monthly Costs Breakdown</h3>
                <div className="cost-breakdown">
                  <div className="cost-category">
                    <h4>Electricity Costs</h4>
                    <div className="cost-item">
                      <span>F0 (All hours):</span>
                      <span className="cost-value">
                        €{calculationResults.monthlyCosts.electricityByBand.F0}
                      </span>
                    </div>
                    <div className="cost-item">
                      <span>F1 (Peak hours):</span>
                      <span className="cost-value">
                        €{calculationResults.monthlyCosts.electricityByBand.F1}
                      </span>
                    </div>
                    <div className="cost-item">
                      <span>F2 (Mid-peak hours):</span>
                      <span className="cost-value">
                        €{calculationResults.monthlyCosts.electricityByBand.F2}
                      </span>
                    </div>
                    <div className="cost-item">
                      <span>F3 (Off-peak hours):</span>
                      <span className="cost-value">
                        €{calculationResults.monthlyCosts.electricityByBand.F3}
                      </span>
                    </div>
                    <div className="cost-item">
                      <span>Fixed monthly fees:</span>
                      <span className="cost-value">
                        €{calculationResults.monthlyCosts.fixedCosts}
                      </span>
                    </div>
                    <div className="cost-item total">
                      <span>Total Electricity:</span>
                      <span className="cost-value">
                        €{calculationResults.monthlyCosts.totalElectricity}
                      </span>
                    </div>
                  </div>

                  {parseFloat(calculationResults.monthlyCosts.gas) > 0 && (
                    <div className="cost-category">
                      <h4>Gas Costs</h4>
                      <div className="cost-item total">
                        <span>Total Gas:</span>
                        <span className="cost-value">
                          €{calculationResults.monthlyCosts.gas}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="grand-total">
                    <span>Total Monthly Cost:</span>
                    <span className="total-value">
                      €{calculationResults.monthlyCosts.total}
                    </span>
                  </div>
                </div>
              </div>

              <div className="result-card annual-costs">
                <h3>Annual Costs Projection</h3>
                <div className="annual-breakdown">
                  <div className="cost-item">
                    <span>Annual Electricity Cost:</span>
                    <span className="cost-value">
                      €{calculationResults.annualCosts.electricity}
                    </span>
                  </div>

                  {parseFloat(calculationResults.annualCosts.gas) > 0 && (
                    <div className="cost-item">
                      <span>Annual Gas Cost:</span>
                      <span className="cost-value">
                        €{calculationResults.annualCosts.gas}
                      </span>
                    </div>
                  )}

                  <div className="cost-item grand-total">
                    <span>Total Annual Cost:</span>
                    <span className="total-value">
                      €{calculationResults.annualCosts.total}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="results-notes">
              <h4>Notes</h4>
              <ul>
                <li>
                  Calculations based on the Energy Smart Casa 2025 contract
                  terms.
                </li>
                <li>All costs include VAT and applicable taxes.</li>
                <li>
                  Actual costs may vary based on real consumption patterns.
                </li>
              </ul>
            </div>

            <div className="form-actions">
              <button
                className="secondary-button"
                onClick={() => setActiveTab("consumption")}
              >
                Back to Consumption
              </button>
              <button
                className="primary-button"
                onClick={() => {
                  setFile(null);
                  setFileName("");
                  setFilePreview(null);
                  setUploadStatus("idle");
                  setExtractedData(null);
                  setDocumentId(null);
                  setCalculationId(null);
                  setErrorMessage("");
                  setConsumptionData({
                    electricityF0: "",
                    electricityF1: "",
                    electricityF2: "",
                    electricityF3: "",
                    gas: "",
                  });
                  setCalculationResults(null);
                  setActiveTab("upload");
                }}
              >
                Start New Calculation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;
