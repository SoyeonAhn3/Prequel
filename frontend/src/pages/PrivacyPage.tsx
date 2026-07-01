import LegalPage from '../components/common/LegalPage'
import { PRIVACY_KO } from '../content/legal'

export default function PrivacyPage() {
  return <LegalPage title="개인정보처리방침" content={PRIVACY_KO} />
}
