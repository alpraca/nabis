import React from 'react';

export const SkeletonProductCard = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
    <div className="h-[420px] grid grid-rows-[200px_1fr_auto_auto_auto] gap-2">
      <div className="bg-gray-200 h-full w-full"></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-5 bg-gray-200 rounded w-full"></div>
        <div className="h-5 bg-gray-200 rounded w-4/5"></div>
        <div className="h-12 bg-gray-200 rounded w-full"></div>
      </div>
      <div className="px-4 py-2">
        <div className="h-5 bg-gray-200 rounded w-1/4"></div>
      </div>
      <div className="px-4 py-2">
        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="px-4 pb-4">
        <div className="h-10 bg-gray-300 rounded"></div>
      </div>
    </div>
  </div>
);

export const SkeletonProductListItem = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
    <div className="flex">
      <div className="w-48 h-48 bg-gray-200"></div>
      <div className="flex-1 p-6 space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
        <div className="flex justify-between items-end pt-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-10 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  </div>
);
