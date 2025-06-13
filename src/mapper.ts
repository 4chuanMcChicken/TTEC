export const digitToLetters: Record<string, string[]> = {
    2: ['A','B','C'],   3: ['D','E','F'],
    4: ['G','H','I'],   5: ['J','K','L'],
    6: ['M','N','O'],   7: ['P','Q','R','S'],
    8: ['T','U','V'],   9: ['W','X','Y','Z'],
  };
  
  export function expand(phone: string): string[] {
    const digits = phone.replace(/\D/g, '').slice(-7); 
    let combos: string[] = [''];
    for (const d of digits) {
      const letters = digitToLetters[d] ?? [d];        
      combos = combos.flatMap(p => letters.map(l => p + l));
    }
    return combos;
  }
  