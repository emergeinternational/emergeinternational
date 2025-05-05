
/**
 * Simplified mock products hook with minimal functionality
 */
export const useMockProducts = () => {
  const handleGenerateMockProducts = async () => {
    console.log("Mock product generation temporarily disabled");
    return null;
  };
  
  return {
    handleGenerateMockProducts,
    isMockGenerating: false
  };
};
