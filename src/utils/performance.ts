/**
 * Performance Monitoring Utility
 * Konvertatsiya tezligini o'lchash va optimizatsiya qilish
 */

interface PerformanceMetrics {
  conversionTime: number;
  inputLength: number;
  outputLength: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private readonly MAX_METRICS = 100;

  /**
   * Konvertatsiya vaqtini o'lchash
   */
  measureConversion<T>(fn: () => T, inputLength: number, outputLength: number): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();

    this.addMetric({
      conversionTime: end - start,
      inputLength,
      outputLength,
      timestamp: Date.now(),
    });

    return result;
  }

  /**
   * Metrikani qo'shish
   */
  private addMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    
    // Eski metrikalarni o'chirish
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }
  }

  /**
   * O'rtacha konvertatsiya vaqtini olish (ms)
   */
  getAverageConversionTime(): number {
    if (this.metrics.length === 0) return 0;
    
    const sum = this.metrics.reduce((acc, m) => acc + m.conversionTime, 0);
    return sum / this.metrics.length;
  }

  /**
   * So'nggi N ta konvertatsiya uchun statistika
   */
  getRecentStats(count: number = 10): {
    avgTime: number;
    minTime: number;
    maxTime: number;
    totalConversions: number;
  } {
    const recent = this.metrics.slice(-count);
    
    if (recent.length === 0) {
      return {
        avgTime: 0,
        minTime: 0,
        maxTime: 0,
        totalConversions: 0,
      };
    }

    const times = recent.map(m => m.conversionTime);
    
    return {
      avgTime: times.reduce((a, b) => a + b, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      totalConversions: recent.length,
    };
  }

  /**
   * Performance warning tekshirish
   */
  checkPerformanceWarning(): { warning: boolean; message: string } {
    const avgTime = this.getAverageConversionTime();
    
    if (avgTime > 1000) {
      return {
        warning: true,
        message: `Konvertatsiya juda sekin: ${avgTime.toFixed(0)}ms (o'rtacha)`,
      };
    }
    
    if (avgTime > 500) {
      return {
        warning: true,
        message: `Konvertatsiya sekinlashdi: ${avgTime.toFixed(0)}ms (o'rtacha)`,
      };
    }
    
    return {
      warning: false,
      message: '',
    };
  }

  /**
   * Barcha metrikalarni tozalash
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Metrikalarni export qilish
   */
  exportMetrics(): string {
    return JSON.stringify(this.metrics, null, 2);
  }

  /**
   * Barcha metrikalarni olish
   */
  getAllMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();
