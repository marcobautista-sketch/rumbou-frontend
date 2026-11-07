import { Medal, Star, Trophy, UsersRound } from 'lucide-react'
import { useCallback, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { rankingService } from '../../api/rankingService'
import { StatTile } from '../../components/dashboard/StatTile'
import { InlineError } from '../../components/feedback/InlineError'
import { Page } from '../../components/layout/Page'
import { PageHeader } from '../../components/layout/PageHeader'
import { Button } from '../../components/ui/Button'
import { buttonStyles } from '../../components/ui/buttonStyles'
import { Card } from '../../components/ui/Card'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { EmptyState } from '../../components/ui/EmptyState'
import { Pagination } from '../../components/ui/Pagination'
import { Skeleton } from '../../components/ui/Skeleton'
import { TextField } from '../../components/ui/TextField'
import { useAuth } from '../../hooks/useAuth'
import { useFetch } from '../../hooks/useFetch'
import { usePagination } from '../../hooks/usePagination'
import { paths } from '../../routes/paths'
import type { League, LeagueEntry } from '../../types/league'
import { notify } from '../../utils/notify'
import { universityShort } from '../../utils/universityLabels'

const ALIAS_PATTERN = /^[\p{L}\d ._-]{3,20}$/u

function JoinCard({ onJoined }: { onJoined: () => void }) {
  const [alias, setAlias] = useState('')
  const [saving, setSaving] = useState(false)
  const trimmed = alias.trim()

  const join = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    try {
      await rankingService.join(trimmed)
      notify.success('Ya estás en la liga.')
      onJoined()
    } catch (error) {
      notify.error(error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Únete con un alias</h2>
        <p className="text-ink-muted">
          Participar es voluntario. Los demás solo verán tu alias y tu XP de la semana, nunca tu
          nombre. Puedes salir cuando quieras.
        </p>
      </div>
      <form onSubmit={join} className="flex flex-wrap items-start gap-3">
        <TextField
          label="Alias"
          value={alias}
          maxLength={20}
          autoComplete="off"
          hint="De 3 a 20 caracteres: letras, números, espacios, puntos o guiones."
          className="min-w-0 flex-[1_1_16rem]"
          onChange={(event) => setAlias(event.target.value)}
        />
        <Button
          type="submit"
          className="sm:mt-6"
          loading={saving}
          disabled={!ALIAS_PATTERN.test(trimmed)}
        >
          Unirme
        </Button>
      </form>
    </Card>
  )
}

function MyStanding({ league, onLeft }: { league: League; onLeft: () => void }) {
  const [confirming, setConfirming] = useState(false)
  const [leaving, setLeaving] = useState(false)

  const leave = async () => {
    setLeaving(true)
    try {
      await rankingService.leave()
      notify.success('Saliste de la liga.')
      setConfirming(false)
      onLeft()
    } catch (error) {
      notify.error(error)
    } finally {
      setLeaving(false)
    }
  }

  return (
    <section className="space-y-4" aria-label="Tu lugar en la liga">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatTile
          icon={Medal}
          label="Tu posición"
          value={league.miPosicion !== null ? `#${league.miPosicion}` : '–'}
        />
        <StatTile icon={Star} label="XP esta semana" value={`${league.miXpSemanal} XP`} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-ink-muted">
          Compites como <strong className="text-ink">{league.alias}</strong>.
          {league.miPosicion === null &&
            ' Termina un simulacro o un desafío para entrar a la tabla de esta semana.'}
        </p>
        <Button variant="secondary" size="sm" onClick={() => setConfirming(true)}>
          Salir de la liga
        </Button>
      </div>
      <ConfirmDialog
        open={confirming}
        title="¿Salir de la liga?"
        message="Tu alias dejará de aparecer. Puedes volver cuando quieras."
        confirmLabel="Salir"
        loading={leaving}
        onConfirm={leave}
        onCancel={() => setConfirming(false)}
      />
    </section>
  )
}

function EntryRow({ entry }: { entry: LeagueEntry }) {
  return (
    <li
      className={`flex items-center gap-4 px-4 py-3 ${entry.esUsuarioActual ? 'bg-chip' : ''}`}
      aria-current={entry.esUsuarioActual ? 'true' : undefined}
    >
      <span className="w-8 text-right font-semibold text-ink-muted tabular-nums">
        {entry.posicion}
      </span>
      <span className="min-w-0 flex-1 truncate font-medium">
        {entry.alias}
        {entry.esUsuarioActual && <span className="text-ink-muted"> (tú)</span>}
      </span>
      <span className="font-semibold text-primary tabular-nums">{entry.xpSemanal} XP</span>
    </li>
  )
}

export default function LeaguePage() {
  const { hasRole } = useAuth()
  const { page, apiParams, setPage, setSize } = usePagination()
  const fetchLeague = useCallback(
    (signal: AbortSignal) => rankingService.get(apiParams, signal),
    [apiParams],
  )
  const { data: league, error, loading, retry } = useFetch(fetchLeague)

  return (
    <Page>
      <PageHeader
        title="Liga semanal"
        description={
          league?.universidad
            ? `Actividad de esta semana entre quienes postulan a ${universityShort(league.universidad)}. Mide tu constancia, no tu nivel académico. Se reinicia cada lunes.`
            : 'Compara tu actividad de la semana con quienes postulan a tu misma universidad.'
        }
      />

      {error && <InlineError message={error.message} onRetry={retry} />}

      {loading && !league && (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {league && !league.universidad && (
        <EmptyState
          icon={Trophy}
          title="Elige tu carrera meta"
          message="La liga compara a quienes postulan a la misma universidad."
          action={
            <Link to={paths.careers} className={buttonStyles('primary')}>
              Elegir carrera
            </Link>
          }
        />
      )}

      {league?.universidad && (
        <>
          {league.participa ? (
            <MyStanding league={league} onLeft={() => (page > 1 ? setPage(1) : retry())} />
          ) : hasRole('USER') ? (
            <JoinCard onJoined={retry} />
          ) : (
            <p className="text-ink-muted">
              Las cuentas del equipo pueden ver la liga, pero no participan.
            </p>
          )}

          <section className="space-y-4" aria-label="Tabla de la semana">
            <h2 className="text-lg font-semibold">Tabla de la semana</h2>
            {league.entradas.totalElements === 0 ? (
              <EmptyState
                icon={UsersRound}
                title="Nadie suma XP todavía"
                message="Termina un simulacro o un desafío esta semana y sé el primero."
              />
            ) : (
              <>
                <Card className="overflow-hidden !p-0">
                  <ol className="divide-y divide-line">
                    {league.entradas.content.map((entry) => (
                      <EntryRow key={entry.posicion} entry={entry} />
                    ))}
                  </ol>
                </Card>
                <Pagination
                  page={page}
                  size={league.entradas.size}
                  totalElements={league.entradas.totalElements}
                  totalPages={league.entradas.totalPages}
                  itemLabel="participantes"
                  onPageChange={setPage}
                  onSizeChange={setSize}
                />
              </>
            )}
          </section>
        </>
      )}
    </Page>
  )
}
