// src/components/LoadingSpinner.tsx
import React from 'react';
import { Flex, Spin } from 'antd';
import { useSelector } from 'react-redux';
import type { RootState } from "../../../redux/store";

const LoadingSpinner: React.FC = () => {
  const isLoading = useSelector((state: RootState) => state.loading.isLoading);

  if (!isLoading) return null;

  return (
    <Flex
      align="center"
      gap="middle"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(255, 255, 255, 0.3)', // light white layer
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <Spin size="large" />
    </Flex>
  );
};

export default LoadingSpinner;
