"use client";

import React, { useContext, createContext } from 'react';

const DataContext = createContext({});

export function useDataContext() {
  return useContext(DataContext);
}

export default function DataContextProvider({ data, children }) {
  return (
    <DataContext.Provider value={data}>
      {children}
    </DataContext.Provider>
  );
}