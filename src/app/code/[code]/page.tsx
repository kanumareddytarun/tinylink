import StatsPage from '@/components/StatsPage'

export default function CodeStatsPage({
  params,
}: {
  params: { code: string }
}) {
  return <StatsPage code={params.code} />
}
