import { genPageMetadata } from 'app/seo'
import { Container } from '~/components/ui/container'
import { PetsContent } from '~/components/pets/pets-content'

export const metadata = genPageMetadata({ title: 'Pets' })

export default function PetsPage() {
  return (
    <Container className="pt-4 lg:pt-6">
      <PetsContent />
    </Container>
  )
}
