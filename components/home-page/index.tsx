import { Container } from '~/components/ui/container'
import { LatestMemos } from './latest-memos'

export function Home() {
  return (
    <Container as="div" className="pt-2 lg:pt-4">
      <LatestMemos />
    </Container>
  )
}
