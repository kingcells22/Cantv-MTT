import React, { useMemo } from 'react';
import { generateQrMatrix, QRErrorCorrectLevel } from '../../utils/qrCode';

interface QrCodeViewProps {
  value: string;
  size?: number;
  className?: string;
  level?: 'L' | 'M' | 'Q' | 'H';
  fgColor?: string;
  bgColor?: string;
  includeMargin?: boolean;
}

export const QrCodeView: React.FC<QrCodeViewProps> = ({
  value,
  size = 120,
  className = '',
  level = 'M',
  fgColor = '#0f172a', // Slate 900
  bgColor = '#ffffff',
  includeMargin = true,
}) => {
  const eccMap = {
    L: QRErrorCorrectLevel.L,
    M: QRErrorCorrectLevel.M,
    Q: QRErrorCorrectLevel.Q,
    H: QRErrorCorrectLevel.H,
  };

  const matrix = useMemo(() => {
    try {
      if (!value) return [];
      return generateQrMatrix(value, eccMap[level] || QRErrorCorrectLevel.M);
    } catch (e) {
      console.error('Error generando QR Code:', e);
      return [];
    }
  }, [value, level]);

  if (!matrix || matrix.length === 0) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex items-center justify-center bg-gray-100 text-gray-400 text-xs rounded border border-gray-200 ${className}`}
      >
        QR No Disp.
      </div>
    );
  }

  const moduleCount = matrix.length;
  const margin = includeMargin ? 2 : 0;
  const viewBoxSize = moduleCount + margin * 2;

  return (
    <svg
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      width={size}
      height={size}
      className={`select-none ${className}`}
      shapeRendering="crispEdges"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width={viewBoxSize} height={viewBoxSize} fill={bgColor} />
      {matrix.map((row, r) =>
        row.map((isDark, c) =>
          isDark ? (
            <rect
              key={`${r}-${c}`}
              x={c + margin}
              y={r + margin}
              width={1}
              height={1}
              fill={fgColor}
            />
          ) : null
        )
      )}
    </svg>
  );
};
