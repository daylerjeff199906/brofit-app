import { Checkout } from "@/components/account-live";
export const metadata = { title: "Tu acceso · Checkout sandbox" };
export default async function Page({
  params,
}: {
  params: Promise<{ offerId: string }>;
}) {
  const { offerId } = await params;
  return <Checkout offerId={offerId} />;
}
