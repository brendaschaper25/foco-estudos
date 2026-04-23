import Link from 'next/link'

const TECNICAS = [
  {
    nome: 'Pomodoro',
    descricao: 'Trabalhe em blocos de 25 minutos com pausas curtas de 5 minutos. A cada 4 ciclos, faça uma pausa longa de 15 a 30 minutos.',
    quando: 'Ideal para tarefas com tendência à procrastinação ou que exigem foco profundo.',
    params: 'foco=25&pausa_curta=5&pausa_longa=15&ciclos=4',
  },
  {
    nome: 'Flowtime',
    descricao: 'Estude até sentir que o foco diminuiu, sem um timer fixo. Registre o tempo ao parar e descanse proporcionalmente.',
    quando: 'Ideal para quem entra facilmente em estado de flow e odeia interrupções artificiais.',
    params: 'foco=50&pausa_curta=10&pausa_longa=30&ciclos=2',
  },
  {
    nome: 'Regra dos 2 Minutos',
    descricao: 'Se uma tarefa leva menos de 2 minutos, faça agora. Para o resto, use sessões focadas.',
    quando: 'Ótimo para limpar pendências pequenas antes de uma sessão de estudo profundo.',
    params: 'foco=25&pausa_curta=5&pausa_longa=15&ciclos=4',
  },
  {
    nome: 'Active Recall',
    descricao: 'Em vez de reler o material, feche o livro e tente lembrar ativamente o que estudou. Use flashcards, perguntas ou resumos sem consulta.',
    quando: 'Para fixar conteúdo a longo prazo. Combine com Pomodoro: recall nos últimos 5 minutos de cada ciclo.',
    params: 'foco=25&pausa_curta=5&pausa_longa=20&ciclos=3',
  },
  {
    nome: 'Spaced Repetition',
    descricao: 'Revise o conteúdo em intervalos crescentes: 1 dia, 3 dias, 1 semana, 2 semanas. O esquecimento parcial antes da revisão fortalece a memória.',
    quando: 'Para memorização de vocabulário, fórmulas, conceitos. Use com Anki ou similar.',
    params: 'foco=30&pausa_curta=5&pausa_longa=15&ciclos=4',
  },
]

export default function TecnicasPage() {
  return (
    <div className="space-y-8">
      <div className="border-b border-white/5 pb-6">
        <p className="label-dim mb-1">métodos de estudo</p>
        <h1 className="text-3xl font-black tracking-tight">Técnicas</h1>
      </div>
      <div className="space-y-4">
        {TECNICAS.map(t => (
          <div key={t.nome} className="glass glass-hover rounded-2xl p-6 space-y-3">
            <h2 className="font-bold text-lg text-white">{t.nome}</h2>
            <p className="text-gray-300 text-sm leading-relaxed">{t.descricao}</p>
            <p className="text-gray-400 text-sm"><span className="text-white/70">Quando usar:</span> {t.quando}</p>
            <Link href={`/configuracoes?${t.params}`}
              className="inline-block text-sm px-4 py-2 rounded-lg transition font-medium"
              style={{ background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.12)' }}>
              Usar esta técnica →
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
