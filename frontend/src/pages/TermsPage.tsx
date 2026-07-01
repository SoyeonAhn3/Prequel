import LegalPage from '../components/common/LegalPage'
import { TERMS_KO } from '../content/legal'

export default function TermsPage() {
  return <LegalPage title="이용약관" content={TERMS_KO} />
}
