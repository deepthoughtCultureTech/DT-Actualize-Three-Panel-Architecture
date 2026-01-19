"use client";

import { useRouter } from "next/navigation";
import DTInformationShowcase from "@/components/candidate/DTInformationShowcase";

export default function DTShowcasePage() {
  const router = useRouter();

  const handleContinue = () => {
    router.push("/candidate/dashboard");
  };

  return <DTInformationShowcase onContinue={handleContinue} />;
}
