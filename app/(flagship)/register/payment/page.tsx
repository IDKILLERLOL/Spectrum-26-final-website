import { getSettings } from "@/lib/server/firestore-settings"
import { RegisterPaymentStepClient } from "./RegisterPaymentStepClient"

export default async function RegisterPaymentStep() {
  const settings = await getSettings()
  return <RegisterPaymentStepClient upiVpa={settings.upiVpa} />
}
