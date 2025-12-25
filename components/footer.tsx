export default function Footer() {
  return (
    <>
      {/* Horário de Funcionamento */}
      <section className="px-6 py-12 bg-secondary/50 text-center">
        <h3 className="text-2xl font-bold mb-4">Horário de Funcionamento</h3>
        <div className="space-y-2 text-sm max-w-sm mx-auto">
          <p className="flex justify-between">
            <span>Segunda - Sexta:</span> <span className="font-semibold">6:30h - 20h</span>
          </p>
          <p className="flex justify-between">
            <span>Sábado:</span> <span className="font-semibold">7h - 17h</span>
          </p>
        </div>
      </section>

      {/* Footer */}
    </>
  )
}
