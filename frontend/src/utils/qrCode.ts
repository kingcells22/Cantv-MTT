/**
 * SINCOMTT - Generador Autónomo de Códigos QR (ISO/IEC 18004)
 * Implementación 100% pura en TypeScript, sin dependencias externas.
 * Garantiza funcionamiento offline en red interna CANTV y compatibilidad con React 19.
 */

// Niveles de corrección de error
export enum QRErrorCorrectLevel {
  L = 1,
  M = 0,
  Q = 3,
  H = 2,
}

// Tablas Galois Field GF(256)
const QR_MATH_EXP: number[] = new Array(512);
const QR_MATH_LOG: number[] = new Array(256);

(function initQRMath() {
  let val = 1;
  for (let i = 0; i < 255; i++) {
    QR_MATH_EXP[i] = val;
    QR_MATH_EXP[i + 255] = val;
    QR_MATH_LOG[val] = i;
    val = (val << 1) ^ ((val & 0x80) ? 0x11d : 0);
  }
})();

function qrGfMul(x: number, y: number): number {
  if (x === 0 || y === 0) return 0;
  return QR_MATH_EXP[QR_MATH_LOG[x] + QR_MATH_LOG[y]];
}

// Polinomio para Reed-Solomon
class QRPolynomial {
  num: number[];

  constructor(num: number[], shift = 0) {
    let offset = 0;
    while (offset < num.length && num[offset] === 0) {
      offset++;
    }
    this.num = new Array(num.length - offset + shift);
    for (let i = 0; i < num.length - offset; i++) {
      this.num[i] = num[i + offset];
    }
    for (let i = num.length - offset; i < this.num.length; i++) {
      this.num[i] = 0;
    }
  }

  get(index: number): number {
    return this.num[index];
  }

  getLength(): number {
    return this.num.length;
  }

  multiply(e: QRPolynomial): QRPolynomial {
    const num = new Array(this.getLength() + e.getLength() - 1).fill(0);
    for (let i = 0; i < this.getLength(); i++) {
      for (let j = 0; j < e.getLength(); j++) {
        num[i + j] ^= qrGfMul(this.get(i), e.get(j));
      }
    }
    return new QRPolynomial(num);
  }

  mod(e: QRPolynomial): QRPolynomial {
    if (this.getLength() - e.getLength() < 0) {
      return this;
    }
    const ratio = QR_MATH_LOG[this.get(0)] - QR_MATH_LOG[e.get(0)];
    const num = this.num.slice();
    for (let i = 0; i < e.getLength(); i++) {
      num[i] ^= QR_MATH_EXP[(QR_MATH_LOG[e.get(i)] + ratio + 255) % 255];
    }
    return new QRPolynomial(num).mod(e);
  }
}

// Bloques RS según versión y nivel ECC
class QRRSBlock {
  totalCount: number;
  dataCount: number;

  constructor(totalCount: number, dataCount: number) {
    this.totalCount = totalCount;
    this.dataCount = dataCount;
  }

  static getRSBlocks(typeNumber: number, errorCorrectLevel: QRErrorCorrectLevel): QRRSBlock[] {
    const rsBlockTable = [
      // L, M, Q, H
      // 1
      [1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9],
      // 2
      [1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16],
      // 3
      [1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13],
      // 4
      [1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9],
      // 5
      [1, 134, 108], [2, 67, 43], [2, 33, 15, 2, 34, 16], [2, 33, 11, 2, 34, 12],
      // 6
      [2, 86, 68], [4, 43, 27], [4, 43, 19], [4, 43, 15],
      // 7
      [2, 98, 78], [4, 49, 31], [2, 32, 14, 4, 33, 15], [4, 39, 13, 1, 40, 14],
      // 8
      [2, 121, 97], [2, 60, 38, 2, 61, 39], [4, 40, 18, 2, 41, 19], [4, 40, 14, 2, 41, 15],
      // 9
      [2, 146, 116], [3, 58, 36, 2, 59, 37], [4, 36, 16, 4, 37, 17], [4, 36, 12, 4, 37, 13],
      // 10
      [2, 86, 68, 2, 87, 69], [4, 69, 43, 1, 70, 44], [6, 43, 19, 2, 44, 20], [6, 43, 15, 2, 44, 16],
    ];

    const offset = (typeNumber - 1) * 4 + errorCorrectLevel;
    const raw = rsBlockTable[offset] || [1, 26, 19];
    const list: QRRSBlock[] = [];

    for (let i = 0; i < raw.length; i += 3) {
      const count = raw[i];
      const totalCount = raw[i + 1];
      const dataCount = raw[i + 2];
      for (let j = 0; j < count; j++) {
        list.push(new QRRSBlock(totalCount, dataCount));
      }
    }
    return list;
  }
}

// Buffer de bits
class QRBitBuffer {
  buffer: number[] = [];
  length = 0;

  get(index: number): boolean {
    const bufIndex = Math.floor(index / 8);
    return ((this.buffer[bufIndex] >>> (7 - (index % 8))) & 1) === 1;
  }

  put(num: number, length: number): void {
    for (let i = 0; i < length; i++) {
      this.putBit(((num >>> (length - i - 1)) & 1) === 1);
    }
  }

  putBit(bit: boolean): void {
    const bufIndex = Math.floor(this.length / 8);
    if (this.buffer.length <= bufIndex) {
      this.buffer.push(0);
    }
    if (bit) {
      this.buffer[bufIndex] |= 0x80 >>> (this.length % 8);
    }
    this.length++;
  }
}

// Utilidades del estándar QR
const PATTERN_POSITION_TABLE = [
  [],
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50],
];

const G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
const G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

function getBCHTypeInfo(data: number): number {
  let d = data << 10;
  while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
    d ^= G15 << (getBCHDigit(d) - getBCHDigit(G15));
  }
  return ((data << 10) | d) ^ G15_MASK;
}

function getBCHDigit(data: number): number {
  let digit = 0;
  while (data !== 0) {
    digit++;
    data >>>= 1;
  }
  return digit;
}

function getMask(maskPattern: number, i: number, j: number): boolean {
  switch (maskPattern) {
    case 0: return (i + j) % 2 === 0;
    case 1: return i % 2 === 0;
    case 2: return j % 3 === 0;
    case 3: return (i + j) % 3 === 0;
    case 4: return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
    case 5: return ((i * j) % 2) + ((i * j) % 3) === 0;
    case 6: return (((i * j) % 2) + ((i * j) % 3)) % 2 === 0;
    case 7: return (((i * j) % 3) + ((i + j) % 2)) % 2 === 0;
    default: return false;
  }
}

function getLostPoint(modules: (boolean | null)[][]): number {
  const moduleCount = modules.length;
  let lostPoint = 0;

  // Nivel 1: Líneas continuas de módulos del mismo color
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      let sameCount = 0;
      const dark = modules[row][col];
      for (let r = -1; r <= 1; r++) {
        if (row + r < 0 || moduleCount <= row + r) continue;
        for (let c = -1; c <= 1; c++) {
          if (col + c < 0 || moduleCount <= col + c) continue;
          if (r === 0 && c === 0) continue;
          if (dark === modules[row + r][col + c]) sameCount++;
        }
      }
      if (sameCount > 5) lostPoint += 3 + sameCount - 5;
    }
  }

  // Nivel 2: Bloques 2x2
  for (let row = 0; row < moduleCount - 1; row++) {
    for (let col = 0; col < moduleCount - 1; col++) {
      let count = 0;
      if (modules[row][col]) count++;
      if (modules[row + 1][col]) count++;
      if (modules[row][col + 1]) count++;
      if (modules[row + 1][col + 1]) count++;
      if (count === 0 || count === 4) lostPoint += 3;
    }
  }

  return lostPoint;
}

// Modelo Principal del Código QR
export class QRCodeModel {
  typeNumber: number;
  errorCorrectLevel: QRErrorCorrectLevel;
  modules: (boolean | null)[][] = [];
  moduleCount = 0;
  dataList: string[] = [];

  constructor(typeNumber: number, errorCorrectLevel: QRErrorCorrectLevel) {
    this.typeNumber = typeNumber;
    this.errorCorrectLevel = errorCorrectLevel;
  }

  addData(data: string): void {
    this.dataList.push(data);
  }

  make(): void {
    if (this.typeNumber < 1) {
      let typeNumber = 1;
      for (; typeNumber < 10; typeNumber++) {
        const rsBlocks = QRRSBlock.getRSBlocks(typeNumber, this.errorCorrectLevel);
        const buffer = new QRBitBuffer();
        let totalDataCount = 0;
        for (let i = 0; i < rsBlocks.length; i++) {
          totalDataCount += rsBlocks[i].dataCount;
        }
        for (let i = 0; i < this.dataList.length; i++) {
          const s = this.dataList[i];
          buffer.put(4, 4); // 8-bit byte mode
          buffer.put(s.length, 8);
          for (let j = 0; j < s.length; j++) {
            buffer.put(s.charCodeAt(j), 8);
          }
        }
        if (buffer.length <= totalDataCount * 8) {
          break;
        }
      }
      this.typeNumber = Math.min(typeNumber, 10);
    }
    this.makeImpl(false, this.getBestMaskPattern());
  }

  private makeImpl(test: boolean, maskPattern: number): void {
    this.moduleCount = this.typeNumber * 4 + 17;
    this.modules = new Array(this.moduleCount);
    for (let row = 0; row < this.moduleCount; row++) {
      this.modules[row] = new Array(this.moduleCount).fill(null);
    }

    this.setupPositionProbePattern(0, 0);
    this.setupPositionProbePattern(this.moduleCount - 7, 0);
    this.setupPositionProbePattern(0, this.moduleCount - 7);
    this.setupPositionAdjustPattern();
    this.setupTimingPattern();
    this.setupTypeInfo(test, maskPattern);
    this.mapData(this.createData(), maskPattern);
  }

  private setupPositionProbePattern(row: number, col: number): void {
    for (let r = -1; r <= 7; r++) {
      if (row + r <= -1 || this.moduleCount <= row + r) continue;
      for (let c = -1; c <= 7; c++) {
        if (col + c <= -1 || this.moduleCount <= col + c) continue;
        if (
          (0 <= r && r <= 6 && (c === 0 || c === 6)) ||
          (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
          (2 <= r && r <= 4 && 2 <= c && c <= 4)
        ) {
          this.modules[row + r][col + c] = true;
        } else {
          this.modules[row + r][col + c] = false;
        }
      }
    }
  }

  private setupTimingPattern(): void {
    for (let r = 8; r < this.moduleCount - 8; r++) {
      if (this.modules[r][6] !== null) continue;
      this.modules[r][6] = r % 2 === 0;
    }
    for (let c = 8; c < this.moduleCount - 8; c++) {
      if (this.modules[6][c] !== null) continue;
      this.modules[6][c] = c % 2 === 0;
    }
  }

  private setupPositionAdjustPattern(): void {
    const pos = PATTERN_POSITION_TABLE[this.typeNumber - 1] || [];
    for (let i = 0; i < pos.length; i++) {
      for (let j = 0; j < pos.length; j++) {
        const row = pos[i];
        const col = pos[j];
        if (this.modules[row][col] !== null) continue;
        for (let r = -2; r <= 2; r++) {
          for (let c = -2; c <= 2; c++) {
            if (r === -2 || r === 2 || c === -2 || c === 2 || (r === 0 && c === 0)) {
              this.modules[row + r][col + c] = true;
            } else {
              this.modules[row + r][col + c] = false;
            }
          }
        }
      }
    }
  }

  private setupTypeInfo(test: boolean, maskPattern: number): void {
    const data = (this.errorCorrectLevel << 3) | maskPattern;
    const bits = getBCHTypeInfo(data);
    for (let i = 0; i < 15; i++) {
      const mod = !test && ((bits >> i) & 1) === 1;
      if (i < 6) {
        this.modules[i][8] = mod;
      } else if (i < 8) {
        this.modules[i + 1][8] = mod;
      } else {
        this.modules[this.moduleCount - 15 + i][8] = mod;
      }

      if (i < 8) {
        this.modules[8][this.moduleCount - i - 1] = mod;
      } else if (i < 9) {
        this.modules[8][15 - i - 1 + 1] = mod;
      } else {
        this.modules[8][15 - i - 1] = mod;
      }
    }
    this.modules[this.moduleCount - 8][8] = !test;
  }

  private mapData(data: number[], maskPattern: number): void {
    let inc = -1;
    let row = this.moduleCount - 1;
    let bitIndex = 7;
    let byteIndex = 0;

    for (let col = this.moduleCount - 1; col > 0; col -= 2) {
      if (col === 6) col--;
      while (true) {
        for (let c = 0; c < 2; c++) {
          if (this.modules[row][col - c] === null) {
            let dark = false;
            if (byteIndex < data.length) {
              dark = ((data[byteIndex] >>> bitIndex) & 1) === 1;
            }
            const mask = getMask(maskPattern, row, col - c);
            if (mask) dark = !dark;
            this.modules[row][col - c] = dark;
            bitIndex--;
            if (bitIndex === -1) {
              byteIndex++;
              bitIndex = 7;
            }
          }
        }
        row += inc;
        if (row < 0 || this.moduleCount <= row) {
          row -= inc;
          inc = -inc;
          break;
        }
      }
    }
  }

  private createData(): number[] {
    const rsBlocks = QRRSBlock.getRSBlocks(this.typeNumber, this.errorCorrectLevel);
    const buffer = new QRBitBuffer();

    for (let i = 0; i < this.dataList.length; i++) {
      const s = this.dataList[i];
      buffer.put(4, 4); // 8-bit byte mode
      buffer.put(s.length, 8);
      for (let j = 0; j < s.length; j++) {
        buffer.put(s.charCodeAt(j), 8);
      }
    }

    let totalDataCount = 0;
    for (let i = 0; i < rsBlocks.length; i++) {
      totalDataCount += rsBlocks[i].dataCount;
    }

    if (buffer.length + 4 <= totalDataCount * 8) {
      buffer.put(0, 4);
    }
    while (buffer.length % 8 !== 0) {
      buffer.putBit(false);
    }

    while (true) {
      if (buffer.length >= totalDataCount * 8) break;
      buffer.put(0xec, 8);
      if (buffer.length >= totalDataCount * 8) break;
      buffer.put(0x11, 8);
    }

    return this.createBytes(buffer, rsBlocks);
  }

  private createBytes(buffer: QRBitBuffer, rsBlocks: QRRSBlock[]): number[] {
    let offset = 0;
    let maxDcCount = 0;
    let maxEcCount = 0;

    const dcdata: number[][] = new Array(rsBlocks.length);
    const ecdata: number[][] = new Array(rsBlocks.length);

    for (let r = 0; r < rsBlocks.length; r++) {
      const dcCount = rsBlocks[r].dataCount;
      const ecCount = rsBlocks[r].totalCount - dcCount;
      maxDcCount = Math.max(maxDcCount, dcCount);
      maxEcCount = Math.max(maxEcCount, ecCount);

      dcdata[r] = new Array(dcCount);
      for (let i = 0; i < dcdata[r].length; i++) {
        dcdata[r][i] = 0xff & buffer.buffer[i + offset];
      }
      offset += dcCount;

      // Generar polinomio de error Reed-Solomon
      let rsPoly = new QRPolynomial([1], 0);
      for (let i = 0; i < ecCount; i++) {
        rsPoly = rsPoly.multiply(new QRPolynomial([1, QR_MATH_EXP[i]]));
      }
      const rawPoly = new QRPolynomial(dcdata[r], rsPoly.getLength() - 1);
      const modPoly = rawPoly.mod(rsPoly);
      ecdata[r] = new Array(rsPoly.getLength() - 1);
      for (let i = 0; i < ecdata[r].length; i++) {
        const modIndex = i + modPoly.getLength() - ecdata[r].length;
        ecdata[r][i] = modIndex >= 0 ? modPoly.get(modIndex) : 0;
      }
    }

    let totalCodeCount = 0;
    for (let i = 0; i < rsBlocks.length; i++) {
      totalCodeCount += rsBlocks[i].totalCount;
    }

    const data: number[] = new Array(totalCodeCount);
    let index = 0;

    for (let i = 0; i < maxDcCount; i++) {
      for (let r = 0; r < rsBlocks.length; r++) {
        if (i < dcdata[r].length) {
          data[index++] = dcdata[r][i];
        }
      }
    }

    for (let i = 0; i < maxEcCount; i++) {
      for (let r = 0; r < rsBlocks.length; r++) {
        if (i < ecdata[r].length) {
          data[index++] = ecdata[r][i];
        }
      }
    }

    return data;
  }

  private getBestMaskPattern(): number {
    let minLostPoint = 0;
    let pattern = 0;
    for (let i = 0; i < 8; i++) {
      this.makeImpl(true, i);
      const lostPoint = getLostPoint(this.modules);
      if (i === 0 || minLostPoint > lostPoint) {
        minLostPoint = lostPoint;
        pattern = i;
      }
    }
    return pattern;
  }
}

/**
 * Función utilitaria principal: Devuelve matriz booleana del código QR
 */
export function generateQrMatrix(text: string, errorLevel: QRErrorCorrectLevel = QRErrorCorrectLevel.M): boolean[][] {
  const qr = new QRCodeModel(0, errorLevel);
  qr.addData(text);
  qr.make();
  return qr.modules.map(row => row.map(cell => Boolean(cell)));
}
