"use client";

import { Suspense } from "react";
import SuperAdminManageProductPage from "./SuperAdminManageProductPage";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuperAdminManageProductPage />
    </Suspense>
  );
}
