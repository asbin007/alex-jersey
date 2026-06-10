export const teamMeta: Record<string, { flag: string; desc?: string; odds?: string }> = {
  Argentina: { flag: '🇦🇷', desc: 'Defending Champions', odds: '5/1' },
  Brazil: { flag: '🇧🇷', desc: '5× World Champions', odds: '6/1' },
  France: { flag: '🇫🇷', desc: '#1 Ranked Nation', odds: '4/1' },
  Portugal: { flag: '🇵🇹', desc: "CR7's Final Run", odds: '8/1' },
  Spain: { flag: '🇪🇸', desc: 'Euro 2024 Winners', odds: '7/1' },
  England: { flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', desc: 'Golden Generation', odds: '9/1' },
  Germany: { flag: '🇩🇪', desc: 'Die Mannschaft', odds: '10/1' },
  Netherlands: { flag: '🇳🇱', desc: 'Total Football', odds: '12/1' },
  Morocco: { flag: '🇲🇦', desc: 'Host Nation', odds: '20/1' },
  USA: { flag: '🇺🇸', desc: 'Home Ground', odds: '18/1' },
  Colombia: { flag: '🇨🇴', desc: 'South America', odds: '25/1' },
}

export function getTeamMeta(team: string) {
  return teamMeta[team] ?? { flag: '⚽', desc: 'World Cup 2026' }
}
