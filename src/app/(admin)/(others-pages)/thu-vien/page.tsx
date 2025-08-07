'use client';

import React from 'react';
import { FileManager } from '@/components/file-manager/FileManager';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';

const ThuVienPage = () => {
  return (
    <>
      <PageBreadcrumb pageTitle="Thư viện" />


      <ComponentCard>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Thư viện File</h2>
          <FileManager />
        </div>
      </ComponentCard>
    </>
  );
};

export default ThuVienPage; 