import React, { useEffect, useRef } from 'react';
import './style.css';

const PieChart = ({ data }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!canvasRef.current || !data || data.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGradient.addColorStop(0, '#fcfcfc');
    bgGradient.addColorStop(1, '#f7f9fc');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = 'bold 18px Montserrat, Arial, sans-serif';
    ctx.fillStyle = '#333745';
    ctx.textAlign = 'center';
    ctx.fillText('Expense Distribution', canvas.width / 2, 24);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.7;
    
    const total = data.reduce((acc, item) => acc + item.value, 0);
    
    const defaultColors = [
      '#5e72e4', // primary blue
      '#11cdef', // info cyan
      '#2dce89', // success green
      '#fb6340', // warning orange
      '#f5365c', // danger red
      '#8965e0', // purple
      '#f3a4b5', // pink
      '#ffd600', // yellow
      '#8898aa', // light gray
      '#32325d'  // dark blue
    ];
    
    data.forEach((item, index) => {
      if (!item.color) {
        item.color = defaultColors[index % defaultColors.length];
      }
    });
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;
    ctx.fill();
    
    let startAngle = -Math.PI / 2;

    data.forEach((item, index) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;
      
      // Draw shadow slice
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 4;
      ctx.fill();
      
      startAngle = endAngle;
    });
    
    startAngle = -Math.PI / 2;
    
    data.forEach((item, index) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      
      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, radius
      );
      const lighterColor = lightenColor(item.color, 20);
      gradient.addColorStop(0, lighterColor);
      gradient.addColorStop(1, item.color);
      
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = gradient;
      ctx.fill();
      
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      const middleAngle = startAngle + sliceAngle / 2;
      const labelRadius = radius * 0.75;
      const labelX = centerX + labelRadius * Math.cos(middleAngle);
      const labelY = centerY + labelRadius * Math.sin(middleAngle);
      
      if (sliceAngle > 0.2) {
        const percentage = ((item.value / total) * 100).toFixed(0) + '%';
        
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        ctx.font = 'bold 14px Montserrat, Arial, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(percentage, labelX, labelY);
        
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      }
      
      startAngle = endAngle;
    });
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;
    ctx.fill();
    ctx.shadowColor = 'transparent';
    
    // Add total in the center
    const totalFormatted = total.toFixed(2);
    ctx.font = 'bold 14px Montserrat, Arial, sans-serif';
    ctx.fillStyle = '#333745';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Total', centerX, centerY - 10);
    ctx.font = 'bold 16px Montserrat, Arial, sans-serif';
    ctx.fillText('€' + totalFormatted, centerX, centerY + 10);
    
    const legendX = 20;
    let legendY = canvas.height - (data.length * 25) - 20;
    
    ctx.font = 'bold 14px Montserrat, Arial, sans-serif';
    ctx.fillStyle = '#495057';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('Category Breakdown', legendX, legendY - 25);
    
    // Ensure legend doesn't overflow at the top
    if (legendY < 40) {
      legendY = 40;
    }
    
    const legendWidth = 200;
    const legendHeight = (data.length * 25) + 10;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;
    roundRect(ctx, legendX - 10, legendY - 10, legendWidth, legendHeight, 8, true, false);
    ctx.shadowColor = 'transparent';
    
    data.forEach((item, index) => {
      roundRect(ctx, legendX, legendY + (index * 25), 16, 16, 3, false, false);
      
      const gradient = ctx.createLinearGradient(
        legendX, legendY + (index * 25),
        legendX + 16, legendY + (index * 25) + 16
      );
      gradient.addColorStop(0, lightenColor(item.color, 20));
      gradient.addColorStop(1, item.color);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      ctx.font = '14px Montserrat, Arial, sans-serif';
      ctx.fillStyle = '#495057';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      
      let valueText = '';
      if (item.value % 1 === 0) {
        valueText = item.value.toString();
      } else {
        valueText = item.value.toFixed(2);
      }
      
      const percentage = ((item.value / total) * 100).toFixed(1);
      const legendText = `${item.name}: €${valueText} (${percentage}%)`;
      ctx.fillText(legendText, legendX + 25, legendY + (index * 25) + 8);
    });
    
    ctx.font = 'italic 10px Montserrat, Arial, sans-serif';
    ctx.fillStyle = '#adb5bd';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText('Financial Report ' + new Date().getFullYear(), canvas.width - 20, canvas.height - 10);
    
  }, [data, canvasRef]);
  
  function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof radius === 'undefined') {
      radius = 5;
    }
    if (typeof radius === 'number') {
      radius = {tl: radius, tr: radius, br: radius, bl: radius};
    } else {
      const defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
      for (let side in defaultRadius) {
        radius[side] = radius[side] || defaultRadius[side];
      }
    }
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
  
  function lightenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    
    return '#' + (
      0x1000000 +
      (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)
    ).toString(16).slice(1);
  }
  
  return (
    <div className="chart-wrapper">
      <canvas ref={canvasRef} className="pie-chart"></canvas>
    </div>
  );
};

export default PieChart;

