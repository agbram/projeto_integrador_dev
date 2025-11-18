export class PriorityCalculator {

    static calculatePriority(quantity: number, allQuantities: number[]): 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' {
    if (allQuantities.length === 0) return 'MEDIUM';
    
    const maxQuantity = Math.max(...allQuantities);
    const minQuantity = Math.min(...allQuantities);
    const range = maxQuantity - minQuantity;
    
    // Se todas as quantidades forem iguais
    if (range === 0) return 'MEDIUM';
    
    const position = (quantity - minQuantity) / range;
    
    if (position >= 0.8) return 'URGENT';     // Top 20%
    if (position >= 0.5) return 'HIGH';        // Próximos 30%
    if (position >= 0.2) return 'MEDIUM';      // Próximos 30%
    return 'LOW';                              // Baixos 20%
  }

  /**
   * Método alternativo: prioridade baseada em quantidade absoluta
   */
  static calculatePriorityByAbsolute(quantity: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' {
    if (quantity >= 50) return 'URGENT';
    if (quantity >= 30) return 'HIGH';
    if (quantity >= 15) return 'MEDIUM';
    return 'LOW';
  }
}