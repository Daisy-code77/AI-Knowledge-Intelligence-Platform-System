import React, { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

export default function KnowledgeGraph({ data }) {
  const fgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef();

  useEffect(() => {
    if (containerRef.current) {
        setDimensions({
            width: containerRef.current.clientWidth,
            height: containerRef.current.clientHeight
        });
    }
    
    // Slight delay to ensure graph is rendered before Zoom to fit
    setTimeout(() => {
        if(fgRef.current) {
            fgRef.current.zoomToFit(400, 50);
        }
    }, 500);
  }, [data]);

  if (!data || !data.nodes || !data.links) {
    return <div style={{ padding: '24px', color: 'var(--text-secondary)' }}>Invalid graph data or no data available.</div>;
  }

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ForceGraph2D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={data}
        nodeLabel="id"
        nodeAutoColorBy="group"
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.id;
          const fontSize = 14/globalScale;
          ctx.font = `${fontSize}px Inter, Sans-Serif`;
          const textWidth = ctx.measureText(label).width;
          const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.8); 

          // Shadow
          ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
          ctx.shadowBlur = 4 / globalScale;
          ctx.shadowOffsetX = 2 / globalScale;
          ctx.shadowOffsetY = 2 / globalScale;

          // Capsule shape
          const r = bckgDimensions[1] / 2;
          const x = node.x - bckgDimensions[0] / 2;
          const y = node.y - bckgDimensions[1] / 2;
          const w = bckgDimensions[0];
          const h = bckgDimensions[1];
          
          ctx.beginPath();
          ctx.moveTo(x + r, y);
          ctx.lineTo(x + w - r, y);
          ctx.quadraticCurveTo(x + w, y, x + w, y + r);
          ctx.lineTo(x + w, y + h - r);
          ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
          ctx.lineTo(x + r, y + h);
          ctx.quadraticCurveTo(x, y + h, x, y + h - r);
          ctx.lineTo(x, y + r);
          ctx.quadraticCurveTo(x, y, x + r, y);
          ctx.closePath();
          
          ctx.fillStyle = 'rgba(30, 30, 35, 0.95)';
          ctx.fill();
          ctx.strokeStyle = node.color || 'var(--accent-primary)';
          ctx.lineWidth = 2 / globalScale;
          ctx.stroke();

          // Reset shadow for text
          ctx.shadowColor = 'transparent'; e

          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(label, node.x, node.y);

          node.__bckgDimensions = bckgDimensions; 
        }}
        nodePointerAreaPaint={(node, color, ctx) => {
          ctx.fillStyle = color;
          const bckgDimensions = node.__bckgDimensions;
          bckgDimensions && ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);
        }}
        backgroundColor="transparent"
        linkColor={() => 'rgba(255,255,255,0.2)'}
      />
    </div>
  );
}
