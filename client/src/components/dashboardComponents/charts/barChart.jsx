import React, { useEffect, useRef } from 'react';
import './style.css';

const BarChart = ({ labels, values }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!canvasRef.current || !labels || !values || labels.length === 0 || values.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    const chartWidth = canvas.width - 100;
    const chartHeight = canvas.height - 120;
    const chartX = 80;
    const chartY = 40;
    
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGradient.addColorStop(0, '#fcfcfc');
    bgGradient.addColorStop(1, '#f7f9fc');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = 'bold 18px Montserrat, Arial, sans-serif';
    ctx.fillStyle = '#333745';
    ctx.textAlign = 'center';
    ctx.fillText('Financial Overview', canvas.width / 2, 24);
    
    const maxValue = Math.max(...values) * 1.1; // Add 10% padding
    
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, chartX, chartY, chartWidth, chartHeight, 8, true, false);
    
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    
    const gridCount = 5;
    ctx.strokeStyle = '#e6eaee';
    ctx.fillStyle = '#73777f';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.font = '12px Montserrat, Arial, sans-serif';
    
    for (let i = 0; i <= gridCount; i++) {
      const y = chartY + chartHeight - (i / gridCount) * chartHeight;
      const value = (i / gridCount) * maxValue;
      
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.moveTo(chartX, y);
      ctx.lineTo(chartX + chartWidth, y);
      ctx.stroke();
      ctx.setLineDash([]);
      
      let valueText;
      if (value < 1000) {
        valueText = value.toFixed(2);
      } else {
        valueText = value.toFixed(0);
      }
      ctx.fillText('€' + valueText, chartX - 15, y);
    }
    
    const barWidth = chartWidth / labels.length * 0.6;
    const barSpacing = chartWidth / labels.length;
    
    values.forEach((value, index) => {
      const barHeight = (value / maxValue) * chartHeight;
      
      const barX = chartX + (index * barSpacing) + (barSpacing - barWidth) / 2;
      const barY = chartY + chartHeight - barHeight;
      
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 4;
      
      ctx.beginPath();
      roundRect(ctx, barX, barY, barWidth, barHeight, 5, true, false);
      
      const gradient = ctx.createLinearGradient(barX, barY, barX, barY + barHeight);
      gradient.addColorStop(0, '#5e72e4');
      gradient.addColorStop(1, '#324cdd');
      ctx.fillStyle = gradient;
      ctx.fill();
      
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      
      const shineHeight = barHeight * 0.15;
      ctx.beginPath();
      ctx.rect(barX, barY, barWidth, shineHeight);
      const shineGradient = ctx.createLinearGradient(barX, barY, barX, barY + shineHeight);
      shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = shineGradient;
      ctx.fill();
      
      const valueText = '€' + value.toFixed(2);
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.font = 'bold 12px Montserrat, Arial, sans-serif';
      
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 1;
      ctx.fillText(valueText, barX + barWidth / 2, barY - 8);
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      
      ctx.fillStyle = '#495057';
      ctx.textBaseline = 'top';
      ctx.font = '12px Montserrat, Arial, sans-serif';
      ctx.fillText(labels[index], barX + barWidth / 2, chartY + chartHeight + 15);
    });
    
    ctx.strokeStyle = '#ced4da';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(chartX, chartY);
    ctx.lineTo(chartX, chartY + chartHeight);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(chartX, chartY + chartHeight);
    ctx.lineTo(chartX + chartWidth, chartY + chartHeight);
    ctx.stroke();
    
    ctx.font = 'italic 10px Montserrat, Arial, sans-serif';
    ctx.fillStyle = '#adb5bd';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText('Financial Report ' + new Date().getFullYear(), canvas.width - 20, canvas.height - 10);
    
  }, [labels, values, canvasRef]);
  
  function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof radius === 'undefined') {
      radius = 5;
    };

    if (typeof radius === 'number') {
      radius = {tl: radius, tr: radius, br: radius, bl: radius};
    } else {
      const defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
      for (let side in defaultRadius) {
        radius[side] = radius[side] || defaultRadius[side];
      };
    };

    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) {
      ctx.fill();
    }
    if (stroke) {
      ctx.stroke();
    }
  }
  
  return (
    <div className="chart-wrapper">
      <canvas ref={canvasRef} className="bar-chart"></canvas>
    </div>
  );
};

export default BarChart;