"use client"
import { Suspense } from "react";
import ProductDetailsSkeleton from "./productSkeleton";
import ProductDetailsContent from "./productDetails";
import { API_ROUTES } from "@/utils/api";
import axios from "axios"




type PageParams = { id: string };

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const resolvedParams = await params;

  return (
    <Suspense fallback={<ProductDetailsSkeleton />}>
      <ProductDetailsContent id={resolvedParams.id} />
    </Suspense>
  );
}

