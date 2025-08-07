"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import OrderForm from "@/components/tables/OrderForm";
import React, { useState, useEffect } from "react";

export default function TableOrderPage({ params }: { params: Promise<{ tablesId: string }> }) {
  const [tableId, setTableId] = useState<string>("");

  useEffect(() => {
    params.then((resolvedParams) => {
      setTableId(resolvedParams.tablesId);
    });
  }, [params]);

  if (!tableId) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <PageBreadcrumb pageTitle={`Đặt Món Cho Bàn #${tableId}`} />
      <div className="space-y-6">
        <ComponentCard>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Đặt Món</h2>
            <OrderForm tableId={tableId} />
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}